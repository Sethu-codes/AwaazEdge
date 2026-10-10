import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore.js';
import { STATIONS, ASSETS } from '../../mock/stationsAssets.js';
import { Department } from '@transit-triage/core';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import {
  Grid,
  AlertTriangle,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  WifiOff
} from 'lucide-react';

export const HotspotsPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { complaints, setStationFilter, setActiveDeptTab, isSimulatedOffline } = useAppStore();

  const [dateRange, setDateRange] = useState('30d');

  const departments: Department[] = ['safety', 'lifts', 'cleanliness', 'fare', 'staff_behaviour'];

  // Empty state check if offline with no complaints
  if (isSimulatedOffline && complaints.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-16 text-center space-y-3">
        <WifiOff className="w-10 h-10 text-slate-400 mx-auto" />
        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
          Available after sync
        </h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Hotspot analytics and heatmaps require synced cloud aggregation. Reconnect to calculate cross-station metrics.
        </p>
      </div>
    );
  }

  // 1. Calculate Station x Department Matrix
  const heatmapData = STATIONS.map((stn) => {
    const row: Record<string, { count: number; meanUrgency: number }> = {};
    for (const dept of departments) {
      const matches = complaints.filter(
        (c) => c.stationId === stn.id && c.primaryDepartment === dept
      );
      const count = matches.length;
      const sum = matches.reduce((acc, c) => acc + c.urgencyScore, 0);
      const mean = count > 0 ? Math.round(sum / count) : 0;
      row[dept] = { count, meanUrgency: mean };
    }
    return { station: stn, cells: row };
  });

  // Cell shading helper
  const getCellColor = (count: number, meanUrgency: number) => {
    if (count === 0) return 'bg-slate-50 dark:bg-slate-800/40 text-slate-400';
    if (meanUrgency >= 85) return 'bg-red-500 text-white font-bold shadow-xs';
    if (meanUrgency >= 65) return 'bg-orange-500 text-white font-bold';
    if (meanUrgency >= 40) return 'bg-amber-400 text-slate-900 font-bold';
    return 'bg-teal-100 dark:bg-teal-900/60 text-teal-900 dark:text-teal-200';
  };

  const handleCellClick = (stationId: string, dept: string) => {
    setStationFilter(stationId);
    setActiveDeptTab(dept);
    navigate('/admin');
  };

  // 2. Repeat-offender assets (>= 3 complaints in 30 days)
  const assetCounts = new Map<string, number>();
  for (const c of complaints) {
    if (c.assetId) {
      assetCounts.set(c.assetId, (assetCounts.get(c.assetId) || 0) + 1);
    }
  }

  const repeatOffenders = Array.from(assetCounts.entries())
    .filter(([_, count]) => count >= 2) // threshold
    .map(([assetId, count]) => {
      const assetObj = ASSETS.find((a) => a.id === assetId);
      const stnObj = STATIONS.find((s) => s.id === assetObj?.stationId);
      return {
        assetId,
        name: assetObj?.name || assetId,
        stationName: stnObj?.name || 'Ahmedabad Metro',
        count
      };
    })
    .sort((a, b) => b.count - a.count);

  // 3. SLA Breaches List
  const slaBreaches = complaints
    .filter((c) => {
      const ageMins = Math.round((Date.now() - new Date(c.createdAt).getTime()) / (60 * 1000));
      const targetMins = c.urgencyBand === 'Critical' ? 15 : c.urgencyBand === 'High' ? 60 : 180;
      return ageMins > targetMins && c.status !== 'RESOLVED';
    })
    .sort((a, b) => b.urgencyScore - a.urgencyScore);

  // 4. Trend Chart Data (mock hourly/daily trend)
  const trendData = [
    { time: '08:00', critical: 1, total: 3 },
    { time: '10:00', critical: 3, total: 8 },
    { time: '12:00', critical: 2, total: 6 },
    { time: '14:00', critical: 1, total: 4 },
    { time: '16:00', critical: 4, total: 11 },
    { time: '18:00', critical: 5, total: 15 },
    { time: '20:00', critical: 2, total: 7 }
  ];

  // CSV Export
  const handleExportCSV = () => {
    const headers = 'id,tracking_id,station_id,asset_id,department,urgency_score,urgency_band,status,created_at\n';
    const rows = complaints.map((c) =>
      `"${c.id}","${c.trackingId}","${c.stationId}","${c.assetId || ''}","${c.primaryDepartment}",${c.urgencyScore},"${c.urgencyBand}","${c.status}","${c.createdAt}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transit_triage_complaints_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Hotspots & Heatmap Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Station × Department correlation matrix, repeat-offender assets, and SLA breach monitors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs border border-slate-200 dark:border-slate-800 rounded-xl p-1 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
            <button
              onClick={() => setDateRange('7d')}
              className={`px-2.5 py-1 rounded-lg ${dateRange === '7d' ? 'bg-teal-700 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              7 Days
            </button>
            <button
              onClick={() => setDateRange('30d')}
              className={`px-2.5 py-1 rounded-lg ${dateRange === '30d' ? 'bg-teal-700 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            >
              30 Days
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-teal-500 hover:text-teal-700 transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-teal-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 1. Station x Department Heatmap Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Grid className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Station × Department Heatmap
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Click any cell to filter triage queue
          </span>
        </div>

        {/* CSS Grid Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                <th className="py-2.5 pr-4 font-bold text-slate-500 uppercase tracking-wider text-[11px] w-48">
                  Station
                </th>
                {departments.map((dept) => (
                  <th key={dept} className="p-2.5 text-center font-bold text-slate-600 dark:text-slate-300 capitalize">
                    {dept.replace('_', ' ')}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {heatmapData.map(({ station, cells }) => (
                <tr key={station.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                  <td className="py-2.5 pr-4 font-semibold text-slate-800 dark:text-slate-200">
                    <div>{station.name}</div>
                    <span className="font-mono text-[10px] text-slate-400">{station.code}</span>
                  </td>
                  {departments.map((dept) => {
                    const cell = cells[dept];
                    return (
                      <td key={dept} className="p-1.5 text-center">
                        <button
                          onClick={() => handleCellClick(station.id, dept)}
                          className={`w-full py-2 px-1 rounded-xl transition-transform hover:scale-105 cursor-pointer ${getCellColor(
                            cell.count,
                            cell.meanUrgency
                          )}`}
                          title={`${cell.count} reports, mean urgency: ${cell.meanUrgency}`}
                        >
                          <div className="text-sm font-black">{cell.count}</div>
                          {cell.count > 0 && (
                            <div className="text-[10px] opacity-80 font-mono">
                              avg {cell.meanUrgency}
                            </div>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 2 & 3. Repeat Offenders & SLA Breaches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Repeat-Offender Assets */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <span>Repeat-Offender Facilities (≥ 2 reports)</span>
            </h3>
            <span className="text-xs font-mono text-slate-400 font-bold">
              {repeatOffenders.length} flagged
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {repeatOffenders.map((item) => (
              <div
                key={item.assetId}
                className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    {item.name}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    {item.stationName} • <span className="font-mono">{item.assetId}</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-black bg-orange-100 dark:bg-orange-950 text-orange-800 dark:text-orange-300 border border-orange-200 dark:border-orange-800 font-mono">
                  {item.count} complaints
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* SLA Breaches Monitor */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span>SLA Breaches Monitor</span>
            </h3>
            <span className="text-xs font-mono text-red-600 font-bold">
              {slaBreaches.length} breaches
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {slaBreaches.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Zero SLA breaches across all active complaints.
              </div>
            ) : (
              slaBreaches.map((c) => (
                <div
                  key={c.id}
                  className="p-3 rounded-xl bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-800 flex items-center justify-between text-xs"
                >
                  <div className="truncate mr-2">
                    <span className="font-mono font-bold text-red-700 dark:text-red-400 mr-2">
                      {c.trackingId}
                    </span>
                    <span className="truncate text-slate-700 dark:text-slate-300">
                      {c.originalText}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white shrink-0">
                    SLA Expired
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* 4. Trend Chart (Recharts) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          Intake Volume & Critical Incident Trend
        </h3>

        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderRadius: '0.75rem',
                  border: '1px solid #334155',
                  color: '#fff',
                  fontSize: '12px'
                }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#0d9488"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                name="Total Complaints"
              />
              <Line
                type="monotone"
                dataKey="critical"
                stroke="#ef4444"
                strokeWidth={2.5}
                dot={{ r: 4 }}
                name="Critical Safety"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
};
