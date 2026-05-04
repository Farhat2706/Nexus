import { useEffect, useRef } from 'react';

interface NavBarProps {
  activePage: string;
  setActivePage: (page: string) => void;
}

export default function NavBar({ activePage, setActivePage }: NavBarProps) {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mx = 0, my = 0, rx = 0, ry = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX; my = e.clientY;
      if (cursorRef.current) {
        cursorRef.current.style.left = (mx - 6) + 'px';
        cursorRef.current.style.top = (my - 6) + 'px';
      }
    };
    const animate = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = (rx - 18) + 'px';
        ringRef.current.style.top = (ry - 18) + 'px';
      }
      requestAnimationFrame(animate);
    };
    document.addEventListener('mousemove', onMove);
    animate();
    return () => document.removeEventListener('mousemove', onMove);
  }, []);

  const tabs = ['Dashboard', 'Research', 'Sources', 'Memory'];

  return (
    <>
      <div id="cursor" ref={cursorRef}></div>
      <div id="cursor-ring" ref={ringRef}></div>

      <nav style={{
        position: 'relative', zIndex: 100,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '20px 40px',
        background: 'rgba(4,5,10,0.7)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 22, fontWeight: 800 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#7c5cfc,#00d4ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, animation: 'logo-breathe 3s ease-in-out infinite',
          }}>⬡</div>
          <div>
            <div>NEX<span style={{ color: 'var(--cyan)' }}>US</span></div>
            <div style={{ fontSize: 9, color: 'var(--text-muted)', letterSpacing: 2, fontFamily: 'var(--font-mono)', fontWeight: 300, marginTop: -4 }}>
              Autonomous Research Agent
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex', gap: 4,
          background: 'var(--glass)', border: '1px solid var(--glass-border)',
          borderRadius: 12, padding: 4,
        }}>
          {tabs.map(tab => (
            <button key={tab}
              onClick={() => setActivePage(tab.toLowerCase())}
              style={{
                padding: '8px 20px', borderRadius: 8, fontSize: 12, fontWeight: 600,
                letterSpacing: 0.5, cursor: 'pointer', border: 'none',
                fontFamily: 'var(--font-display)',
                transition: 'all .2s',
                color: activePage === tab.toLowerCase() ? '#04050a' : 'rgba(232,240,254,0.45)',
                background: activePage === tab.toLowerCase()
                  ? 'linear-gradient(135deg,#00d4ff,#7c5cfc)'
                  : 'none',
                boxShadow: activePage === tab.toLowerCase() ? '0 4px 20px rgba(0,212,255,0.3)' : 'none',
              }}>
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '6px 14px', borderRadius: 20 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--emerald)', animation: 'pulse-dot 2s infinite', display: 'inline-block' }}></span>
            <span>Agent Online</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--glass)', border: '1px solid var(--glass-border)', padding: '6px 14px', borderRadius: 20 }}>
            <span>v2.4.1</span>
          </div>
        </div>
      </nav>
    </>
  );
}