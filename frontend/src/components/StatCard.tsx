interface StatCardProps {
  icon: string;
  value: string;
  label: string;
  change: string;
  color: 'cyan' | 'violet' | 'emerald';
}

export default function StatCard({ icon, value, label, change, color }: StatCardProps) {
  const colors = {
    cyan: '#00d4ff',
    violet: '#a78bfa',
    emerald: '#00ffaa',
  };

  const glows = {
    cyan: '0 0 20px rgba(0,212,255,0.5)',
    violet: '0 0 20px rgba(124,92,252,0.5)',
    emerald: '0 0 20px rgba(0,255,170,0.4)',
  };

  return (
    <div className="float-card" style={{ padding: 28 }}>
      <span style={{ fontSize: 28, marginBottom: 16, display: 'block' }}>{icon}</span>
      <div style={{
        fontSize: 42, fontWeight: 800, letterSpacing: -2, lineHeight: 1,
        color: colors[color], textShadow: glows[color],
      }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginTop: 8, letterSpacing: 1, textTransform: 'uppercase' }}>{label}</div>
      <div style={{ fontSize: 11, color: 'var(--emerald)', marginTop: 6, fontFamily: 'var(--font-mono)' }}>{change}</div>
    </div>
  );
}