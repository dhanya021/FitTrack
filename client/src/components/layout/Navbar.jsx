import React from 'react';
import { Sun, Moon, Menu } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

export const Navbar = ({ onOpenMobileMenu }) => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-20 h-16 sm:h-20 bg-white/80 dark:bg-[#0B0F17]/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 flex items-center justify-between transition-colors">
      {/* Mobile Hamburger & Welcome */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Open mobile navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0] || 'Athlete'}
          </h2>
          <p className="hidden sm:block text-xs text-slate-400 dark:text-slate-500 font-medium">
            Stay consistent, reach your peak performance today.
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all shadow-sm"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>
    </header>
  );
};

export default Navbar;
