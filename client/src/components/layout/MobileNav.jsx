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
  X,
  Zap,
  LogOut
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const mobileDrawerItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Workouts', path: '/workouts', icon: Dumbbell },
  { name: 'Activity', path: '/activity', icon: Flame },
  { name: 'Hydration', path: '/hydration', icon: Droplets },
  { name: 'Sleep', path: '/sleep', icon: Moon },
  { name: 'Goals', path: '/goals', icon: Target },
  { name: 'Progress', path: '/progress', icon: TrendingUp },
  { name: 'Settings', path: '/settings', icon: Settings }
];

const bottomBarItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Workouts', path: '/workouts', icon: Dumbbell },
  { name: 'Activity', path: '/activity', icon: Flame },
  { name: 'Hydration', path: '/hydration', icon: Droplets },
  { name: 'Progress', path: '/progress', icon: TrendingUp }
];

export const MobileDrawer = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="relative w-72 max-w-[80vw] bg-white dark:bg-[#101726] h-full shadow-2xl flex flex-col z-10 p-5">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-emerald-400 flex items-center justify-center text-white">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white">
              FitTrack
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
          {mobileDrawerItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm ${
                    isActive
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
            {user?.name}
          </p>
          <p className="text-[11px] text-slate-400 truncate mb-3">
            {user?.email}
          </p>
          <button
            onClick={() => {
              onClose();
              logout();
            }}
            className="flex items-center gap-2 text-xs font-semibold text-rose-500 hover:text-rose-600 py-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const BottomNav = () => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 dark:bg-[#101726]/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 px-2 py-2 flex items-center justify-around shadow-lg">
      {bottomBarItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{item.name}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default { MobileDrawer, BottomNav };
