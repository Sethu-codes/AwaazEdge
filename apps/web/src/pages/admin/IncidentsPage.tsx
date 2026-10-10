import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore.js';
import { STATIONS, ASSETS } from '../../mock/stationsAssets.js';
import { clusterComplaints, ClusteredIncident } from '../../core/cluster.js';
import { UrgencyBadge } from '../../components/UrgencyBadge.js';
import {
  Layers,
  MapPin,
  Clock,
  ArrowRight,
  ShieldAlert,
  Flame,
  CheckCircle2
} from 'lucide-react';

export const IncidentsPage: React.FC = () => {
  const { t } = useTranslation();
  const { complaints, setSelectedComplaintId } = useAppStore();

  const incidents: ClusteredIncident[] = clusterComplaints(
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

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Active Clustered Incidents
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Complaints occurring within 6 hours at the same station & facility are merged into consolidated incidents to prevent duplicate field dispatches.
        </p>
      </div>

      {incidents.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 text-sm">
          No clustered incidents currently detected across active reports.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {incidents.map((inc) => {
            const station = STATIONS.find((s) => s.id === inc.stationId);
            const asset = ASSETS.find((a) => a.id === inc.assetId);

            // Fetch member complaints
            const memberComplaints = complaints.filter((c) => inc.complaintIds.includes(c.id));

            return (
              <div
                key={inc.id}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4 hover:border-teal-500 transition-all"
              >
                {/* Incident Card Top */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-teal-700 dark:text-teal-400">
                        {inc.id}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-black bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span>{inc.count} Complaints Merged</span>
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                      {inc.title}
                    </h3>
                  </div>

                  <UrgencyBadge
                    band={inc.maxUrgency >= 85 ? 'Critical' : inc.maxUrgency >= 65 ? 'High' : 'Medium'}
                    score={inc.maxUrgency}
                    size="sm"
                  />
                </div>

                {/* Location & Time window */}
                <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 py-2 border-y border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span>{station?.name}</span>
                    {asset && <span className="font-mono text-slate-400">({asset.id})</span>}
                  </div>
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Within 6 hours window</span>
                  </div>
                </div>

                {/* Sample Complaint Snippet */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    First Report Snippet:
                  </div>
                  <p className="line-clamp-2 italic">"{inc.sampleText}"</p>
                </div>

                {/* Member Complaints List */}
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Clustered Reports ({memberComplaints.length}):
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {memberComplaints.map((mc) => (
                      <div
                        key={mc.id}
                        onClick={() => setSelectedComplaintId(mc.id)}
                        className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-teal-50 dark:hover:bg-teal-950/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-mono text-[11px] font-bold text-teal-700 dark:text-teal-400">
                            {mc.trackingId}
                          </span>
                          <span className="truncate text-slate-700 dark:text-slate-300">
                            {mc.originalText}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400 shrink-0 ml-2">
                          {mc.urgencyScore} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
