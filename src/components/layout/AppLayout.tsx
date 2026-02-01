import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  CreditCard,
  AppWindow,
  LifeBuoy,
  Settings,
  LogOut,
  User,
  Tv,
  Languages,
  ClipboardList,
  Link
} from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { mockTasks } from '../../lib/mockDb';
import { ThemeToggle } from '../ui/ThemeToggle';

const SidebarItem = ({ to, icon: Icon, label, badgeCount }: { to: string, icon: any, label: string, badgeCount?: number }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors mb-1 group relative ${isActive
          ? 'bg-primary text-white shadow-md shadow-primary/20'
          : 'text-textMuted hover:bg-surfaceHighlight hover:text-textMain'
        }`
      }
    >
      <Icon size={20} />
      <span className="font-medium flex-1">{label}</span>
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">
          {badgeCount}
        </span>
      )}
    </NavLink>
  );
};

export const AppLayout = () => {
  const { t, language, setLanguage } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const [overdueCount, setOverdueCount] = useState(0);

  // Simple check for overdue tasks (for the badge)
  useEffect(() => {
    // In a real app, this would come from a global state or query
    const now = new Date();
    const count = mockTasks.filter(t => new Date(t.dueAt) < now && t.stageId !== '5').length; // Assuming '5' is Lost/Done, just logic example
    setOverdueCount(count);
  }, []);

  const handleLogout = () => {
    navigate('/login');
  };

  const getPageTitle = () => {
    if (location.pathname.includes('vendendo')) return t('nav.selling');
    if (location.pathname.includes('tarefas')) return t('nav.tasks');
    if (location.pathname.includes('pagamentos')) return t('nav.payments');
    if (location.pathname.includes('apps')) return t('nav.apps');
    if (location.pathname.includes('suporte')) return t('nav.support');
    if (location.pathname.includes('tradutor')) return t('nav.translator');
    if (location.pathname.includes('admin')) return t('nav.admin');
    return t('nav.dashboard');
  };

  return (
    <div className="flex h-screen bg-background text-textMain overflow-hidden transition-colors duration-300">
      {/* Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col h-full shrink-0 transition-colors duration-300">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-orange-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <Tv className="text-white" size={24} />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-textMain leading-none">UNIVERSA<span className="text-primary">TV</span></h1>
            <span className="text-xs text-textMuted font-medium tracking-wider">SELLER DESK</span>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <SidebarItem to="/app" icon={LayoutDashboard} label={t('nav.dashboard')} />
          <SidebarItem to="/app/vendendo" icon={ShoppingBag} label={t('nav.selling')} />
          <SidebarItem to="/app/tarefas" icon={ClipboardList} label={t('nav.tasks')} badgeCount={overdueCount} />
          <SidebarItem to="/app/pagamentos" icon={CreditCard} label={t('nav.payments')} />
          <SidebarItem to="/app/apps" icon={AppWindow} label={t('nav.apps')} />
          <SidebarItem to="/app/update-url" icon={Link} label="UpdateURL" />
          <SidebarItem to="/app/suporte" icon={LifeBuoy} label={t('nav.support')} />
          <div className="my-2 border-t border-border/50"></div>
          <SidebarItem to="/app/tradutor" icon={Languages} label={t('nav.translator')} />
          <div className="my-2 border-t border-border/50"></div>
          <SidebarItem to="/app/admin" icon={Settings} label={t('nav.admin')} />
        </nav>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surfaceHighlight/50">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
              <User size={16} className="text-textMain" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-textMain">Vendedor 01</p>
              <p className="text-xs text-textMuted truncate">online</p>
            </div>
            <button onClick={handleLogout} className="text-textMuted hover:text-red-400">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-md flex items-center justify-between px-6 shrink-0 z-10 transition-colors duration-300">
          <h2 className="text-xl font-semibold text-textMain">{getPageTitle()}</h2>

          <div className="flex items-center gap-4 flex-1 justify-end">
            <ThemeToggle />

            <div className="flex bg-surfaceHighlight rounded-lg p-1 border border-border">
              <button
                onClick={() => setLanguage('pt')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${language === 'pt' ? 'bg-primary text-white shadow-sm' : 'text-textMuted hover:text-textMain'}`}
              >
                PT
              </button>
              <button
                onClick={() => setLanguage('es')}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${language === 'es' ? 'bg-primary text-white shadow-sm' : 'text-textMuted hover:text-textMain'}`}
              >
                ES
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto bg-background p-6 transition-colors duration-300">
          <Outlet />
        </div>
      </main>
    </div>
  );
};