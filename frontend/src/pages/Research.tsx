import ChatWindow from '../components/ChatWindow';

export default function Research() {
  return (
    <div style={{ padding: '20px 40px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>
            Research <span style={{ background: 'linear-gradient(90deg,var(--cyan),var(--violet))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Console</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 8 }}>
            // multi-step autonomous web research · live data only
          </div>
        </div>
        <span className="badge badge-cyan">⚡ Gemini 2.0 Flash</span>
      </div>
      <ChatWindow />
    </div>
  );
}