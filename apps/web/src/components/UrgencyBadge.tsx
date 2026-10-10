import React from 'react';
import { AlertTriangle, AlertCircle, Clock, ShieldCheck } from 'lucide-react';

interface UrgencyBadgeProps {
  band: 'Critical' | 'High' | 'Medium' | 'Low';
  score?: number;
  size?: 'sm' | 'md' | 'lg';
  showScore?: boolean;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({
  band,
  score,
  size = 'md',
  showScore = true
}) => {
  const config = {
    Critical: {
      bg: 'bg-red-50 dark:bg-red-950/70 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
      iconBg: 'bg-red-600 text-white',
      icon: AlertTriangle,
      label: 'Critical'
    },
    High: {
      bg: 'bg-orange-50 dark:bg-orange-950/70 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
      iconBg: 'bg-orange-500 text-white',
      icon: AlertCircle,
      label: 'High'
    },
    Medium: {
      bg: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      iconBg: 'bg-amber-500 text-white',
      icon: Clock,
      label: 'Medium'
    },
    Low: {
      bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      iconBg: 'bg-slate-500 text-white',
      icon: ShieldCheck,
      label: 'Low'
    }
  };

  const item = config[band] || config.Low;
  const Icon = item.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4'
  };

  return (
    <span
      className={`inline-flex items-center rounded-lg border shadow-xs transition-colors ${item.bg} ${sizeClasses[size]}`}
      role="status"
      aria-label={`Urgency: ${item.label}${score !== undefined ? ` score ${score}` : ''}`}
    >
      <Icon className={`${iconSizes[size]} shrink-0`} aria-hidden="true" />
      <span>{item.label}</span>
      {showScore && score !== undefined && (
        <span className="font-mono opacity-80 pl-1 border-l border-current/20">
          {score}
        </span>
      )}
    </span>
  );
};
