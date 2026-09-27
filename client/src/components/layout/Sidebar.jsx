import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Dumbbell,
  Flame,
  Droplets,
  Moon,
  Target,
  TrendingUp,
  Settings,
  LogOut,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Workouts', path: '/workouts', icon: Dumbbell },
  { name: 'Activity', path: '/activity', icon: Flame },
  { name: 'Hydration', path: '/hydration', icon: Droplets },
  { name: 'Sleep', path: '/sleep', icon: Moon },
  { name: 'Goals', path: '/goals', icon: Target },
  { name: 'Progress', path: '/progress', icon: TrendingUp },
  { name: 'Settings', path: '/settings', icon: Settings }
];

export const Sidebar = () => {
  const { user, logout } = useAuth();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen sticky top-0 bg-white dark:bg-[#101726] border-r border-slate-200/80 dark:border-slate-800/80 select-none z-30">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-100 dark:border-slate-800/60">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-brand-500/25 text-white">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <div>
          <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            FitTrack
          </span>
          <span className="block text-[10px] uppercase font-bold tracking-widest text-brand-600 dark:text-brand-400">
            Performance
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold shadow-sm dark:bg-brand-500/15'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={`w-5 h-5 transition-transform duration-150 ${
                      isActive ? 'text-brand-500 scale-105' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.name}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-800 text-brand-600 dark:text-brand-400 font-bold flex items-center justify-center text-sm flex-shrink-0 border border-slate-300 dark:border-slate-700">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="truncate">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-[11px] text-slate-400 truncate">
                {user?.email || ''}
              </p>
            </div>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors flex-shrink-0"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
