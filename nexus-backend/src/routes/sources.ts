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
