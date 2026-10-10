import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore.js';
import { defaultSyncService, SyncEvent } from '../../core/syncService.js';
import {
  RefreshCw,
  Wifi,
  WifiOff,
  CheckCircle2,
  Clock,
  Layers,
  Check,
  AlertCircle
} from 'lucide-react';

export const SyncPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    isSimulatedOffline,
    toggleOffline,
    syncNow,
    isSyncing,
    syncProgress,
    lastSyncTime,
    pendingSyncCount
  } = useAppStore();

  const [allEvents, setAllEvents] = useState<SyncEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const events = await defaultSyncService.getAllEvents();
      setAllEvents(events);
    };
    fetchEvents();
  }, [pendingSyncCount, isSyncing]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Sync Center & Offline Outbox
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Local event log ordered by Hybrid Logical Clocks (HLC) with ULID idempotency keys.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleOffline}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${
              isSimulatedOffline
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
            }`}
          >
            {isSimulatedOffline ? <WifiOff className="w-4 h-4" /> : <Wifi className="w-4 h-4 text-emerald-600" />}
            <span>{isSimulatedOffline ? 'Resume Online' : 'Simulate Offline'}</span>
          </button>

          <button
            onClick={syncNow}
            disabled={isSyncing || isSimulatedOffline}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>

      {/* Sync Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Connection Mode</span>
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${isSimulatedOffline ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200 uppercase">
              {isSimulatedOffline ? 'Offline Simulation' : 'Connected (Online)'}
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Outbox Queue</span>
          <div className="font-black text-lg text-slate-800 dark:text-slate-200 font-mono">
            {pendingSyncCount} pending events
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Last Cloud Sync</span>
          <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono">
            {lastSyncTime ? new Date(lastSyncTime).toLocaleTimeString() : 'Never'}
          </div>
        </div>
      </div>

      {/* Progress animation during sync */}
      {isSyncing && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-teal-200 dark:border-teal-800 space-y-2">
          <div className="flex justify-between text-xs font-bold text-teal-800 dark:text-teal-300">
            <span>Synchronizing offline outbox with central cluster...</span>
            <span className="font-mono">{syncProgress}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-teal-600 rounded-full transition-all duration-200"
              style={{ width: `${syncProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Event Queue List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          Immutable Event Log ({allEvents.length})
        </h3>

        {allEvents.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-xs">
            No events recorded yet. Perform an action in /app or /admin to generate events.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 max-h-96 overflow-y-auto">
            {allEvents.map((evt) => (
              <div key={evt.id} className="py-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5 truncate mr-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono ${
                      evt.status === 'pending'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}
                  >
                    {evt.status}
                  </span>
                  <span className="font-mono text-slate-400 text-[11px]">{evt.id}</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{evt.type}</span>
                </div>
                <div className="text-[11px] font-mono text-slate-400 shrink-0">
                  {new Date(evt.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Conflicts List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Conflict Resolution Log
          </h3>
          <span className="text-xs font-mono font-bold text-emerald-600">0 unresolved conflicts</span>
        </div>
        <p className="text-xs text-slate-500">
          Deterministic conflict rules apply: (1) Human operator overrides beats machine triage, (2) Latest HLC wins among concurrent human edits, (3) Incident unions are monotonic.
        </p>
      </div>

    </div>
  );
};
