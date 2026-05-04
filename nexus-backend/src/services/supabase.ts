import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config";
let _c: SupabaseClient|null=null;
export function getSupabase(): SupabaseClient { if(!_c) _c=createClient(config.supabase.url,config.supabase.anonKey); return _c; }
