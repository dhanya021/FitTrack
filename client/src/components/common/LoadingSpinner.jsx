import React from 'react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading data...' }) => {
  const sizes = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4'
  };

  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3">
      <div
        className={`${sizes[size] || sizes.md} rounded-full border-brand-500/20 border-t-brand-500 animate-spin`}
      />
      {text && (
        <p className="text-xs font-medium text-slate-400 dark:text-slate-500 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
};

export const SkeletonCard = ({ count = 3, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-28 rounded-2xl bg-slate-200/60 dark:bg-slate-800/50 animate-pulse border border-slate-100 dark:border-slate-800"
        />
      ))}
    </div>
  );
};

export default LoadingSpinner;
