import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/useAppStore.js';
import { STATIONS } from '../../mock/stationsAssets.js';
import {
  CheckCircle2,
  Copy,
  Check,
  Clock,
  ArrowRight,
  Shield,
  FilePlus2
} from 'lucide-react';

export const ConfirmPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const { complaints } = useAppStore();
  const [copied, setCopied] = useState(false);

  const complaint = complaints.find((c) => c.id === id) || complaints[0];

  const handleCopy = () => {
    if (complaint?.trackingId) {
      navigator.clipboard.writeText(complaint.trackingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const station = STATIONS.find((s) => s.id === complaint?.stationId);

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-14 text-center">
      
      {/* Confirmation Badge */}
      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-5 shadow-sm">
        <CheckCircle2 className="w-9 h-9" />
      </div>

      <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
        Grievance Received
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
        Your complaint has been queued with the station control room.
      </p>

      {/* Tracking Card */}
      <div className="mt-6 p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm text-left space-y-4">
        
        {/* Tracking ID with Copy Button */}
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
            {t('passenger.trackingId')}
          </span>
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="font-mono text-base font-black text-teal-800 dark:text-teal-300">
              {complaint?.trackingId || 'TRK-0000'}
            </span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-teal-600 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t('passenger.copied') : 'Copy'}</span>
            </button>
          </div>
        </div>

        {/* Provisional Category (never urgency score or internal tags) */}
        <div className="flex items-center justify-between text-xs py-1 border-t border-slate-100 dark:border-slate-800 pt-3">
          <span className="text-slate-500 font-medium">{t('passenger.provisionalCategory')}</span>
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-slate-800 dark:text-slate-200 capitalize">
              {complaint?.primaryDepartment.replace('_', ' ')}
            </span>
            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Provisional
            </span>
          </div>
        </div>

        {/* Station */}
        <div className="flex items-center justify-between text-xs py-1 border-t border-slate-100 dark:border-slate-800 pt-3">
          <span className="text-slate-500 font-medium">Station</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">
            {station?.name || 'Ahmedabad Metro'}
          </span>
        </div>

        {/* Estimated Response Notice */}
        <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 text-xs flex items-center gap-2.5">
          <Clock className="w-4 h-4 shrink-0 text-teal-600" />
          <span>{t('passenger.estimatedResponse')}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3">
        <Link
          to={`/app/track/${complaint?.id}`}
          className="w-full min-h-[46px] py-3 px-6 rounded-xl font-bold text-sm text-white bg-teal-700 hover:bg-teal-800 active:scale-[0.99] transition-all shadow-sm flex items-center justify-center gap-2"
        >
          <span>{t('passenger.trackComplaint')}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>

        <Link
          to="/app"
          className="w-full min-h-[44px] py-2.5 px-6 rounded-xl font-semibold text-xs sm:text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          <FilePlus2 className="w-4 h-4" />
          <span>{t('passenger.fileAnother')}</span>
        </Link>
      </div>

    </div>
  );
};
