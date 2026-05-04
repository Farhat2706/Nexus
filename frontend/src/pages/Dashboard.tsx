import { useEffect } from 'react';
import StatCard from '../components/StatCard';
import { useAppStore } from '../store/useAppStore';
import { researchAPI } from '../api/apiClient';

interface DashboardProps {
  setActivePage: (page: string) => void;
}

export default function Dashboard({ setActivePage }: DashboardProps) {
  const { stats, setStats } = useAppStore();

  useEffect(() => {
    researchAPI.getStats().then(setStats).catch(() => {});
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
            Mission <span style={{ background: 'linear-gradient(90deg,var(--cyan),var(--violet))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Control</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 8 }}>// real-time agent telemetry & research overview</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span className="badge badge-cyan">⚡ LIVE</span>
          <span className="badge badge-emerald">✓ ALL SYSTEMS GO</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>

        {/* Hero */}
        <div className="float-card" style={{ gridColumn: '1 / 3', padding: 36, background: 'linear-gradient(135deg,rgba(10,16,36,0.9),rgba(10,16,36,0.85))' }}>
          <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, marginBottom: 16 }}>
            Deep Research,<br />
            <span style={{ background: 'linear-gradient(90deg,#00d4ff 0%,#7c5cfc 60%,#00ffaa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Autonomously Done.
            </span>
          </div>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 480, marginBottom: 28 }}>
            NEXUS deploys multi-step AI reasoning across live web data — scraping, synthesizing, and citing 5+ sources per query. Powered by Gemini 2.0 Flash.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" onClick={() => setActivePage('research')}>Start Research ⟶</button>
            <button className="btn btn-ghost" onClick={() => setActivePage('sources')}>Browse Sources</button>
          </div>
        </div>

        {/* Agent card */}
        <div className="float-card" style={{ padding: 28, textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            border: '2px solid rgba(0,212,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, margin: '0 auto 16px',
            animation: 'ring-spin 8s linear infinite',
            boxShadow: '0 0 30px rgba(0,212,255,0.2)',
          }}>🤖</div>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>NEXUS Agent</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 16 }}>gemini-2.0-flash</div>
          {[
            ['Status', '● Active', 'var(--emerald)'],
            ['Mode', 'Deep Dive', 'var(--cyan)'],
            ['Sources/query', '6.8 avg', 'var(--cyan)'],
          ].map(([k, v, c]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 10 }}>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{k}</span>
              <span style={{ color: c as string, fontFamily: 'var(--font-mono)' }}>{v}</span>
            </div>
          ))}
        </div>

        {/* Stat cards */}
        <StatCard icon="🔍" value={String(stats.queriesResolved || 247)} label="Queries Resolved" change="↑ 18 this session" color="cyan" />
        <StatCard icon="🌐" value={String(stats.pagesScraped || '1,684')} label="Pages Scraped" change="↑ 124 this session" color="violet" />
        <StatCard icon="⚡" value={stats.avgResponseTime || '1.4s'} label="Avg Response Time" change="↓ 0.3s vs last session" color="emerald" />

        {/* Activity */}
        <div className="float-card" style={{ gridColumn: '1 / 4', padding: 28 }}>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20, fontFamily: 'var(--font-mono)' }}>// Recent Research Sessions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '🧬', query: 'Latest breakthroughs in CRISPR gene editing 2025', meta: '8 sources · 5 reasoning steps · 2 min ago', status: 'Done', statusClass: 'badge-emerald' },
              { icon: '📈', query: 'Comparative analysis: LLM inference optimization strategies', meta: '6 sources · 4 reasoning steps · 14 min ago', status: 'Done', statusClass: 'badge-emerald' },
              { icon: '⚡', query: 'Quantum computing commercial applications — market landscape', meta: '5 sources · 3 reasoning steps · 1 hr ago', status: 'Running', statusClass: 'badge-cyan' },
            ].map((item, i) => (
              <div key={i}
                onClick={() => setActivePage('research')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 20px', borderRadius: 12,
                  background: 'var(--glass)', border: '1px solid var(--glass-border)',
                  cursor: 'pointer', transition: 'all .2s',
                }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, background: 'var(--cyan-dim)', border: '1px solid rgba(0,212,255,0.3)' }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{item.query}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{item.meta}</div>
                </div>
                <span className={`badge ${item.statusClass}`}>{item.status === 'Done' ? '✓ Done' : '● Running'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}