import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export const Alert = ({
  type = 'error',
  message,
  onClose,
  className = ''
}) => {
  if (!message) return null;

  const config = {
    error: {
      bg: 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-900/50',
      icon: AlertCircle
    },
    success: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-900/50',
      icon: CheckCircle2
    },
    warning: {
      bg: 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-900/50',
      icon: AlertTriangle
    },
    info: {
      bg: 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-200 border-sky-200 dark:border-sky-900/50',
      icon: Info
    }
  };

  const item = config[type] || config.error;
  const Icon = item.icon;

  return (
    <div
      className={`flex items-start gap-3 p-3.5 rounded-xl border text-sm transition-all duration-150 ${item.bg} ${className}`}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5 opacity-90" />
      <div className="flex-1 font-medium">{message}</div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity"
          aria-label="Dismiss alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default Alert;
