export const WS_EVENTS = { THINKING:"agent:thinking", SCRAPING:"agent:scraping", SOURCE_ADDED:"agent:source_added", RESPONSE:"agent:response", ERROR:"agent:error", DONE:"agent:done", CANCEL:"client:cancel", PING:"client:ping" } as const;
export const SESSION_STATUS = { PENDING:"pending", RUNNING:"running", DONE:"done", ERROR:"error" } as const;
export const MEMORY_TYPES = { ENTITY:"entity", PREFERENCE:"preference", FACT:"fact", SUMMARY:"summary" } as const;
export const DEFAULTS = { HISTORY_LIMIT:20, MIN_SOURCES:3, MAX_SOURCES:10, WS_PING_INTERVAL:30_000, REQUEST_TIMEOUT:30_000 } as const;
export const MODE_SOURCE_COUNTS: Record<string,number> = { fast:3, deep:7, scholar:6, live:5 };
