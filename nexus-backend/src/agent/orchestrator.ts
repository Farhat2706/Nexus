import { v4 as uuid } from "uuid";
import { getSupabase }                      from "../services/supabase";
import { searchWeb }                        from "../services/serper";
import { scrapeUrls }                       from "../services/firecrawl";
import { planResearch, synthesizeResearch } from "../services/gemini";
import { emitToSession, isCancelled, clearCancellation } from "../websocket/wsServer";
import { ResearchQuery, ResearchSession, Source }        from "../shared/types";
import { SESSION_STATUS, MODE_SOURCE_COUNTS }            from "../shared/constants";

const sessions = new Map<string,ResearchSession>();
export function getSession(id:string):ResearchSession|undefined { return sessions.get(id); }
export function getAllSessions():ResearchSession[] { return Array.from(sessions.values()).sort((a,b)=>new Date(b.createdAt).getTime()-new Date(a.createdAt).getTime()); }

export async function startResearchSession(input:ResearchQuery):Promise<string> {
  const id=`res_${uuid().replace(/-/g,"").slice(0,12)}`;
  const s:ResearchSession={id,query:input.query,mode:input.mode,status:"pending",createdAt:new Date().toISOString()};
  sessions.set(id,s);
  persistSession(s).catch(console.error);
  runAgentLoop(id,input).catch((e)=>{ console.error(`[Agent] Fatal ${id}:`,e); emit(id,"agent:error",{code:"AGENT_FATAL",message:"Unexpected error."}); setStatus(id,"error"); });
  return id;
}

function emit(id:string, type:string, extra:Record<string,unknown>={}) { emitToSession(id,{type,sessionId:id,...extra} as never); }
function setStatus(id:string,status:string,result?:ResearchSession["result"]) { const s=sessions.get(id); if(!s) return; s.status=status as ResearchSession["status"]; if(result) s.result=result; }
function domain(url:string):string { try{return new URL(url).hostname.replace(/^www\./,"")}catch{return url} }

async function runAgentLoop(sessionId:string,input:ResearchQuery):Promise<void> {
  const t0=Date.now(); const target=MODE_SOURCE_COUNTS[input.mode]??5;
  clearCancellation(sessionId); setStatus(sessionId,"running");

  emit(sessionId,"agent:thinking",{step:1,message:"Understanding your query and planning research strategy..."});
  if(isCancelled(sessionId)){emit(sessionId,"agent:error",{code:"CANCELLED",message:"Cancelled."});setStatus(sessionId,"error");return;}

  let subQueries:string[];
  try {
    const plan=await planResearch(input.query,input.mode);
    subQueries=plan.subQueries;
    emit(sessionId,"agent:thinking",{step:2,message:`Identified ${subQueries.length} search angles. Searching the web...`});
  } catch {
    subQueries=[input.query,`${input.query} latest`,`${input.query} analysis`];
    emit(sessionId,"agent:thinking",{step:2,message:"Planning complete. Searching across multiple sources..."});
  }
  if(isCancelled(sessionId)){emit(sessionId,"agent:error",{code:"CANCELLED",message:"Cancelled."});setStatus(sessionId,"error");return;}

  emit(sessionId,"agent:thinking",{step:3,message:`Running parallel searches across ${subQueries.length} queries...`});
  const raw = (await Promise.all(
    subQueries.slice(0, 3).map(q =>
      searchWeb(q, Math.ceil(target / subQueries.length) + 2).catch(() => [])
    )
  )).flat();
  const seen=new Set<string>();
  const topUrls=raw.filter(r=>{if(seen.has(r.link))return false;seen.add(r.link);return true;}).slice(0,target).map(r=>r.link);

  if(!topUrls.length){emit(sessionId,"agent:error",{code:"NO_RESULTS",message:"No results found. Please rephrase."});setStatus(sessionId,"error");return;}
  if(isCancelled(sessionId)){emit(sessionId,"agent:error",{code:"CANCELLED",message:"Cancelled."});setStatus(sessionId,"error");return;}

  emit(sessionId,"agent:thinking",{step:4,message:`Scraping ${topUrls.length} pages in parallel...`});
  for(const url of topUrls) emit(sessionId,"agent:scraping",{url,status:"started"});

  const scraped=await scrapeUrls(topUrls,3);
  const successful=scraped.filter(s=>s.success&&s.content.length>100);
  const sources:Source[]=[];

  for(const r of successful){
    const meta=raw.find(x=>x.link===r.url);
    const src:Source={domain:domain(r.url),url:r.url,title:r.title||meta?.title||domain(r.url),snippet:meta?.snippet??r.content.slice(0,200),scrapedAt:new Date().toISOString()};
    sources.push(src);
    emit(sessionId,"agent:scraping",{url:r.url,status:"done"});
    emit(sessionId,"agent:source_added",{source:src});
  }
  for(const r of scraped.filter(s=>!s.success)) emit(sessionId,"agent:scraping",{url:r.url,status:"failed"});

  if(sources.length<2){emit(sessionId,"agent:error",{code:"SCRAPE_FAILED",message:"Not enough content retrieved. Try again."});setStatus(sessionId,"error");return;}
  if(isCancelled(sessionId)){emit(sessionId,"agent:error",{code:"CANCELLED",message:"Cancelled."});setStatus(sessionId,"error");return;}

  emit(sessionId,"agent:thinking",{step:5,message:`Cross-referencing ${sources.length} sources and synthesizing...`});
  const syn=await synthesizeResearch({query:input.query,mode:input.mode,scrapedData:successful.map(s=>({url:s.url,title:sources.find(c=>c.url===s.url)?.title??"",content:s.content}))});
  const durationMs=Date.now()-t0;
  const result={sessionId,text:syn.text,sources,citations:syn.citations,thinkingSteps:5,durationMs};

  emit(sessionId,"agent:response",{result});
  emit(sessionId,"agent:done",{durationMs});

  setStatus(sessionId,"done",result);
  persistSession(sessions.get(sessionId)!).catch(console.error);
  persistSources(sessionId,sources).catch(console.error);
  updateStats(sources.length,durationMs,5).catch(console.error);
}

async function persistSession(s:ResearchSession) {
  await getSupabase().from("research_sessions").upsert({id:s.id,query:s.query,mode:s.mode,status:s.status,result:s.result??null,created_at:s.createdAt});
}
async function persistSources(sid:string,sources:Source[]) {
  await getSupabase().from("scraped_sources").insert(sources.map(s=>({session_id:sid,domain:s.domain,url:s.url,title:s.title,snippet:s.snippet,scraped_at:s.scrapedAt})));
}
async function updateStats(srcCount:number,ms:number,steps:number) {
  const sb=getSupabase(); const today=new Date().toISOString().slice(0,10);
  const {data}=await sb.from("agent_stats").select("*").eq("id",1).single();
  if(!data){await sb.from("agent_stats").insert({id:1,queries_resolved:1,pages_scraped:srcCount,total_response_ms:ms,sessions_today:1,total_sources:srcCount,total_depth_steps:steps,updated_at:new Date().toISOString()});return;}
  await sb.from("agent_stats").update({queries_resolved:data.queries_resolved+1,pages_scraped:data.pages_scraped+srcCount,total_response_ms:data.total_response_ms+ms,sessions_today:(data.updated_at as string).slice(0,10)===today?data.sessions_today+1:1,total_sources:data.total_sources+srcCount,total_depth_steps:data.total_depth_steps+steps,updated_at:new Date().toISOString()}).eq("id",1);
}
