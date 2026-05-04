#!/bin/bash
# ─────────────────────────────────────────────────────────────
#  NEXUS Backend — one-shot setup script
#  Run this from your project root folder (e.g. inside nexus/)
#  Usage:  bash setup-nexus-backend.sh
# ─────────────────────────────────────────────────────────────
set -e
echo "🔧 Creating NEXUS backend..."

mkdir -p nexus-backend/src/{agent,services,websocket,routes,middleware,shared}

# package.json
cat > nexus-backend/package.json << 'EOF'
{
  "name": "nexus-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node-dev --respawn --transpile-only src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@google/generative-ai": "^0.21.0",
    "@supabase/supabase-js": "^2.45.0",
    "axios": "^1.7.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.0",
    "express-rate-limit": "^7.4.0",
    "uuid": "^10.0.0",
    "ws": "^8.18.0"
  },
  "devDependencies": {
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/node": "^22.7.4",
    "@types/uuid": "^10.0.0",
    "@types/ws": "^8.5.12",
    "ts-node-dev": "^2.0.0",
    "typescript": "^5.6.2"
  }
}
EOF

# tsconfig.json
cat > nexus-backend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020","module": "commonjs","lib": ["ES2020"],
    "outDir": "./dist","rootDir": "./src","strict": true,
    "esModuleInterop": true,"skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,"resolveJsonModule": true,"sourceMap": true
  },
  "include": ["src/**/*"],"exclude": ["node_modules","dist"]
}
EOF

# .env.example
cat > nexus-backend/.env.example << 'EOF'
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
FIRECRAWL_API_URL=https://api.firecrawl.dev/v1
SERPER_API_KEY=your_serper_api_key_here
SERPER_API_URL=https://google.serper.dev/search
SUPABASE_URL=your_supabase_project_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
EOF

# shared/types.ts
cat > nexus-backend/src/shared/types.ts << 'EOF'
export type ResearchMode = "fast" | "deep" | "scholar" | "live";
export interface ResearchQuery { query: string; mode: ResearchMode; sources: string[]; }
export interface Source { domain: string; url: string; title: string; snippet: string; scrapedAt: string; }
export interface Citation { index: number; claim: string; }
export interface ResearchResult { sessionId: string; text: string; sources: Source[]; citations: Citation[]; thinkingSteps: number; durationMs: number; }
export type SessionStatus = "pending" | "running" | "done" | "error";
export interface ResearchSession { id: string; query: string; mode: ResearchMode; result?: ResearchResult; status: SessionStatus; createdAt: string; }
export type MemoryItemType = "entity" | "preference" | "fact" | "summary";
export interface MemoryItem { id: string; key: string; value: string; type: MemoryItemType; createdAt: string; }
export interface Insight { id: string; icon: string; title: string; description: string; }
export interface AgentStats { queriesResolved: number; pagesScraped: number; avgResponseMs: number; sessionsToday: number; avgSourcesPerQuery: number; avgDepthSteps: number; }
export type APIStatus = "ok" | "slow" | "error";
export interface APIUsage { name: string; used: number; limit: number; unit: string; status: APIStatus; }
export interface APISuccessResponse<T> { data: T; }
export interface APIErrorResponse { error: string; code?: string; }
export type APIResponse<T> = APISuccessResponse<T> | APIErrorResponse;
export interface WSThinkingPayload    { type: "agent:thinking";    sessionId: string; step: number; message: string; }
export interface WSScrapingPayload    { type: "agent:scraping";    sessionId: string; url: string; status: "started"|"done"|"failed"; }
export interface WSSourceAddedPayload { type: "agent:source_added";sessionId: string; source: Source; }
export interface WSResponsePayload    { type: "agent:response";    sessionId: string; result: ResearchResult; }
export interface WSErrorPayload       { type: "agent:error";       sessionId: string; code: string; message: string; }
export interface WSDonePayload        { type: "agent:done";        sessionId: string; durationMs: number; }
export type WSServerMessage = WSThinkingPayload|WSScrapingPayload|WSSourceAddedPayload|WSResponsePayload|WSErrorPayload|WSDonePayload;
EOF

