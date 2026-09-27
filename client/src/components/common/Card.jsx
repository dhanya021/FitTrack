import React from 'react';

export const Card = ({
  children,
  className = '',
  hoverEffect = false,
  glass = false,
  onClick,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`rounded-2xl transition-all duration-200 ${
        glass
          ? 'glass-panel'
          : 'bg-white dark:bg-[#131B2A] border border-slate-100 dark:border-slate-800/80 shadow-sm'
      } ${
        hoverEffect
          ? 'hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700/80 cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
