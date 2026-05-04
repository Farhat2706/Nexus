import { useRef, useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useResearch } from '../hooks/useResearch';
import MessageBubble from './MessageBubble';

export default function ChatWindow() {
  const { messages, isLoading, mode, setMode } = useAppStore();
  const { sendQuery } = useResearch();
  const [input, setInput] = useState('');
  const windowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (windowRef.current) {
      windowRef.current.scrollTop = windowRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const query = input;
    setInput('');
    await sendQuery(query);
  };

  const modes = [
    { key: 'deep', icon: '🌊', label: 'Deep Dive', sub: '5–7 sources, full synthesis' },
    { key: 'quick', icon: '⚡', label: 'Quick Scan', sub: '2–3 sources, fast answer' },
    { key: 'scholar', icon: '🔬', label: 'Scholar', sub: 'Academic + peer-reviewed' },
    { key: 'analyst', icon: '📊', label: 'Analyst', sub: 'Data + market reports' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20, height: 'calc(100vh - 200px)' }}>
      
      {/* Sidebar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="float-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Research Mode
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
            {modes.map(m => (
              <div key={m.key}
                onClick={() => setMode(m.key)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                  transition: 'all .2s', fontSize: 12, fontWeight: 600,
                  background: mode === m.key ? 'var(--cyan-dim)' : 'var(--glass)',
                  border: `1px solid ${mode === m.key ? 'rgba(0,212,255,0.4)' : 'var(--glass-border)'}`,
                  color: mode === m.key ? 'var(--cyan)' : 'var(--text)',
                }}>
                <span style={{ fontSize: 16, width: 24, textAlign: 'center' }}>{m.icon}</span>
                <div>
                  <div>{m.label}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontWeight: 300, marginTop: 2 }}>{m.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="float-card" style={{ padding: 20 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: 12 }}>
            Agent Steps
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11, fontFamily: 'var(--font-mono)' }}>
            {['Query understanding', 'Source identification', 'Web scraping', 'Cross-referencing', 'Synthesis & output'].map((step, i) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8, color: isLoading && i === 2 ? 'var(--cyan)' : i < 2 ? 'var(--emerald)' : 'var(--text-faint)' }}>
                {isLoading && i === 2
                  ? <span className="think-spinner"></span>
                  : <span>{i < 2 ? '✓' : '○'}</span>
                }
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat main */}
      <div className="float-card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        
        {/* Messages */}
        <div ref={windowRef} style={{
          flex: 1, padding: 28, display: 'flex', flexDirection: 'column',
          gap: 20, overflowY: 'auto',
        }}>
          {/* Welcome message */}
          {messages.length === 0 && (
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg,#7c5cfc,#00d4ff)',
              }}>⬡</div>
              <div style={{ maxWidth: '72%' }}>
                <div style={{
                  padding: '16px 20px', borderRadius: 16, borderTopLeftRadius: 4,
                  fontSize: 14, lineHeight: 1.7,
                  background: 'var(--glass)', border: '1px solid var(--glass-border)',
                }}>
                  Hello, researcher. I'm <strong>NEXUS</strong> — your autonomous deep research agent.<br /><br />
                  Ask me anything. I'll reason through it step by step and give you a structured report with full citations.
                </div>
              </div>
            </div>
          )}

          {messages.map(msg => (
            <MessageBubble key={msg.id} {...msg} />
          ))}

          {isLoading && (
            <div style={{ display: 'flex', gap: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg,#7c5cfc,#00d4ff)',
              }}>⬡</div>
              <div style={{
                padding: '12px 16px', borderRadius: 10, fontSize: 12,
                background: 'var(--violet-dim)', border: '1px solid rgba(124,92,252,0.2)',
                fontFamily: 'var(--font-mono)', color: '#a78bfa',
                display: 'flex', alignItems: 'center', gap: 10,
              }}>
                <span className="think-spinner"></span>
                Researching your query across live sources...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div style={{
          padding: 20, borderTop: '1px solid var(--glass-border)',
          background: 'var(--surface)', backdropFilter: 'blur(24px)',
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder="Ask anything — NEXUS will research it autonomously..."
              rows={1}
              style={{
                flex: 1, background: 'var(--glass)', border: '1px solid var(--glass-border)',
                borderRadius: 14, padding: '14px 18px', color: 'var(--text)',
                fontFamily: 'var(--font-display)', fontSize: 14, resize: 'none',
                outline: 'none', minHeight: 52, maxHeight: 140, lineHeight: 1.5,
              }}
            />
            <button
              onClick={handleSend}
              disabled={isLoading}
              style={{
                width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                background: 'linear-gradient(135deg,var(--cyan),var(--violet))',
                border: 'none', cursor: isLoading ? 'not-allowed' : 'pointer',
                fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: isLoading ? 0.6 : 1,
              }}>⟶</button>
          </div>
        </div>
      </div>
    </div>
  );
}