# shared/constants.ts
cat > nexus-backend/src/shared/constants.ts << 'EOF'
export const WS_EVENTS = { THINKING:"agent:thinking", SCRAPING:"agent:scraping", SOURCE_ADDED:"agent:source_added", RESPONSE:"agent:response", ERROR:"agent:error", DONE:"agent:done", CANCEL:"client:cancel", PING:"client:ping" } as const;
export const SESSION_STATUS = { PENDING:"pending", RUNNING:"running", DONE:"done", ERROR:"error" } as const;
export const MEMORY_TYPES = { ENTITY:"entity", PREFERENCE:"preference", FACT:"fact", SUMMARY:"summary" } as const;
export const DEFAULTS = { HISTORY_LIMIT:20, MIN_SOURCES:3, MAX_SOURCES:10, WS_PING_INTERVAL:30_000, REQUEST_TIMEOUT:30_000 } as const;
export const MODE_SOURCE_COUNTS: Record<string,number> = { fast:3, deep:7, scholar:6, live:5 };
EOF

# src/config.ts
cat > nexus-backend/src/config.ts << 'EOF'
import dotenv from "dotenv";
dotenv.config();
function required(key: string): string { const v=process.env[key]; if(!v) throw new Error(`Missing env: ${key}`); return v; }
function optional(key: string, fb: string): string { return process.env[key]??fb; }
export const config = {
  port: parseInt(optional("PORT","3001"),10),
  nodeEnv: optional("NODE_ENV","development"),
  isDev: optional("NODE_ENV","development")==="development",
  corsOrigin: optional("CORS_ORIGIN","http://localhost:5173"),
  gemini:    { apiKey: required("GEMINI_API_KEY"),    model: "gemini-2.0-flash-exp" },
  firecrawl: { apiKey: required("FIRECRAWL_API_KEY"), apiUrl: optional("FIRECRAWL_API_URL","https://api.firecrawl.dev/v1") },
  serper:    { apiKey: required("SERPER_API_KEY"),    apiUrl: optional("SERPER_API_URL","https://google.serper.dev/search") },
  supabase:  { url: required("SUPABASE_URL"),         anonKey: required("SUPABASE_ANON_KEY") },
} as const;
EOF

# src/services/supabase.ts
cat > nexus-backend/src/services/supabase.ts << 'EOF'
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config";
let _c: SupabaseClient|null=null;
export function getSupabase(): SupabaseClient { if(!_c) _c=createClient(config.supabase.url,config.supabase.anonKey); return _c; }
EOF

# src/services/serper.ts
cat > nexus-backend/src/services/serper.ts << 'EOF'
import axios from "axios";
import { config } from "../config";
export interface SerperSearchResult { title:string; link:string; snippet:string; domain:string; }
interface OrganicResult { title:string; link:string; snippet?:string; }
export async function searchWeb(query:string, numResults:number=10): Promise<SerperSearchResult[]> {
  const r = await axios.post<{organic?:OrganicResult[]}>(config.serper.apiUrl, {q:query,num:numResults}, { headers:{"X-API-KEY":config.serper.apiKey,"Content-Type":"application/json"}, timeout:10_000 });
  return (r.data.organic??[]).map(i=>({ title:i.title, link:i.link, snippet:i.snippet??"", domain:domain(i.link) }));
}
function domain(url:string):string { try{return new URL(url).hostname.replace(/^www\./,"")}catch{return url} }
EOF

