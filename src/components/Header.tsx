import React from 'react';
import {
  Plus,
  Flame,
  Timer,
  Repeat,
  Settings2,
  Menu,
  X,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { useTracker } from '../context/TrackerContext';
import { calculateStreaks, TODAY_ISO, formatFullDate } from '../utils/dateUtils';

interface HeaderProps {
  onOpenNewTask: () => void;
  onOpenHabits: () => void;
  onOpenPomodoro: () => void;
  onOpenDataMgmt: () => void;
  onOpenLogin?: () => void;
  onToggleMobileMenu?: () => void;
  isMobileMenuOpen?: boolean;
}

export function Header({
  onOpenNewTask,
  onOpenHabits,
  onOpenPomodoro,
  onOpenDataMgmt,
  onOpenLogin,
  onToggleMobileMenu,
  isMobileMenuOpen,
}: HeaderProps) {
  const { tasks, getDayStats, user } = useTracker();
  const streaks = calculateStreaks(tasks);
  const todayStats = getDayStats(TODAY_ISO);

  // Time-of-day greeting
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  const displayName = user?.name || 'Alex';
  const avatarText = user?.avatarInitial || displayName.charAt(0).toUpperCase();

  return (
    <header className="h-20 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shrink-0">
      <div className="flex items-center gap-3">
        {/* Mobile menu toggle */}
        <button
          id="mobile-menu-toggle-btn"
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Toggle Navigation Menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Greeting & Date */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight flex items-center gap-2">
            <span>
              {greeting}, {displayName}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">{todayFormatted}</p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Streak status badge */}
        <div
          id="header-streak-badge"
          title={`Active streak: ${streaks.currentStreak} consecutive days with completed tasks`}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-amber-50/80 border border-amber-200/70 text-amber-900 rounded-xl text-xs font-bold"
        >
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <span>{streaks.currentStreak}d Streak</span>
        </div>

        {/* Today completion rate indicator */}
        <div
          id="header-today-rate-badge"
          title={`Today: ${todayStats.completed}/${todayStats.total} tasks (${todayStats.completionRate}%)`}
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{todayStats.completionRate}% Done</span>
        </div>

        {/* Quick Tools */}
        <button
          id="header-pomodoro-btn"
          onClick={onOpenPomodoro}
          className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition-colors"
          title="Focus Mode Timer"
        >
          <Timer className="w-5 h-5" />
        </button>

        <button
          id="header-habits-btn"
          onClick={onOpenHabits}
          className="hidden sm:flex p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
          title="Daily Habit Routines"
        >
          <Repeat className="w-5 h-5" />
        </button>

        <button
          id="header-settings-btn"
          onClick={onOpenDataMgmt}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Data Backup & Settings"
        >
          <Settings2 className="w-5 h-5" />
        </button>

        {/* Sleek Primary + New Task Button */}
        <button
          id="header-new-task-btn"
          onClick={onOpenNewTask}
          className="px-3.5 sm:px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-md shadow-indigo-100 transition-all flex items-center gap-1.5 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>

        {/* Avatar Profile / Login Button */}
        <button
          id="header-profile-avatar-btn"
          onClick={onOpenLogin}
          title={`${displayName} - Click to sign in or manage profile`}
          className="w-9 h-9 rounded-full bg-indigo-50 hover:bg-indigo-100 active:scale-95 border-2 border-indigo-200 text-indigo-700 font-bold text-xs flex items-center justify-center shadow-xs ml-1 transition-all cursor-pointer"
        >
          {avatarText}
        </button>
      </div>
    </header>
  );
}
