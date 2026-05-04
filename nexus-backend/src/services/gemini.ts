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