# src/services/firecrawl.ts
cat > nexus-backend/src/services/firecrawl.ts << 'EOF'
import axios from "axios";
import { config } from "../config";
export interface ScrapeResult { url:string; content:string; title:string; success:boolean; }
export async function scrapeUrl(url:string): Promise<ScrapeResult> {
  try {
    const r = await axios.post<{success:boolean;data?:{markdown?:string;metadata?:{title?:string}}}>(
      `${config.firecrawl.apiUrl}/scrape`,
      {url, formats:["markdown"], onlyMainContent:true, timeout:15000},
      {headers:{Authorization:`Bearer ${config.firecrawl.apiKey}`,"Content-Type":"application/json"}, timeout:20_000}
    );
    if(!r.data.success||!r.data.data) return {url,content:"",title:"",success:false};
    return {url, content:r.data.data.markdown??"", title:r.data.data.metadata?.title??titleFromUrl(url), success:true};
  } catch { return {url,content:"",title:titleFromUrl(url),success:false}; }
}
export async function scrapeUrls(urls:string[], concurrency:number=3): Promise<ScrapeResult[]> {
  const res:ScrapeResult[]=[];
  for(let i=0;i<urls.length;i+=concurrency) res.push(...await Promise.all(urls.slice(i,i+concurrency).map(scrapeUrl)));
  return res;
}
function titleFromUrl(url:string):string { try{const u=new URL(url);return u.pathname.split("/").filter(Boolean).pop()?.replace(/-|_/g," ")||u.hostname}catch{return url} }
EOF

# src/services/gemini.ts
cat > nexus-backend/src/services/gemini.ts << 'EOF'
import { GoogleGenerativeAI, GenerativeModel, GenerationConfig } from "@google/generative-ai";
import { config } from "../config";
import { ResearchMode, Citation } from "../shared/types";

let _m:GenerativeModel|null=null;
function getModel():GenerativeModel { if(!_m) _m=new GoogleGenerativeAI(config.gemini.apiKey).getGenerativeModel({model:config.gemini.model}); return _m; }
const gc:GenerationConfig={temperature:0.7,topK:40,topP:0.95,maxOutputTokens:4096};

const modeInstructions:Record<ResearchMode,string>={
  fast:"Generate 2-3 focused search queries for a quick factual answer.",
  deep:"Generate 5-7 diverse search queries covering multiple angles.",
  scholar:"Generate 4-6 academic search queries. Prioritize arxiv.org, nature.com, pubmed.",
  live:"Generate 4-5 queries focused on the most recent news and developments.",
};
const domainHints:Record<ResearchMode,string[]>={
  fast:["wikipedia.org","britannica.com","techcrunch.com"],
  deep:["arxiv.org","nature.com","techcrunch.com","wired.com","github.com"],
  scholar:["arxiv.org","nature.com","pubmed.ncbi.nlm.nih.gov","semanticscholar.org"],
  live:["techcrunch.com","wired.com","bloomberg.com","reuters.com","theverge.com"],
};

