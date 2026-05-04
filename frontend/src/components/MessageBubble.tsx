interface MessageBubbleProps {
  role: 'user' | 'ai';
  content: string;
  sources: string[];
  timestamp: Date;
}

export default function MessageBubble({ role, content, sources, timestamp }: MessageBubbleProps) {
  const isUser = role === 'user';

  const formatContent = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n\n/g, '<br/><br/>')
      .replace(/\n/g, '<br/>');
  };

  return (
    <div style={{
      display: 'flex', gap: 14,
      flexDirection: isUser ? 'row-reverse' : 'row',
      animation: 'msg-in .4s cubic-bezier(.23,1,.32,1)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        background: isUser ? 'var(--glass)' : 'linear-gradient(135deg,#7c5cfc,#00d4ff)',
        border: isUser ? '1px solid var(--glass-border)' : 'none',
        boxShadow: isUser ? 'none' : 'var(--glow-violet)',
      }}>
        {isUser ? '👤' : '⬡'}
      </div>

      <div style={{
        maxWidth: '72%', display: 'flex', flexDirection: 'column', gap: 8,
        alignItems: isUser ? 'flex-end' : 'flex-start',
      }}>
        <div style={{
          padding: '16px 20px', borderRadius: 16, fontSize: 14, lineHeight: 1.7,
          borderTopLeftRadius: isUser ? 16 : 4,
          borderTopRightRadius: isUser ? 4 : 16,
          background: isUser
            ? 'linear-gradient(135deg,rgba(0,212,255,0.15),rgba(124,92,252,0.15))'
            : 'var(--glass)',
          border: isUser
            ? '1px solid rgba(0,212,255,0.2)'
            : '1px solid var(--glass-border)',
        }}
          dangerouslySetInnerHTML={{ __html: formatContent(content) }}
        />

        {sources.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {sources.map((src, i) => {
              let domain = src;
              try { domain = new URL(src).hostname.replace('www.', ''); } catch {}
              return (
                <div key={i} style={{
                  padding: '4px 10px', borderRadius: 6, fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  background: 'var(--glass)', border: '1px solid var(--glass-border)',
                  color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5,
                }}>
                  <span style={{
                    width: 14, height: 14, borderRadius: '50%',
                    background: 'var(--cyan-dim)', color: 'var(--cyan)',
                    fontSize: 8, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', fontWeight: 700,
                  }}>{i + 1}</span>
                  <span style={{ color: 'var(--cyan)' }}>{domain}</span>
                </div>
              );
            })}
          </div>
        )}

        <div style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'var(--font-mono)' }}>
          {isUser ? 'You' : 'NEXUS'} · {timestamp.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}