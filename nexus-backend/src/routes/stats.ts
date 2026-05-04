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
