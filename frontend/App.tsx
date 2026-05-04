import { useState } from 'react';
import NavBar from './components/NavBar';
import Dashboard from './pages/Dashboard';
import Research from './pages/Research';
import Sources from './pages/Sources';
import Memory from './pages/Memory';

export default function App() {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard': return <Dashboard setActivePage={setActivePage} />;
      case 'research': return <Research />;
      case 'sources': return <Sources />;
      case 'memory': return <Memory />;
      default: return <Dashboard setActivePage={setActivePage} />;
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column' }}>
      <NavBar activePage={activePage} setActivePage={setActivePage} />
      <div style={{ flex: 1, overflow: 'hidden auto' }}>
        {renderPage()}
      </div>
    </div>
  );
}