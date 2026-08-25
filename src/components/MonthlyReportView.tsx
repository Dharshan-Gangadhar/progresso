import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Clock,
  Award,
  Copy,
  Check,
  Printer,
  Sparkles,
  ArrowRight,
  BarChart2,
  Flame,
} from 'lucide-react';
import { useTracker } from '../context/TrackerContext';
import {
  getMonthMatrix,
  formatMonthYear,
  parseISODate,
  TODAY_ISO,
  formatDateToISO,
} from '../utils/dateUtils';

interface MonthlyReportViewProps {
  onSelectDay: (dateIso: string) => void;
}

export function MonthlyReportView({ onSelectDay }: MonthlyReportViewProps) {
  const { tasks, dailyLogs, getDayStats, setSelectedDate, setActiveTab } = useTracker();

  // Current selected month view (default to today: Aug 2026)
  const todayObj = parseISODate(TODAY_ISO);
  const [currentYear, setCurrentYear] = useState<number>(todayObj.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(todayObj.getMonth()); // 0-indexed

  const [copiedNotice, setCopiedNotice] = useState(false);

  const monthMatrix = useMemo(() => {
    return getMonthMatrix(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Monthly Aggregate Calculations
  const monthlyStats = useMemo(() => {
    const startStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`;
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const endStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(lastDayOfMonth).padStart(2, '0')}`;

    const monthTasks = tasks.filter((t) => t.date >= startStr && t.date <= endStr);
    const monthLogs = dailyLogs.filter((l) => l.date >= startStr && l.date <= endStr);

    const totalScheduled = monthTasks.length;
    const totalCompleted = monthTasks.filter((t) => t.status === 'completed').length;
    const totalDeferred = monthTasks.filter((t) => t.status === 'deferred').length;
    const totalMinutes = monthTasks.reduce((acc, t) => acc + (t.actualMinutes || 0), 0);
    const completionRate = totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;

    // Find best performing day
    const daysMap = new Map<string, { total: number; completed: number }>();
    monthTasks.forEach((t) => {
      const entry = daysMap.get(t.date) || { total: 0, completed: 0 };
      entry.total += 1;
      if (t.status === 'completed') entry.completed += 1;
      daysMap.set(t.date, entry);
    });

    let bestDayDate = '';
    let maxCompleted = 0;
    daysMap.forEach((val, date) => {
      if (val.completed > maxCompleted) {
        maxCompleted = val.completed;
        bestDayDate = date;
      }
    });

    // Category performance
    const catMap = new Map<string, { total: number; completed: number; mins: number }>();
    monthTasks.forEach((t) => {
      const entry = catMap.get(t.category) || { total: 0, completed: 0, mins: 0 };
      entry.total += 1;
      if (t.status === 'completed') entry.completed += 1;
      entry.mins += t.actualMinutes || 0;
      catMap.set(t.category, entry);
    });

    const categoryBreakdown = Array.from(catMap.entries())
      .map(([name, data]) => ({
        name,
        total: data.total,
        completed: data.completed,
        rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
        minutes: data.mins,
      }))
      .sort((a, b) => b.completed - a.completed);

    // Productivity score avg
    const validScores = monthLogs.map((l) => l.productivityScore).filter(Boolean);
    const avgScore = validScores.length > 0 ? (validScores.reduce((a, b) => a + b, 0) / validScores.length).toFixed(1) : 'N/A';

    return {
      totalScheduled,
      totalCompleted,
      totalDeferred,
      completionRate,
      totalMinutes,
      totalHours: (totalMinutes / 60).toFixed(1),
      bestDayDate,
      maxCompleted,
      categoryBreakdown,
      avgScore,
      monthLogsCount: monthLogs.length,
    };
  }, [tasks, dailyLogs, currentYear, currentMonth]);

  const handleCopyMarkdownReport = () => {
    const monthTitle = formatMonthYear(currentYear, currentMonth);
    const markdown = `# Monthly Progress Report: ${monthTitle}

## Executive Summary
- **Overall Task Completion Rate:** ${monthlyStats.completionRate}%
- **Completed Tasks:** ${monthlyStats.totalCompleted} / ${monthlyStats.totalScheduled}
- **Deferred Tasks:** ${monthlyStats.totalDeferred}
- **Focused Time Logged:** ${monthlyStats.totalHours} hours (${monthlyStats.totalMinutes} mins)
- **Average Productivity Score:** ${monthlyStats.avgScore} / 5★
- **Peak Performance Day:** ${monthlyStats.bestDayDate || 'N/A'} (${monthlyStats.maxCompleted} tasks done)

## Category Breakdown
${monthlyStats.categoryBreakdown
  .map(
    (c) =>
      `- **${c.name}:** ${c.completed}/${c.total} completed (${c.rate}%) — ${Math.round(c.minutes / 60)}h ${c.minutes % 60}m logged`
  )
  .join('\n')}

---
*Generated by Task & Progress Tracker on ${new Date().toLocaleDateString()}*
`;

    navigator.clipboard.writeText(markdown);
    setCopiedNotice(true);
    setTimeout(() => setCopiedNotice(false), 2500);
  };

  const handleDayClick = (dateIso: string) => {
    setSelectedDate(dateIso);
    setActiveTab('daily');
    onSelectDay(dateIso);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Month Navigator Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-none">
              {formatMonthYear(currentYear, currentMonth)}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Monthly execution summary and day-by-day heatmap
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              id="prev-month-btn"
              onClick={handlePrevMonth}
              className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setCurrentYear(todayObj.getFullYear());
                setCurrentMonth(todayObj.getMonth());
              }}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:text-indigo-600"
            >
              Current Month
            </button>
            <button
              id="next-month-btn"
              onClick={handleNextMonth}
              className="p-1.5 hover:bg-white text-slate-700 rounded-lg transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            id="copy-markdown-report-btn"
            onClick={handleCopyMarkdownReport}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            {copiedNotice ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Summary</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Monthly Executive Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Monthly Completion Rate
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-indigo-950">
              {monthlyStats.completionRate}%
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {monthlyStats.totalCompleted} done / {monthlyStats.totalScheduled} scheduled
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Focused Hours Logged
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-emerald-950">
              {monthlyStats.totalHours} <span className="text-base font-semibold text-slate-500">Hours</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Total of {monthlyStats.totalMinutes} focused minutes
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Peak Productivity Day
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-xl font-extrabold text-slate-900">
              {monthlyStats.bestDayDate ? parseISODate(monthlyStats.bestDayDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A'}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {monthlyStats.maxCompleted} completed tasks
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Avg Review Score
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold text-amber-950">
              {monthlyStats.avgScore} <span className="text-base font-semibold text-slate-500">/ 5★</span>
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Based on daily reflection entries
          </p>
        </div>
      </div>

      {/* Interactive Monthly Heatmap & Calendar Matrix */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Monthly Calendar & Completion Matrix
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any day to jump directly into daily task management
            </p>
          </div>

          {/* Color Legend */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500" />
              <span>80%+ Done</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-indigo-500" />
              <span>50-79%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-400" />
              <span>&lt;50%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-slate-200" />
              <span>None</span>
            </div>
          </div>
        </div>

        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider py-1 border-b border-slate-100">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Calendar Day Grid */}
        <div className="grid grid-cols-7 gap-2">
          {monthMatrix.flat().map((dateIso, idx) => {
            if (!dateIso) {
              return (
                <div
                  key={`empty-${idx}`}
                  className="min-h-[85px] bg-slate-50/40 rounded-xl border border-transparent p-2 opacity-30"
                />
              );
            }

            const stats = getDayStats(dateIso);
            const isToday = dateIso === TODAY_ISO;
            const dayNumber = parseISODate(dateIso).getDate();

            // Card highlight color based on completion rate
            let badgeColor = 'bg-slate-100 text-slate-600';
            let barColor = 'bg-slate-300';
            if (stats.total > 0) {
              if (stats.completionRate >= 80) {
                badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                barColor = 'bg-emerald-500';
              } else if (stats.completionRate >= 50) {
                badgeColor = 'bg-indigo-50 text-indigo-800 border-indigo-200';
                barColor = 'bg-indigo-600';
              } else {
                badgeColor = 'bg-amber-50 text-amber-800 border-amber-200';
                barColor = 'bg-amber-500';
              }
            }

            return (
              <button
                key={dateIso}
                id={`calendar-cell-${dateIso}`}
                onClick={() => handleDayClick(dateIso)}
                className={`min-h-[85px] p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] flex flex-col justify-between ${
                  isToday
                    ? 'border-indigo-500 bg-indigo-50/20 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-bold ${
                      isToday ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center' : 'text-slate-900'
                    }`}
                  >
                    {dayNumber}
                  </span>
                  {stats.total > 0 && (
                    <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded border ${badgeColor}`}>
                      {stats.completionRate}%
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 mt-2">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {stats.total > 0 ? `${stats.completed}/${stats.total} done` : 'No tasks'}
                    </span>
                    {stats.actualMinutes > 0 && <span>{stats.actualMinutes}m</span>}
                  </div>

                  {/* Progress bar */}
                  {stats.total > 0 && (
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor}`}
                        style={{ width: `${stats.completionRate}%` }}
                      />
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Monthly Category Performance Table */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-base font-bold text-slate-900">
          Domain & Category Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <th className="pb-3 pl-2">Category</th>
                <th className="pb-3 text-center">Tasks Planned</th>
                <th className="pb-3 text-center">Tasks Completed</th>
                <th className="pb-3 text-center">Completion Rate</th>
                <th className="pb-3 text-right pr-2">Total Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyStats.categoryBreakdown.map((cat) => (
                <tr key={cat.name} className="hover:bg-slate-50 transition-colors">
                  <td className="py-3 pl-2 font-semibold text-slate-900">{cat.name}</td>
                  <td className="py-3 text-center text-slate-600">{cat.total}</td>
                  <td className="py-3 text-center font-bold text-emerald-600">{cat.completed}</td>
                  <td className="py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-bold text-slate-900">{cat.rate}%</span>
                      <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden hidden sm:block">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${cat.rate}%` }} />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right pr-2 font-medium text-slate-700">
                    {Math.round(cat.minutes / 60)}h {cat.minutes % 60}m
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
