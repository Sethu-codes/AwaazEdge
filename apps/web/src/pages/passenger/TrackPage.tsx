import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore.js';
import { STATIONS, ASSETS } from '../../mock/stationsAssets.js';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Building2,
  MessageSquareQuote,
  Shield,
  FilePlus2
} from 'lucide-react';

export const TrackPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { complaints } = useAppStore();

  const complaint = complaints.find((c) => c.id === id || c.trackingId === id) || complaints[0];
  const station = STATIONS.find((s) => s.id === complaint?.stationId);
  const asset = ASSETS.find((a) => a.id === complaint?.assetId);

  // Status timeline steps
  const steps = [
    { key: 'received', label: t('passenger.timeline.received'), reached: true },
    {
      key: 'reviewed',
      label: t('passenger.timeline.reviewed'),
      reached: ['TRIAGED', 'DRAFTED', 'APPROVED', 'SENT', 'RESOLVED'].includes(complaint?.status || '')
    },
    {
      key: 'replySent',
      label: t('passenger.timeline.replySent'),
      reached: ['SENT', 'RESOLVED'].includes(complaint?.status || '') || Boolean(complaint?.replyStatus === 'sent')
    },
    {
      key: 'resolved',
      label: t('passenger.timeline.resolved'),
      reached: complaint?.status === 'RESOLVED'
    }
  ];

  return (
    <div className="max-w-xl mx-auto px-4 py-6 sm:py-10">
      
      {/* Back button */}
      <div className="mb-4">
        <Link
          to="/app"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Grievance Form</span>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-6">
        
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Grievance Tracking
            </span>
            <span className="font-mono text-xs font-bold text-teal-800 dark:text-teal-300 px-2 py-0.5 rounded-md bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800">
              {complaint?.trackingId}
            </span>
          </div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white mt-1">
            Status Timeline
          </h1>
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Logged: {new Date(complaint?.createdAt || '').toLocaleString()}
          </div>
        </div>

        {/* 4-Step Status Timeline */}
        <div className="py-2">
          <div className="relative pl-6 space-y-6 border-l-2 border-slate-200 dark:border-slate-800 ml-3">
            {steps.map((step, idx) => (
              <div key={step.key} className="relative group">
                {/* Step Node Icon */}
                <div
                  className={`absolute -left-[31px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                    step.reached
                      ? 'bg-teal-700 text-white ring-4 ring-teal-100 dark:ring-teal-950'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {step.reached ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                </div>

                <div className="pl-1">
                  <div className={`text-sm font-bold ${step.reached ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                    {step.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {step.reached ? 'Step completed' : 'Awaiting controller update'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Official Response Box (in complainant's language) */}
        {complaint?.replyText && complaint?.replyStatus === 'sent' ? (
          <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200">
              <MessageSquareQuote className="w-4 h-4 text-teal-600" />
              <span>{t('passenger.officialReply')}</span>
            </div>
            <p className="text-sm font-medium leading-relaxed text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-3 rounded-lg border border-teal-100 dark:border-teal-900">
              {complaint.replyText}
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-slate-800 dark:text-slate-200">Review In Progress</div>
              <p className="mt-0.5">{t('passenger.pendingReview')}</p>
            </div>
          </div>
        )}

        {/* Complaint Summary (no internal urgency scores shown to passengers) */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-500">
            <span>Location:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {station?.name} {asset?.name ? `• ${asset.name}` : ''}
            </span>
          </div>
          <div className="flex justify-between items-center text-slate-500">
            <span>Report Category:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
              {complaint?.primaryDepartment.replace('_', ' ')}
            </span>
          </div>
          <div className="border-t border-slate-200 dark:border-slate-700 pt-2 text-slate-600 dark:text-slate-300">
            <span className="font-semibold block mb-1">Your description:</span>
            <p className="italic font-normal">"{complaint?.originalText}"</p>
          </div>
        </div>

        {/* Action */}
        <div className="pt-2">
          <Link
            to="/app"
            className="w-full py-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <FilePlus2 className="w-4 h-4" />
            <span>{t('passenger.fileAnother')}</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
