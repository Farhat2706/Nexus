import axios from "axios";
import { config } from "../config";
export interface SerperSearchResult { title:string; link:string; snippet:string; domain:string; }
interface OrganicResult { title:string; link:string; snippet?:string; }
export async function searchWeb(query:string, numResults:number=10): Promise<SerperSearchResult[]> {
  const r = await axios.post<{organic?:OrganicResult[]}>(config.serper.apiUrl, {q:query,num:numResults}, { headers:{"X-API-KEY":config.serper.apiKey,"Content-Type":"application/json"}, timeout:10_000 });
  return (r.data.organic??[]).map(i=>({ title:i.title, link:i.link, snippet:i.snippet??"", domain:domain(i.link) }));
}
function domain(url:string):string { try{return new URL(url).hostname.replace(/^www\./,"")}catch{return url} }
