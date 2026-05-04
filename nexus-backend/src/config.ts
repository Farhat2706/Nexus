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
