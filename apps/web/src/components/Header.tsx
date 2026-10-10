import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../store/useAppStore.js';
import { STATIONS } from '../mock/stationsAssets.js';
import {
  Train,
  Shield,
  Wifi,
  WifiOff,
  Sun,
  Moon,
  RefreshCw,
  ArrowRightLeft,
  Search,
  Globe
} from 'lucide-react';

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.startsWith('/admin');

  const {
    isSimulatedOffline,
    toggleOffline,
    pendingSyncCount,
    isSyncing,
    syncNow,
    isDarkMode,
    toggleDarkMode,
    stationFilter,
    setStationFilter,
    searchQuery,
    setSearchQuery
  } = useAppStore();

  const handleLanguageChange = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        
        {/* Brand & Portal Badge */}
        <div className="flex items-center gap-3">
          <Link
            to={isAdmin ? '/admin' : '/app'}
            className="flex items-center gap-2.5 font-bold tracking-tight text-slate-900 dark:text-white group"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-700 dark:bg-teal-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                <span>TransitTriage</span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-teal-100 dark:bg-teal-900/50 text-teal-800 dark:text-teal-300">
                  Gujarat Metro
                </span>
              </div>
              <div className="text-[11px] font-normal text-slate-500 dark:text-slate-400 hidden sm:block">
                {isAdmin ? t('app.adminSide') : t('app.passengerSide')}
              </div>
            </div>
          </Link>

          {/* Quick Demo Portal Switcher */}
          <button
            onClick={() => navigate(isAdmin ? '/app' : '/admin')}
            className="ml-1 sm:ml-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:text-teal-700 dark:hover:text-teal-400 transition-all shadow-2xs cursor-pointer"
            title={`Switch to ${isAdmin ? 'Passenger' : 'Admin'} portal`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="hidden md:inline">{t('app.switchSide')}:</span>
            <span className="font-bold text-teal-700 dark:text-teal-400">
              {isAdmin ? 'Passenger /app' : 'Admin /admin'}
            </span>
          </button>
        </div>

        {/* Admin Station Filter & Search (Desktop only) */}
        {isAdmin && (
          <div className="hidden lg:flex items-center gap-2 flex-1 max-w-md mx-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('admin.triage.searchPlaceholder')}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 transition-colors"
              />
            </div>
            <select
              value={stationFilter}
              onChange={(e) => setStationFilter(e.target.value)}
              className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium cursor-pointer"
            >
              <option value="all">{t('admin.triage.filterStation')}</option>
              {STATIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Status Chip, Offline Toggle & Controls */}
        <div className="flex items-center gap-2">
          
          {/* Prominent Online/Offline Chip with Pending Sync Counter */}
          <div className="flex items-center gap-1.5">
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-colors shadow-2xs ${
                isSimulatedOffline
                  ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  : 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
              }`}
            >
              {isSimulatedOffline ? (
                <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span className="uppercase tracking-wide">
                {isSimulatedOffline ? t('app.offline') : t('app.online')}
              </span>
              {pendingSyncCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-mono">
                  {pendingSyncCount}
                </span>
              )}
            </div>

            {/* Offline Simulation Button */}
            <button
              onClick={toggleOffline}
              className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                isSimulatedOffline
                  ? 'bg-amber-600 text-white border-amber-600 hover:bg-amber-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
              title="Toggle simulated airplane/offline mode for testing"
            >
              <span>{t('app.simulateOffline')}</span>
            </button>

            {/* Manual Sync Trigger */}
            {pendingSyncCount > 0 && !isSimulatedOffline && (
              <button
                onClick={syncNow}
                disabled={isSyncing}
                className="p-1.5 rounded-lg border border-teal-300 dark:border-teal-700 bg-teal-50 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 hover:bg-teal-100 transition-colors cursor-pointer"
                title="Sync queued events now"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              </button>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-0.5" />

          {/* Language Switcher */}
          <div className="relative flex items-center">
            <select
              value={i18n.language || 'en'}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="text-xs font-semibold py-1.5 pl-2 pr-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 cursor-pointer appearance-none"
              aria-label="Select Language"
            >
              <option value="en">English</option>
              <option value="gu">ગુજરાતી</option>
              <option value="hi">हिन्दी</option>
            </select>
            <Globe className="w-3 h-3 absolute right-2 pointer-events-none text-slate-400" />
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>
        </div>
      </div>
    </header>
  );
};