export async function planResearch(query:string,mode:ResearchMode):Promise<{subQueries:string[];targetDomains:string[]}> {
  const prompt=`You are a research planner.\nQuery: "${query}"\nMode: ${mode}\n${modeInstructions[mode]}\nReturn ONLY JSON: {"subQueries":["q1","q2"],"targetDomains":["d1.com"]}\nNo markdown.`;
  try {
    const r=await getModel().generateContent({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{...gc,temperature:0.3,maxOutputTokens:512}});
    const p=JSON.parse(r.response.text().replace(/\`\`\`json|\`\`\`/g,"").trim());
    return {subQueries:p.subQueries??[query],targetDomains:p.targetDomains??domainHints[mode]};
  } catch { return {subQueries:[query,`${query} latest`,`${query} analysis`],targetDomains:domainHints[mode]}; }
}

export interface SynthesisInput { query:string; mode:ResearchMode; scrapedData:Array<{url:string;title:string;content:string}>; }
export interface SynthesisOutput { text:string; citations:Citation[]; }

const modeStyle:Record<ResearchMode,string>={
  fast:"Provide a concise, direct answer in 2-3 paragraphs.",
  deep:"Provide a comprehensive structured analysis with clear sections.",
  scholar:"Write in academic tone with precise terminology.",
  live:"Focus on the most recent developments. Emphasise what is new.",
};

export async function synthesizeResearch(input:SynthesisInput):Promise<SynthesisOutput> {
  const sourcesText=input.scrapedData.map((s,i)=>`SOURCE [${i+1}] — ${s.title}\nURL: ${s.url}\n\nCONTENT:\n${s.content.slice(0,3000)}`).join("\n\n---\n\n");
  const prompt=`You are NEXUS, an autonomous deep research agent.\n\nUSER QUERY: "${input.query}"\n\nSCRAPED SOURCES:\n${sourcesText}\n\nINSTRUCTIONS:\n- ${modeStyle[input.mode]}\n- Base response ONLY on provided sources.\n- Mark claims with [N] for source number.\n- End with "Key Takeaways" bullet list.\n\nAfter response output:\nCITATIONS_JSON:\n[{"index":0,"claim":"sentence using source 1"}]`;
  const r=await getModel().generateContent({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{...gc,maxOutputTokens:4096}});
  const full=r.response.text();
  const parts=full.split("CITATIONS_JSON:");
  let citations:Citation[]=[];
  try { citations=JSON.parse((parts[1]??"[]").replace(/\`\`\`json|\`\`\`/g,"").trim()); } catch { citations=[]; }
  return {text:parts[0]?.trim()??full,citations};
}

export async function generateInsights(sessions:Array<{query:string;sourceCount:number}>):Promise<Array<{title:string;description:string}>> {
  if(!sessions.length) return [];
  const history=sessions.map(s=>`- "${s.query}" (${s.sourceCount} sources)`).join("\n");
  const prompt=`Review this research history and generate 4 insight cards.\n${history}\nReturn ONLY JSON array:\n[{"title":"short title","description":"one sentence under 15 words"}]\nNo markdown.`;
  try {
    const r=await getModel().generateContent({contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{...gc,temperature:0.5,maxOutputTokens:512}});
    return JSON.parse(r.response.text().replace(/\`\`\`json|\`\`\`/g,"").trim());
  } catch {
    return [{title:"Research active",description:"Your agent has been processing queries successfully."},{title:"Sources aggregated",description:"Multiple domains have been cross-referenced."}];
  }
}
EOF

# src/websocket/wsServer.ts
cat > nexus-backend/src/websocket/wsServer.ts << 'EOF'
import { WebSocketServer, WebSocket } from "ws";
import { IncomingMessage } from "http";
import { Server } from "http";
import { WSServerMessage } from "../shared/types";

const sessionClients   = new Map<string,Set<WebSocket>>();
const cancelledSessions = new Set<string>();

export function createWsServer(httpServer:Server):WebSocketServer {
  const wss=new WebSocketServer({server:httpServer,path:"/ws"});
  wss.on("connection",(ws:WebSocket,req:IncomingMessage)=>{
    const sessionId=req.url?.match(/^\/ws\/([^/?#]+)/)?.[1]??null;
    if(!sessionId){ws.close(1008,"Missing sessionId");return;}
    if(!sessionClients.has(sessionId)) sessionClients.set(sessionId,new Set());
    sessionClients.get(sessionId)!.add(ws);
    console.log(`[WS] Connected — session: ${sessionId}`);
    ws.on("message",(data)=>{
      try {
        const msg=JSON.parse(data.toString()) as {type:string;sessionId:string};
        if(msg.type==="client:cancel") cancelledSessions.add(msg.sessionId);
        if(msg.type==="client:ping")   ws.send(JSON.stringify({type:"server:pong",ts:Date.now()}));
      } catch {}
    });
    ws.on("close",()=>{ sessionClients.get(sessionId)?.delete(ws); if(!sessionClients.get(sessionId)?.size) sessionClients.delete(sessionId); });
    ws.on("error",(e)=>console.error(`[WS] Error ${sessionId}:`,e.message));
  });
  return wss;
}

export function emitToSession(sessionId:string,payload:WSServerMessage):void {
  const json=JSON.stringify(payload);
  for(const c of sessionClients.get(sessionId)??[]) if(c.readyState===WebSocket.OPEN) c.send(json);
}
export function markCancelled(id:string):void   { cancelledSessions.add(id); }
export function isCancelled(id:string):boolean  { return cancelledSessions.has(id); }
export function clearCancellation(id:string):void { cancelledSessions.delete(id); }
EOF

# src/agent/orchestrator.ts
cat > nexus-backend/src/agent/orchestrator.ts << 'EOF'
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
  const raw=(await Promise.all(subQueries.slice(0,3).map(q=>searchWeb(q,Math.ceil(target/subQueries.length)+2).catch(():[])))).flat();
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
EOF

# src/middleware/cors.ts
cat > nexus-backend/src/middleware/cors.ts << 'EOF'
import cors from "cors";
import { config } from "../config";
export const corsMiddleware=cors({origin:config.corsOrigin,methods:["GET","POST","PUT","DELETE","OPTIONS"],allowedHeaders:["Content-Type","Authorization"],credentials:true});
EOF

# src/middleware/rateLimit.ts
cat > nexus-backend/src/middleware/rateLimit.ts << 'EOF'
import rateLimit from "express-rate-limit";
import { config } from "../config";
const noop=(_:unknown,__:unknown,next:()=>void)=>next();
export const apiRateLimiter=config.isDev?noop:rateLimit({windowMs:60000,max:60,standardHeaders:true,legacyHeaders:false,message:{error:"Too many requests.",code:"RATE_LIMITED"}});
export const researchRateLimiter=config.isDev?noop:rateLimit({windowMs:60000,max:10,standardHeaders:true,legacyHeaders:false,message:{error:"Research rate limit reached.",code:"RESEARCH_RATE_LIMITED"}});
EOF

# src/routes/research.ts
cat > nexus-backend/src/routes/research.ts << 'EOF'
import { Router, Request, Response } from "express";
import { startResearchSession, getSession, getAllSessions } from "../agent/orchestrator";
import { researchRateLimiter } from "../middleware/rateLimit";
import { ResearchQuery } from "../shared/types";
import { DEFAULTS } from "../shared/constants";
const router=Router();

router.post("/query",researchRateLimiter,async(req:Request,res:Response)=>{
  const {query,mode,sources}=req.body as Partial<ResearchQuery>;
  if(!query||typeof query!=="string"||!query.trim()){res.status(400).json({error:"query is required",code:"INVALID_QUERY"});return;}
  const validModes=["fast","deep","scholar","live"];
  try {
    const sessionId=await startResearchSession({query:query.trim(),mode:validModes.includes(mode??"")?mode as ResearchQuery["mode"]:"deep",sources:Array.isArray(sources)?sources:[]});
    res.status(201).json({data:{sessionId}});
  } catch(e){console.error("[Route] POST /research/query:",e);res.status(500).json({error:"Failed to start session",code:"SESSION_START_FAILED"});}
});

router.get("/session/:id",(req:Request,res:Response)=>{
  const s=getSession(req.params.id);
  if(!s){res.status(404).json({error:"Session not found",code:"SESSION_NOT_FOUND"});return;}
  res.json({data:s});
});

router.get("/history",(req:Request,res:Response)=>{
  const limit=Math.min(parseInt(String(req.query.limit??DEFAULTS.HISTORY_LIMIT),10),100);
  const offset=parseInt(String(req.query.offset??0),10);
  const all=getAllSessions();
  res.json({data:all.slice(offset,offset+limit),meta:{total:all.length,limit,offset}});
});
export default router;
EOF

# src/routes/memory.ts
cat > nexus-backend/src/routes/memory.ts << 'EOF'
import { Router, Request, Response } from "express";
import { v4 as uuid } from "uuid";
import { getSupabase } from "../services/supabase";
import { generateInsights } from "../services/gemini";
import { getAllSessions } from "../agent/orchestrator";
import { MemoryItem } from "../shared/types";
const router=Router();

router.get("/",async(_req:Request,res:Response)=>{
  const {data,error}=await getSupabase().from("memory_items").select("*").order("created_at",{ascending:false});
  if(error){res.status(500).json({error:"Failed to fetch memory",code:"DB_ERROR"});return;}
  res.json({data:(data??[]).map(r=>({id:r.id,key:r.key,value:r.value,type:r.type,createdAt:r.created_at}))});
});

router.post("/",async(req:Request,res:Response)=>{
  const {key,value,type}=req.body as Partial<MemoryItem>;
  if(!key||!value||!type){res.status(400).json({error:"key, value and type are required",code:"INVALID_BODY"});return;}
  const {data,error}=await getSupabase().from("memory_items").upsert({id:uuid(),key,value,type,created_at:new Date().toISOString()},{onConflict:"key"}).select().single();
  if(error){res.status(500).json({error:"Failed to save memory",code:"DB_ERROR"});return;}
  res.status(201).json({data:{id:data.id,key:data.key,value:data.value,type:data.type,createdAt:data.created_at}});
});

router.get("/insights",async(_req:Request,res:Response)=>{
  const sessions=getAllSessions().filter(s=>s.status==="done").slice(0,20).map(s=>({query:s.query,sourceCount:s.result?.sources.length??0}));
  const icons=["🧠","📊","⚡","🎯","🔍","💡"];
  try {
    const raw=await generateInsights(sessions);
    res.json({data:raw.map((r,i)=>({id:`insight_${i}`,icon:icons[i%icons.length],title:r.title,description:r.description}))});
  } catch {
    res.json({data:[{id:"i0",icon:"🧠",title:"Research active",description:"Your agent has been processing queries successfully."},{id:"i1",icon:"📊",title:"Sources aggregated",description:"Multiple domains cross-referenced."},{id:"i2",icon:"⚡",title:"Speed optimised",description:"Parallel scraping active."},{id:"i3",icon:"🎯",title:"Citations tracked",description:"All claims traceable to sources."}]});
  }
});
export default router;
EOF

# src/routes/sources.ts
cat > nexus-backend/src/routes/sources.ts << 'EOF'
import { Router, Request, Response } from "express";
import { getSupabase } from "../services/supabase";
import { getAllSessions } from "../agent/orchestrator";
import { Source } from "../shared/types";
const router=Router();

router.get("/",async(_req:Request,res:Response)=>{
  try {
    const {data,error}=await getSupabase().from("scraped_sources").select("*").order("scraped_at",{ascending:false}).limit(200);
    if(error) throw error;
    res.json({data:(data??[]).map(r=>({domain:r.domain,url:r.url,title:r.title??r.domain,snippet:r.snippet??"",scrapedAt:r.scraped_at}))});
  } catch {
    const sources:Source[]=getAllSessions().filter(s=>s.result?.sources).flatMap(s=>s.result!.sources);
    const seen=new Set<string>();
    res.json({data:sources.filter(s=>{if(seen.has(s.url))return false;seen.add(s.url);return true;})});
  }
});
export default router;
EOF

# src/routes/stats.ts
cat > nexus-backend/src/routes/stats.ts << 'EOF'
import { Router, Request, Response } from "express";
import { getSupabase } from "../services/supabase";
import { getAllSessions } from "../agent/orchestrator";
import { AgentStats, APIUsage } from "../shared/types";
const router=Router();

router.get("/",async(_req:Request,res:Response)=>{
  try {
    const {data,error}=await getSupabase().from("agent_stats").select("*").eq("id",1).single();
    if(error||!data) throw new Error("no row");
    const q=data.queries_resolved as number;
    res.json({data:{queriesResolved:q,pagesScraped:data.pages_scraped,avgResponseMs:q>0?Math.round(data.total_response_ms/q):0,sessionsToday:data.sessions_today,avgSourcesPerQuery:q>0?parseFloat((data.total_sources/q).toFixed(1)):0,avgDepthSteps:q>0?parseFloat((data.total_depth_steps/q).toFixed(1)):0} as AgentStats});
  } catch {
    const sessions=getAllSessions(),done=sessions.filter(s=>s.status==="done"),today=new Date().toISOString().slice(0,10);
    const ms=done.reduce((a,s)=>a+(s.result?.durationMs??0),0),src=done.reduce((a,s)=>a+(s.result?.sources.length??0),0),stp=done.reduce((a,s)=>a+(s.result?.thinkingSteps??0),0);
    res.json({data:{queriesResolved:done.length,pagesScraped:src,avgResponseMs:done.length>0?Math.round(ms/done.length):0,sessionsToday:sessions.filter(s=>s.createdAt.startsWith(today)).length,avgSourcesPerQuery:done.length>0?parseFloat((src/done.length).toFixed(1)):0,avgDepthSteps:done.length>0?parseFloat((stp/done.length).toFixed(1)):0} as AgentStats});
  }
});

router.get("/api-usage",async(_req:Request,res:Response)=>{
  const sessions=getAllSessions(),done=sessions.filter(s=>s.status==="done").length,src=sessions.reduce((a,s)=>a+(s.result?.sources.length??0),0);
  const usage:APIUsage[]=[
    {name:"Gemini 2.0 Flash",used:done*2,    limit:1500, unit:"req/day", status:done*2>1200?"slow":"ok"},
    {name:"Firecrawl",       used:src,        limit:500,  unit:"pages",   status:src>400?"slow":"ok"},
    {name:"Serper",          used:done*3,     limit:2500, unit:"searches",status:done*3>2000?"slow":"ok"},
    {name:"Supabase",        used:sessions.length,limit:50000,unit:"rows",status:"ok"},
  ];
  res.json({data:usage});
});
export default router;
EOF

# src/index.ts
cat > nexus-backend/src/index.ts << 'EOF'
import "dotenv/config";
import express            from "express";
import http               from "http";
import { corsMiddleware } from "./middleware/cors";
import { apiRateLimiter } from "./middleware/rateLimit";
import { createWsServer } from "./websocket/wsServer";
import researchRouter     from "./routes/research";
import memoryRouter       from "./routes/memory";
import sourcesRouter      from "./routes/sources";
import statsRouter        from "./routes/stats";
import { config }         from "./config";

const app=express(), httpServer=http.createServer(app);
app.use(corsMiddleware);
app.use(express.json({limit:"1mb"}));
app.use(apiRateLimiter as express.RequestHandler);
app.get("/health",(_req,res)=>res.json({status:"ok",agent:"active",timestamp:new Date().toISOString(),env:config.nodeEnv}));
const api=express.Router();
api.use("/research",researchRouter);
api.use("/memory",  memoryRouter);
api.use("/sources", sourcesRouter);
api.use("/stats",   statsRouter);
app.use("/api/v1",api);
app.use((_req,res)=>res.status(404).json({error:"Not found",code:"NOT_FOUND"}));
app.use((err:Error,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{ console.error("[Server]",err.message); res.status(500).json({error:"Internal error",code:"INTERNAL_ERROR"}); });
createWsServer(httpServer);
httpServer.listen(config.port,()=>{
  console.log(`\n╔═══════════════════════════════════════╗\n║  NEXUS Backend running on :${config.port}      ║\n║  ENV : ${config.nodeEnv.padEnd(29)}║\n║  CORS: ${config.corsOrigin.padEnd(29)}║\n╚═══════════════════════════════════════╝\n`);
});
export default app;
EOF

echo ""
echo "✅  nexus-backend/ created with all $(find nexus-backend -name '*.ts' -o -name '*.json' | wc -l) files."
echo ""
echo "Next:"
echo "  cd nexus-backend"
echo "  cp .env.example .env   ← fill in your 4 API keys"
echo "  npm install"
echo "  npm run dev"