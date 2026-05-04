export default function Memory() {
  const timeline = [
    { icon: '🧬', title: 'CRISPR gene editing breakthroughs 2025', time: 'Today, 14:32', sources: 8, steps: 5, duration: '2.1s', status: 'Completed', dotClass: 'cyan' },
    { icon: '📈', title: 'LLM inference optimization strategies — comparative analysis', time: 'Today, 14:18', sources: 6, steps: 4, duration: '1.6s', status: 'Completed', dotClass: 'violet' },
    { icon: '⚡', title: 'Quantum computing commercial applications — market landscape', time: 'Today, 13:45', sources: 5, steps: 3, duration: '1.2s', status: 'In Progress', dotClass: 'emerald' },
    { icon: '🌏', title: 'Geopolitical impact of AI regulation — EU AI Act effects', time: 'Yesterday', sources: 7, steps: 6, duration: '3.2s', status: 'Completed', dotClass: 'cyan' },
  ];

  const memories = [
    { icon: '🧬', key: 'user::research_focus', val: 'AI agents, genomics, quantum computing', time: 'Updated 2 min ago' },
    { icon: '🔗', key: 'session::preferred_sources', val: 'arxiv.org, nature.com, techcrunch.com', time: 'Updated 14 min ago' },
    { icon: '⚙️', key: 'agent::mode', val: 'Deep Dive · 6–8 sources per query', time: 'Set at session start' },
    { icon: '📍', key: 'context::last_topic', val: 'Multi-step reasoning, GAIA benchmark, MCP protocol', time: 'Updated 2 min ago' },
  ];

  const dotColors: Record<string, string> = {
    cyan: 'rgba(0,212,255,0.4)',
    violet: 'rgba(124,92,252,0.4)',
    emerald: 'rgba(0,255,170,0.3)',
  };

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
            Memory & <span style={{ background: 'linear-gradient(90deg,var(--cyan),var(--violet))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>History</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 8 }}>// persistent context, session logs, and API telemetry</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge badge-violet">Supabase Connected</span>
          <span className="badge badge-emerald">32 context items</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Timeline */}
        <div className="float-card" style={{ padding: 28, gridColumn: 'span 2' }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 20 }}>// Research Timeline</div>
          <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 16, top: 0, bottom: 0, width: 1, background: 'linear-gradient(to bottom,var(--cyan),var(--violet),transparent)', opacity: 0.4 }}></div>
            {timeline.map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 24, padding: '16px 0', cursor: 'pointer', transition: 'all .2s' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13,
                  position: 'relative', zIndex: 1,
                  background: `rgba(0,212,255,0.15)`,
                  border: `2px solid ${dotColors[item.dotClass]}`,
                }}>{item.icon}</div>
                <div style={{ flex: 1, padding: '14px 18px', borderRadius: 12, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', display: 'flex', gap: 12, marginBottom: 8 }}>
                    <span>{item.time}</span>
                    <span>{item.sources} sources</span>
                    <span>{item.steps} steps</span>
                    <span>{item.duration}</span>
                  </div>
                  <span className={`badge ${item.status === 'Completed' ? 'badge-emerald' : 'badge-cyan'}`}>
                    {item.status === 'Completed' ? 'Completed' : '● In Progress'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Memory store */}
        <div className="float-card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>// Active Memory</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 14 }}>
            {memories.map((mem, i) => (
              <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--glass)', border: '1px solid var(--glass-border)', display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>{mem.icon}</span>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--cyan)', fontFamily: 'var(--font-mono)', marginBottom: 3 }}>{mem.key}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{mem.val}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)', marginTop: 4 }}>{mem.time}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* API Telemetry */}
        <div className="float-card" style={{ padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 14 }}>// API Telemetry</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { name: 'Gemini 2.0 Flash', usage: '247 / 1000 req today', pct: 24, color: 'linear-gradient(90deg,var(--cyan),var(--violet))' },
              { name: 'Serper Search', usage: '89 / 500 searches', pct: 18, color: 'var(--amber)' },
              { name: 'Supabase DB', usage: '32 rows · 2.1 MB', pct: 12, color: 'var(--emerald)' },
              { name: 'Firecrawl MCP', usage: '1,684 / 5000 pages', pct: 33, color: 'var(--violet)' },
            ].map((api, i) => (
              <div key={i} style={{ padding: '14px 16px', borderRadius: 12, background: 'var(--glass)', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block', animation: 'pulse-dot 2s infinite' }}></span>
                  {api.name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>{api.usage}</div>
                <div style={{ height: 3, background: 'var(--glass-border)', borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${api.pct}%`, background: api.color, borderRadius: 2 }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}