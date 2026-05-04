import rateLimit from "express-rate-limit";
import { config } from "../config";
const noop=(_:unknown,__:unknown,next:()=>void)=>next();
export const apiRateLimiter=config.isDev?noop:rateLimit({windowMs:60000,max:60,standardHeaders:true,legacyHeaders:false,message:{error:"Too many requests.",code:"RATE_LIMITED"}});
export const researchRateLimiter=config.isDev?noop:rateLimit({windowMs:60000,max:10,standardHeaders:true,legacyHeaders:false,message:{error:"Research rate limit reached.",code:"RESEARCH_RATE_LIMITED"}});
