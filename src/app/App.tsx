import React, { useState } from 'react';
import { Toaster } from 'sonner';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { RouterManagement } from './components/RouterManagement';
import { UserManagement } from './components/UserManagement';
import { VoucherManagement } from './components/VoucherManagement';
import { WireGuardConfig } from './components/WireGuardConfig';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { HotspotConfig } from './components/HotspotConfig';
import { SessionSettings } from './components/SessionSettings';
import { TemplateEditor } from './components/TemplateEditor';
import { Reports } from './components/Reports';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState('dashboard');

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveView('dashboard');
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'hotspot':
        return <HotspotConfig />;
      case 'routers':
        return <RouterManagement />;
      case 'users':
        return <UserManagement />;
      case 'vouchers':
        return <VoucherManagement />;
      case 'sessions':
        return <SessionSettings />;
      case 'template':
        return <TemplateEditor />;
      case 'reports':
        return <Reports />;
      case 'wireguard':
        return <WireGuardConfig />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  if (!isLoggedIn) {
    return (
      <>
        <Login onLogin={handleLogin} />
        <Toaster position="top-right" theme="dark" />
      </>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        activeView={activeView}
        onViewChange={setActiveView}
        onLogout={handleLogout}
      />

      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {renderView()}
        </div>
      </main>

      <Toaster position="top-right" theme="dark" />
    </div>
  );
}
