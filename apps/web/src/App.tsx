import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Header } from './components/Header.js';
import { DetailDrawer } from './components/DetailDrawer.js';
import { ToastContainer } from './components/ToastContainer.js';
import { SubmitPage } from './pages/passenger/SubmitPage.js';
import { ConfirmPage } from './pages/passenger/ConfirmPage.js';
import { TrackPage } from './pages/passenger/TrackPage.js';
import { TriagePage } from './pages/admin/TriagePage.js';
import { IntakePage } from './pages/admin/IntakePage.js';
import { IncidentsPage } from './pages/admin/IncidentsPage.js';
import { HotspotsPage } from './pages/admin/HotspotsPage.js';
import { TemplatesPage } from './pages/admin/TemplatesPage.js';
import { ModelSafetyPage } from './pages/admin/ModelSafetyPage.js';
import { SyncPage } from './pages/admin/SyncPage.js';
import {
  Inbox,
  PlusCircle,
  Layers,
  Flame,
  FileCode2,
  Cpu,
  RefreshCw,
  LayoutDashboard
} from 'lucide-react';

export const App: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  const adminNavItems = [
    { to: '/admin', label: t('admin.sidebar.triage'), icon: Inbox, exact: true },
    { to: '/admin/intake', label: t('admin.sidebar.intake'), icon: PlusCircle },
    { to: '/admin/incidents', label: t('admin.sidebar.incidents'), icon: Layers },
    { to: '/admin/hotspots', label: t('admin.sidebar.hotspots'), icon: Flame },
    { to: '/admin/templates', label: t('admin.sidebar.templates'), icon: FileCode2 },
    { to: '/admin/model', label: t('admin.sidebar.model'), icon: Cpu },
    { to: '/admin/sync', label: t('admin.sidebar.sync'), icon: RefreshCw }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 font-sans">
      <Header />

      {/* Main Body */}
      {isAdmin ? (
        <div className="flex-1 flex max-w-7xl w-full mx-auto">
          {/* Left Sidebar */}
          <aside className="w-56 shrink-0 border-r border-slate-200 dark:border-slate-800 p-3 hidden md:flex flex-col gap-1 bg-white/50 dark:bg-slate-900/50">
            <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Operations Control
            </div>
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.to
                : location.pathname.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-teal-700 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </aside>

          {/* Admin Content View */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <Routes>
              <Route path="/admin" element={<TriagePage />} />
              <Route path="/admin/intake" element={<IntakePage />} />
              <Route path="/admin/incidents" element={<IncidentsPage />} />
              <Route path="/admin/hotspots" element={<HotspotsPage />} />
              <Route path="/admin/templates" element={<TemplatesPage />} />
              <Route path="/admin/model" element={<ModelSafetyPage />} />
              <Route path="/admin/sync" element={<SyncPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </main>
        </div>
      ) : (
        <main className="flex-1">
          <Routes>
            <Route path="/app" element={<SubmitPage />} />
            <Route path="/app/confirm/:id" element={<ConfirmPage />} />
            <Route path="/app/track/:id" element={<TrackPage />} />
            <Route path="/" element={<Navigate to="/app" replace />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
        </main>
      )}

      {/* Global Interactive Drawer & Toast Notification */}
      <DetailDrawer />
      <ToastContainer />
    </div>
  );
};
