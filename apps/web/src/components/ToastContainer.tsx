import React from 'react';
import { useAppStore } from '../store/useAppStore.js';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useAppStore();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((toast) => {
        const typeConfig = {
          success: {
            bg: 'bg-teal-900/90 text-white border-teal-700',
            icon: CheckCircle2,
            iconColor: 'text-teal-300'
          },
          error: {
            bg: 'bg-red-900/90 text-white border-red-700',
            icon: XCircle,
            iconColor: 'text-red-300'
          },
          warning: {
            bg: 'bg-amber-900/90 text-white border-amber-700',
            icon: AlertTriangle,
            iconColor: 'text-amber-300'
          },
          info: {
            bg: 'bg-slate-900/95 text-white border-slate-700',
            icon: Info,
            iconColor: 'text-teal-400'
          }
        };

        const config = typeConfig[toast.type] || typeConfig.info;
        const Icon = config.icon;

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all transform animate-in slide-in-from-bottom-2 ${config.bg}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${config.iconColor}`} />
            <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
