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

router.get("/session/:id", (req: Request<{ id: string }>, res: Response) => {
  const s = getSession(req.params.id);
  if (!s) {
    res.status(404).json({ error: "Session not found", code: "SESSION_NOT_FOUND" });
    return;
  }
  res.json({ data: s });
});

router.get("/history",(req:Request,res:Response)=>{
  const limit=Math.min(parseInt(String(req.query.limit??DEFAULTS.HISTORY_LIMIT),10),100);
  const offset=parseInt(String(req.query.offset??0),10);
  const all=getAllSessions();
  res.json({data:all.slice(offset,offset+limit),meta:{total:all.length,limit,offset}});
});
export default router;
