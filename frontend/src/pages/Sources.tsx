export default function Sources() {
  const sources = [
    {
      icon: '📄', url: 'arxiv.org/abs/2501.04012',
      title: 'AgentBench 2.0: Evaluating LLMs as Multi-Step Reasoning Agents',
      snippet: 'Comprehensive benchmark for evaluating autonomous AI agents across 47 task categories requiring 3–12 sequential reasoning steps.',
      tags: ['Academic', 'AI Agents'], reliability: 95, tagClasses: ['badge-violet', 'badge-cyan'],
    },
    {
      icon: '📰', url: 'techcrunch.com/2025/01/14/...',
      title: 'Firecrawl MCP Integration Lets AI Agents Scrape the Web in Real Time',
      snippet: 'Firecrawl\'s new MCP server enables any compatible LLM to autonomously browse, extract, and synthesize structured data from any URL.',
      tags: ['News', 'MCP'], reliability: 82, tagClasses: ['badge-amber', 'badge-cyan'],
    },
    {
      icon: '🐙', url: 'github.com/mendableai/firecrawl',
      title: 'Firecrawl — Turn websites into LLM-ready markdown',
      snippet: 'Open-source web scraping API with MCP server support. Features: /scrape, /crawl, /search endpoints, structured JSON extraction.',
      tags: ['Technical', 'Open Source'], reliability: 90, tagClasses: ['badge-emerald', 'badge-cyan'],
    },
  ];

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
            Sources & <span style={{ background: 'linear-gradient(90deg,var(--cyan),var(--violet))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Citations</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 8 }}>// aggregated web data with reliability scoring</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge badge-violet">1,684 pages indexed</span>
          <span className="badge badge-cyan">6 active queries</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)', fontSize: 16 }}>🔍</span>
            <input placeholder="Search sources, domains, or topics..." style={{
              width: '100%', padding: '14px 20px 14px 50px',
              background: 'var(--glass)', border: '1px solid var(--glass-border)',
              borderRadius: 14, color: 'var(--text)', fontFamily: 'var(--font-mono)',
              fontSize: 13, outline: 'none',
            }} />
          </div>

          {sources.map((src, i) => (
            <div key={i} className="float-card" style={{ padding: 24, cursor: 'pointer' }}>
              <div style={{ display: 'flex', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: 'var(--glass)', border: '1px solid var(--glass-border)', flexShrink: 0 }}>{src.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: 'var(--cyan)', fontFamily: 'var(--font-mono)', marginBottom: 4 }}>{src.url}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, marginBottom: 6 }}>{src.title}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>{src.snippet}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
                <div style={{ display: 'flex', gap: 6 }}>
                  {src.tags.map((tag, j) => (
                    <span key={j} className={`badge ${src.tagClasses[j]}`}>{tag}</span>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  <span>Reliability</span>
                  <div style={{ width: 60, height: 4, background: 'var(--glass-border)', borderRadius: 2, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${src.reliability}%`, background: 'linear-gradient(90deg,var(--cyan),var(--violet))', borderRadius: 2 }}></div>
                  </div>
                  <span style={{ color: 'var(--cyan)' }}>{src.reliability}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Citation panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="float-card" style={{ padding: 24 }}>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>// Citation Index</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {['arxiv.org — AgentBench 2.0 · Jan 2025', 'deepmind.com — Gemini 2.0 Technical Report', 'anthropic.com — MCP Specification v1.2', 'techcrunch.com — Firecrawl MCP launch', 'nature.com — AI reasoning meta-analysis', 'openai.com — o3 technical overview'].map((cite, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 10, background: 'var(--glass)', border: '1px solid var(--glass-border)', fontSize: 12 }}>
                  <div style={{ width: 22, height: 22, borderRadius: 6, flexShrink: 0, background: 'var(--cyan-dim)', border: '1px solid rgba(0,212,255,0.3)', color: 'var(--cyan)', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
                  <div style={{ color: 'var(--text-muted)', lineHeight: 1.5, fontFamily: 'var(--font-mono)' }} dangerouslySetInnerHTML={{ __html: cite.replace(/^(\w+\.\w+)/, '<strong>$1</strong>') }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}