import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Copy,
  Check,
  Smile,
  Flame,
  ArrowRightLeft,
  Share2,
  FileText,
} from 'lucide-react';
import { useTracker } from '../context/TrackerContext';
import {
  formatFriendlyDate,
  formatFullDate,
  getRelativeDay,
  TODAY_ISO,
  parseISODate,
} from '../utils/dateUtils';

export function DailyReportView() {
  const { tasks, dailyLogs, selectedDate, setSelectedDate, getDayStats } = useTracker();
  const [copied, setCopied] = useState(false);

  const dayStats = getDayStats(selectedDate);
  const dayTasks = tasks.filter((t) => t.date === selectedDate);
  const dayLog = dailyLogs.find((l) => l.date === selectedDate);

  const completedTasks = dayTasks.filter((t) => t.status === 'completed');
  const inProgressTasks = dayTasks.filter((t) => t.status === 'in-progress');
  const todoTasks = dayTasks.filter((t) => t.status === 'todo');
  const deferredTasks = dayTasks.filter((t) => t.status === 'deferred');

  const handleCopyReport = () => {
    const reportText = `📋 Daily Execution Report: ${formatFullDate(selectedDate)}
--------------------------------------------------
Completion Rate: ${dayStats.completionRate}% (${dayStats.completed}/${dayStats.total} Tasks Completed)
Focused Time Logged: ${dayStats.actualMinutes} minutes (Est: ${dayStats.estimatedMinutes}m)
Productivity Rating: ${dayLog?.productivityScore ? `${dayLog.productivityScore}/5 ★` : 'N/A'}
Mood / State: ${dayLog?.mood || 'N/A'}

✅ Completed Tasks (${completedTasks.length}):
${
  completedTasks.length > 0
    ? completedTasks.map((t) => `• [x] ${t.title} (${t.category}, ${t.actualMinutes}m)${t.notes ? ` - ${t.notes}` : ''}`).join('\n')
    : '• None'
}

⏳ In Progress / Pending (${inProgressTasks.length + todoTasks.length}):
${
  [...inProgressTasks, ...todoTasks].length > 0
    ? [...inProgressTasks, ...todoTasks].map((t) => `• [ ] ${t.title} (${t.priority} priority, ${t.estimatedMinutes}m est)`).join('\n')
    : '• None'
}

${
  deferredTasks.length > 0
    ? `↪️ Deferred / Rolled (${deferredTasks.length}):\n` +
      deferredTasks.map((t) => `• [deferred] ${t.title}`).join('\n')
    : ''
}

📝 Daily Reflection:
${dayLog?.reflectionNote || 'No reflection logged for today.'}
--------------------------------------------------`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const moodLabels = {
    energized: '⚡ Energized & High Output',
    focused: '🎯 Focused & Flow State',
    steady: '🌿 Steady & Consistent',
    tired: '🥱 Fatigued / Low Energy',
    overwhelmed: '🌪️ Overwhelmed',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Date Header & Switcher */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 leading-none">
                {formatFriendlyDate(selectedDate)} Review
              </h2>
              {selectedDate === TODAY_ISO && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Today
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">{formatFullDate(selectedDate)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedDate(getRelativeDay(selectedDate, -1))}
              className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition-colors"
              title="Previous Day"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setSelectedDate(TODAY_ISO)}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-indigo-600"
            >
              Today
            </button>
            <button
              onClick={() => setSelectedDate(getRelativeDay(selectedDate, 1))}
              className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition-colors"
              title="Next Day"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            id="copy-daily-report-btn"
            onClick={handleCopyReport}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied Report!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Standup Report</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Completion Rate
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-slate-900">
              {dayStats.completionRate}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {dayStats.completed} of {dayStats.total} tasks completed
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Time Logged vs Estimated
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-emerald-950">
              {dayStats.actualMinutes}m
            </span>
            <span className="text-xs text-slate-500">/ {dayStats.estimatedMinutes}m est.</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {dayStats.actualMinutes >= dayStats.estimatedMinutes ? 'Met planned duration' : 'Under estimated time'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Productivity Rating
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-amber-950">
              {dayLog?.productivityScore ? `${dayLog.productivityScore} / 5★` : 'Unrated'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {dayLog?.mood ? moodLabels[dayLog.mood] || dayLog.mood : 'No mood logged'}
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Task Status Breakdown
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg">
              {dayStats.completed} Done
            </span>
            <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 font-bold rounded-lg">
              {dayStats.inProgress} Active
            </span>
            <span className="text-xs px-2 py-1 bg-slate-100 text-slate-700 font-bold rounded-lg">
              {dayStats.todo} Left
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Completed Tasks vs Incomplete Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completed Tasks List */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Completed Tasks ({completedTasks.length})
            </h3>
          </div>

          {completedTasks.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-4 text-center">
              No tasks completed yet for this day.
            </p>
          ) : (
            <div className="space-y-2.5">
              {completedTasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 bg-emerald-50/30 border border-emerald-100 rounded-xl space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">{t.title}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {t.category}
                    </span>
                  </div>
                  {t.notes && <p className="text-xs text-slate-600">{t.notes}</p>}
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {t.actualMinutes} mins focused
                    </span>
                    {t.completedAt && (
                      <span>
                        Done at {new Date(t.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending & Deferred Tasks */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-500" />
              In Progress & Pending ({inProgressTasks.length + todoTasks.length + deferredTasks.length})
            </h3>
          </div>

          {inProgressTasks.length === 0 && todoTasks.length === 0 && deferredTasks.length === 0 ? (
            <p className="text-xs text-emerald-600 font-semibold py-4 text-center">
              🎉 All planned tasks for this day were completed!
            </p>
          ) : (
            <div className="space-y-2.5">
              {[...inProgressTasks, ...todoTasks, ...deferredTasks].map((t) => (
                <div
                  key={t.id}
                  className="p-3.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-900">{t.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        t.status === 'in-progress'
                          ? 'bg-amber-100 text-amber-800'
                          : t.status === 'deferred'
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
                    <span>Priority: {t.priority}</span>
                    <span>•</span>
                    <span>Est: {t.estimatedMinutes}m</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Daily Reflection Notes Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-3">
        <h3 className="text-base font-bold text-slate-900">
          Daily Reflection & Standup Notes
        </h3>
        {dayLog?.reflectionNote ? (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70 text-slate-800 text-sm leading-relaxed">
            {dayLog.reflectionNote}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">
            No reflection recorded for this day yet. You can write one in the Daily Tasks tab.
          </p>
        )}
      </div>
    </div>
  );
}
