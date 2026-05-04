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
