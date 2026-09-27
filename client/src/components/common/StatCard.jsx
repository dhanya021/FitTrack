import React from 'react';
import Card from './Card';

export const StatCard = ({
  title,
  value,
  unit = '',
  icon: Icon,
  color = 'brand',
  trend = null,
  subtitle = null,
  progress = null,
  className = ''
}) => {
  const colorMap = {
    brand: {
      bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      accent: 'text-emerald-500',
      bar: 'bg-emerald-500'
    },
    blue: {
      bg: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      accent: 'text-sky-500',
      bar: 'bg-sky-500'
    },
    amber: {
      bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      accent: 'text-amber-500',
      bar: 'bg-amber-500'
    },
    purple: {
      bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      accent: 'text-purple-500',
      bar: 'bg-purple-500'
    },
    rose: {
      bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      accent: 'text-rose-500',
      bar: 'bg-rose-500'
    },
    indigo: {
      bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      accent: 'text-indigo-500',
      bar: 'bg-indigo-500'
    }
  };

  const c = colorMap[color] || colorMap.brand;

  return (
    <Card className={`p-5 relative overflow-hidden ${className}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {value}
            </span>
            {unit && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {unit}
              </span>
            )}
          </div>
        </div>

        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border ${c.bg}`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {progress !== null && (
        <div className="mt-3.5 space-y-1">
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${c.bar}`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      )}

      {(trend || subtitle) && (
        <div className="mt-3 flex items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
          {trend && <span className="mr-1.5">{trend}</span>}
          {subtitle && <span>{subtitle}</span>}
        </div>
      )}
    </Card>
  );
};

export default StatCard;
