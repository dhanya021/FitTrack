import React from 'react';

export const Badge = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    primary: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40',
    easy: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40',
    moderate: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/40',
    hard: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/40',
    blue: 'bg-sky-50 text-sky-700 dark:bg-sky-950/60 dark:text-sky-400 border border-sky-200/50 dark:border-sky-800/40',
    purple: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200/50 dark:border-purple-800/40',
    completed: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40',
    progress: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/40',
    paused: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 font-medium rounded-md',
    md: 'text-xs px-2.5 py-1 font-semibold rounded-lg'
  };

  const selectedVariant = variants[variant.toLowerCase()] || variants.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 transition-colors ${selectedVariant} ${sizes[size] || sizes.md} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
