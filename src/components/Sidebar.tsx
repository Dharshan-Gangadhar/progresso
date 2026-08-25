import React from 'react';
import {
  CheckSquare,
  BarChart3,
  CalendarDays,
  FileCheck,
  Flame,
  Timer,
  Repeat,
  Settings2,
  Sparkles,
  Layers,
  User,
} from 'lucide-react';
import { useTracker } from '../context/TrackerContext';
import { ViewTab } from '../types';
import { calculateStreaks, TODAY_ISO, getRelativeDay } from '../utils/dateUtils';

interface SidebarProps {
  onOpenHabits: () => void;
  onOpenPomodoro: () => void;
  onOpenDataMgmt: () => void;
  onOpenLogin?: () => void;
  onCloseMobile?: () => void;
}

export function Sidebar({
  onOpenHabits,
  onOpenPomodoro,
  onOpenDataMgmt,
  onOpenLogin,
  onCloseMobile,
}: SidebarProps) {
  const { activeTab, setActiveTab, tasks, getDayStats, user } = useTracker();
  const streaks = calculateStreaks(tasks);

  // Compute weekly stats (last 7 days)
  let weeklyCompleted = 0;
  let weeklyTotal = 0;
  for (let i = 0; i < 7; i++) {
    const dIso = getRelativeDay(TODAY_ISO, -i);
    const s = getDayStats(dIso);
    weeklyCompleted += s.completed;
    weeklyTotal += s.total;
  }
  const weeklyRate = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;

  const navItems: { id: ViewTab; label: string; icon: React.ReactNode }[] = [
    {
      id: 'daily',
      label: 'Daily Planner',
      icon: <CheckSquare className="w-5 h-5" />,
    },
    {
      id: 'dashboard',
      label: 'Dashboard & Trends',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: 'monthly',
      label: 'Monthly Insights',
      icon: <CalendarDays className="w-5 h-5" />,
    },
    {
      id: 'daily-report',
      label: 'Daily Standup Review',
      icon: <FileCheck className="w-5 h-5" />,
    },
  ];

  const handleNav = (tabId: ViewTab) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0 select-none">
      {/* Brand logo & title */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold shadow-xs">
          P
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-xl tracking-tight text-slate-900 leading-tight">
            Progresso
          </span>
          <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
            Task & Progress
          </span>
        </div>
      </div>

      {/* Main Navigation Links */}
      <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-1 pt-1">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Navigation
          </span>
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <span className={isActive ? 'text-indigo-600' : 'text-slate-400'}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          );
        })}

        <div className="pt-4 px-3 pb-1 border-t border-slate-100">
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Productivity Tools
          </span>
        </div>

        <button
          id="sidebar-focus-timer-btn"
          onClick={() => {
            onOpenPomodoro();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl text-sm font-medium transition-colors"
        >
          <Timer className="w-4 h-4 text-rose-500" />
          <span>Focus Timer</span>
        </button>

        <button
          id="sidebar-habits-btn"
          onClick={() => {
            onOpenHabits();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl text-sm font-medium transition-colors"
        >
          <Repeat className="w-4 h-4 text-indigo-500" />
          <span>Habit Templates</span>
        </button>

        <button
          id="sidebar-settings-btn"
          onClick={() => {
            onOpenDataMgmt();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:bg-slate-50 hover:text-slate-800 rounded-xl text-sm font-medium transition-colors"
        >
          <Settings2 className="w-4 h-4 text-slate-400" />
          <span>Backup & Data</span>
        </button>

        <button
          id="sidebar-login-btn"
          onClick={() => {
            if (onOpenLogin) onOpenLogin();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-slate-500 hover:bg-indigo-50 hover:text-indigo-700 rounded-xl text-sm font-medium transition-colors"
        >
          <User className="w-4 h-4 text-indigo-600" />
          <span>{user?.isLoggedIn ? `Account (${user.name})` : 'Sign In / Profile'}</span>
        </button>
      </nav>

      {/* Sleek Dark Footer Card */}
      <div className="p-4 border-t border-slate-100">
        <div
          id="sidebar-weekly-card"
          className="relative overflow-hidden bg-slate-900 rounded-2xl p-4 text-white shadow-md border border-slate-800/80 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-slate-300 font-medium tracking-wide">Weekly Progress</p>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/10 text-amber-300 text-xs font-bold border border-amber-400/20">
              <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{streaks.currentStreak}d streak</span>
            </div>
          </div>
          <div className="flex items-baseline justify-between mb-2.5">
            <span className="text-2xl font-bold tracking-tight text-white">{weeklyRate}%</span>
            <span className="text-[11px] font-semibold text-slate-400">
              {weeklyCompleted} of {weeklyTotal} completed
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all duration-500 shadow-xs"
              style={{ width: `${Math.min(100, Math.max(0, weeklyRate))}%` }}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
