import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore.js';
import { STATIONS, ASSETS } from '../../mock/stationsAssets.js';
import { UrgencyBadge } from '../../components/UrgencyBadge.js';
import { clusterComplaints } from '../../core/cluster.js';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  Layers,
  Filter,
  SlidersHorizontal,
  Smartphone,
  FileText,
  Twitter,
  Mail,
  Flame,
  UserCheck
} from 'lucide-react';

export const TriagePage: React.FC = () => {
  const { t } = useTranslation();
  const {
    complaints,
    selectedComplaintId,
    setSelectedComplaintId,
    activeDeptTab,
    setActiveDeptTab,
    stationFilter,
    channelFilter,
    bandFilter,
    statusFilter,
    searchQuery
  } = useAppStore();

  const [needsHumanCollapsed, setNeedsHumanCollapsed] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);

  // Compute incident clusters to show incident badges ("x5 same issue")
  const incidents = clusterComplaints(
    complaints.map((c) => ({
      id: c.id,
      trackingId: c.trackingId,
      stationId: c.stationId,
      assetId: c.assetId,
      text: c.originalText,
      normalizedText: c.normalizedText,
      createdAt: c.createdAt,
      urgencyScore: c.urgencyScore,
      department: c.primaryDepartment
    }))
  );

  const incidentLookup = new Map<string, number>();
  for (const inc of incidents) {
    for (const cId of inc.complaintIds) {
      incidentLookup.set(cId, inc.count);
    }
  }

  // Filter complaints
  const filtered = complaints.filter((c) => {
    // Tab filter
    if (activeDeptTab !== 'all' && c.primaryDepartment !== activeDeptTab) {
      return false;
    }
    // Station filter
    if (stationFilter !== 'all' && c.stationId !== stationFilter) {
      return false;
    }
    // Channel filter
    if (channelFilter !== 'all' && c.channel !== channelFilter) {
      return false;
    }
    // Band filter
    if (bandFilter !== 'all' && c.urgencyBand !== bandFilter) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'all' && c.status !== statusFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = c.originalText.toLowerCase().includes(q);
      const matchTracking = c.trackingId.toLowerCase().includes(q);
      const matchStation = c.stationId.toLowerCase().includes(q);
      if (!matchText && !matchTracking && !matchStation) return false;
    }

    return true;
  });

  // Separate "Needs Human Eyes" lane vs standard automated queue
  const needsHumanComplaints = filtered.filter((c) => c.lane === 'needs_human');
  const automatedComplaints = filtered
    .filter((c) => c.lane !== 'needs_human')
    .sort((a, b) => b.urgencyScore - a.urgencyScore);

  // Keyboard navigation shortcuts: j (next), k (prev), Enter (open)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['input', 'textarea', 'select'].includes((e.target as HTMLElement).tagName.toLowerCase())) {
        return;
      }

      if (e.key === 'j') {
        setSelectedRowIndex((prev) => Math.min(automatedComplaints.length - 1, prev + 1));
      } else if (e.key === 'k') {
        setSelectedRowIndex((prev) => Math.max(0, prev - 1));
      } else if (e.key === 'Enter') {
        const item = automatedComplaints[selectedRowIndex];
        if (item) {
          setSelectedComplaintId(item.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [automatedComplaints, selectedRowIndex, setSelectedComplaintId]);

  // Department counts
  const deptTabs = [
    { id: 'all', label: t('admin.triage.allTabs'), count: complaints.length },
    { id: 'safety', label: 'Safety', count: complaints.filter((c) => c.primaryDepartment === 'safety').length },
    { id: 'lifts', label: 'Lifts', count: complaints.filter((c) => c.primaryDepartment === 'lifts').length },
    { id: 'cleanliness', label: 'Cleanliness', count: complaints.filter((c) => c.primaryDepartment === 'cleanliness').length },
    { id: 'fare', label: 'Fare', count: complaints.filter((c) => c.primaryDepartment === 'fare').length },
    { id: 'staff_behaviour', label: 'Staff Behaviour', count: complaints.filter((c) => c.primaryDepartment === 'staff_behaviour').length }
  ];

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'app': return <span title="Passenger App"><Smartphone className="w-3.5 h-3.5 text-teal-600" /></span>;
      case 'paper': return <span title="Paper Station Form"><FileText className="w-3.5 h-3.5 text-amber-600" /></span>;
      case 'social': return <span title="Twitter / Social"><Twitter className="w-3.5 h-3.5 text-sky-500" /></span>;
      case 'email': return <span title="Inbound Email"><Mail className="w-3.5 h-3.5 text-indigo-500" /></span>;
      default: return <span title="App"><Smartphone className="w-3.5 h-3.5 text-slate-400" /></span>;
    }
  };

  const getSlaIndicator = (createdAt: string, urgencyBand: string) => {
    const ageMins = Math.round((Date.now() - new Date(createdAt).getTime()) / (60 * 1000));
    const targetMins = urgencyBand === 'Critical' ? 15 : urgencyBand === 'High' ? 60 : 180;
    const remaining = targetMins - ageMins;
    const isNearBreach = remaining <= 5;

    return (
      <div className="flex flex-col text-[11px] font-mono">
        <span className="text-slate-500">{ageMins}m ago</span>
        <span className={`font-semibold ${isNearBreach || remaining < 0 ? 'text-red-600 font-bold animate-pulse' : 'text-slate-400'}`}>
          {remaining > 0 ? `${remaining}m left` : `BREACH +${Math.abs(remaining)}m`}
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Pinned "Needs Human Eyes" Lane (Collapsible) */}
      {needsHumanComplaints.length > 0 && (
        <div className="rounded-2xl border-2 border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-2xs">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                    {t('admin.triage.needsHumanLane')}
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white font-mono">
                    {needsHumanComplaints.length}
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  {t('admin.triage.needsHumanDesc')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setNeedsHumanCollapsed(!needsHumanCollapsed)}
              className="p-1 rounded-lg text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors cursor-pointer"
              aria-label="Toggle needs human lane"
            >
              {needsHumanCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </button>
          </div>

          {!needsHumanCollapsed && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              {needsHumanComplaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedComplaintId(c.id)}
                  className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-800/80 hover:border-amber-400 shadow-2xs hover:shadow-sm transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-900 dark:text-amber-300">
                      {c.trackingId}
                    </span>
                    <UrgencyBadge band={c.urgencyBand} score={c.urgencyScore} size="sm" />
                  </div>
                  <p className="text-xs font-medium text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                    {c.originalText}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500">
                    <span className="font-semibold text-amber-700 dark:text-amber-400 truncate max-w-[170px]">
                      {c.laneReason}
                    </span>
                    <span>{c.stationId}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Department Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        {deptTabs.map((tab) => {
          const isActive = activeDeptTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveDeptTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Triage Queue Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        
        {/* Table Header info */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
              Active Complaints Queue
            </span>
            <span className="text-xs font-mono font-semibold text-slate-400">
              ({automatedComplaints.length} sorted by urgency desc)
            </span>
          </div>
          <div className="text-[11px] font-semibold text-slate-400 hidden sm:flex items-center gap-2">
            <span>Shortcuts:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">j</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">k</kbd>
            <span>to navigate</span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">Enter</kbd>
            <span>to open</span>
          </div>
        </div>

        {/* Table Body */}
        {automatedComplaints.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No complaints found matching current filters.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 overflow-x-auto">
            {automatedComplaints.map((c, index) => {
              const isSelected = index === selectedRowIndex;
              const station = STATIONS.find((s) => s.id === c.stationId);
              const clusterCount = incidentLookup.get(c.id);

              return (
                <div
                  key={c.id}
                  onClick={() => {
                    setSelectedRowIndex(index);
                    setSelectedComplaintId(c.id);
                  }}
                  className={`p-4 flex items-center gap-4 transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-teal-50/70 dark:bg-teal-950/30'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {/* Urgency Score & Band */}
                  <div className="w-28 shrink-0">
                    <UrgencyBadge band={c.urgencyBand} score={c.urgencyScore} size="sm" />
                  </div>

                  {/* Complaint Text & Tags */}
                  <div className="flex-1 min-w-[280px] space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-800 dark:text-teal-300">
                        {c.trackingId}
                      </span>

                      {/* Primary Dept Chip */}
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        {c.primaryDepartment.replace('_', ' ')}
                      </span>

                      {/* Secondary Multi-labels */}
                      {c.secondaryDepartments?.map((sd) => (
                        <span
                          key={sd}
                          className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        >
                          +{sd.replace('_', ' ')}
                        </span>
                      ))}

                      {/* Language / Script Tag */}
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {c.lang_guess.toUpperCase()} ({c.script})
                      </span>

                      {/* Clustered Incident Badge ("x5 same issue") */}
                      {clusterCount && clusterCount > 1 && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800 flex items-center gap-1">
                          <Layers className="w-3 h-3" />
                          <span>x{clusterCount} clustered</span>
                        </span>
                      )}
                    </div>

                    {/* Text Preview (2 lines) */}
                    <p className="text-xs sm:text-sm font-medium text-slate-900 dark:text-slate-100 line-clamp-2 leading-relaxed">
                      {c.originalText}
                    </p>
                  </div>

                  {/* Station & Asset */}
                  <div className="hidden md:flex flex-col text-xs text-slate-600 dark:text-slate-400 w-36 shrink-0">
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {station?.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {c.assetId || 'Station Area'}
                    </span>
                  </div>

                  {/* Channel Icon */}
                  <div className="shrink-0 w-8 flex justify-center">
                    {getChannelIcon(c.channel)}
                  </div>

                  {/* Age & SLA Countdown */}
                  <div className="w-24 shrink-0 text-right">
                    {getSlaIndicator(c.createdAt, c.urgencyBand)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
