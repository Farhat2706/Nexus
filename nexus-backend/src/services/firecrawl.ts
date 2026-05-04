import axios from "axios";
import { config } from "../config";
export interface ScrapeResult { url:string; content:string; title:string; success:boolean; }
export async function scrapeUrl(url:string): Promise<ScrapeResult> {
  try {
    const r = await axios.post<{success:boolean;data?:{markdown?:string;metadata?:{title?:string}}}>(
      `${config.firecrawl.apiUrl}/scrape`,
      {url, formats:["markdown"], onlyMainContent:true, timeout:15000},
      {headers:{Authorization:`Bearer ${config.firecrawl.apiKey}`,"Content-Type":"application/json"}, timeout:20_000}
    );
    if(!r.data.success||!r.data.data) return {url,content:"",title:"",success:false};
    return {url, content:r.data.data.markdown??"", title:r.data.data.metadata?.title??titleFromUrl(url), success:true};
  } catch { return {url,content:"",title:titleFromUrl(url),success:false}; }
}
export async function scrapeUrls(urls:string[], concurrency:number=3): Promise<ScrapeResult[]> {
  const res:ScrapeResult[]=[];
  for(let i=0;i<urls.length;i+=concurrency) res.push(...await Promise.all(urls.slice(i,i+concurrency).map(scrapeUrl)));
  return res;
}
function titleFromUrl(url:string):string { try{const u=new URL(url);return u.pathname.split("/").filter(Boolean).pop()?.replace(/-|_/g," ")||u.hostname}catch{return url} }
