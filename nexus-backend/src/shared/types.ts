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
