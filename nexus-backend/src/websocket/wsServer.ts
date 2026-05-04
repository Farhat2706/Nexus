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
