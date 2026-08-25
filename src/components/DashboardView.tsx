import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  TrendingUp,
  Flame,
  CheckCircle2,
  Clock,
  Award,
  Zap,
  Layers,
  Activity,
  ArrowUpRight,
} from 'lucide-react';
import { useTracker } from '../context/TrackerContext';
import { TODAY_ISO, getRelativeDay, parseISODate, calculateStreaks } from '../utils/dateUtils';
import { TaskPriority } from '../types';

const CATEGORY_COLORS = [
  '#4f46e5', // indigo-600
  '#06b6d4', // cyan-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ec4899', // pink-500
  '#8b5cf6', // purple-500
  '#64748b', // slate-500
];

export function DashboardView() {
  const { tasks, dailyLogs, getDayStats } = useTracker();
  const [timeRange, setTimeRange] = useState<7 | 14 | 30>(14);

  const streaks = calculateStreaks(tasks);

  // Generate date series for the selected range
  const trendData = useMemo(() => {
    const data = [];
    for (let i = timeRange - 1; i >= 0; i--) {
      const dateStr = getRelativeDay(TODAY_ISO, -i);
      const stats = getDayStats(dateStr);
      const d = parseISODate(dateStr);
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const weekday = d.toLocaleDateString('en-US', { weekday: 'short' });

      data.push({
        date: dateStr,
        label,
        weekday,
        completionRate: stats.completionRate,
        total: stats.total,
        completed: stats.completed,
        todo: stats.todo,
        deferred: stats.deferred,
        actualMinutes: stats.actualMinutes,
      });
    }
    return data;
  }, [timeRange, tasks, getDayStats]);

  // Overall aggregate stats for the past 30 days
  const aggregate30DayStats = useMemo(() => {
    let totalScheduled = 0;
    let totalCompleted = 0;
    let totalMinutes = 0;
    let daysWithTasks = 0;

    for (let i = 29; i >= 0; i--) {
      const dateStr = getRelativeDay(TODAY_ISO, -i);
      const stats = getDayStats(dateStr);
      if (stats.total > 0) {
        daysWithTasks++;
        totalScheduled += stats.total;
        totalCompleted += stats.completed;
        totalMinutes += stats.actualMinutes;
      }
    }

    const overallRate =
      totalScheduled > 0 ? Math.round((totalCompleted / totalScheduled) * 100) : 0;
    const avgTasksPerDay =
      daysWithTasks > 0 ? (totalCompleted / daysWithTasks).toFixed(1) : '0';
    const totalHours = (totalMinutes / 60).toFixed(1);

    return {
      totalScheduled,
      totalCompleted,
      overallRate,
      avgTasksPerDay,
      totalHours,
      daysWithTasks,
    };
  }, [tasks, getDayStats]);

  // Category breakdown
  const categoryStats = useMemo(() => {
    const map = new Map<string, { total: number; completed: number; minutes: number }>();

    for (let i = 29; i >= 0; i--) {
      const dateStr = getRelativeDay(TODAY_ISO, -i);
      const dayTasks = tasks.filter((t) => t.date === dateStr);
      dayTasks.forEach((t) => {
        const entry = map.get(t.category) || { total: 0, completed: 0, minutes: 0 };
        entry.total += 1;
        if (t.status === 'completed') {
          entry.completed += 1;
        }
        entry.minutes += t.actualMinutes || 0;
        map.set(t.category, entry);
      });
    }

    const result = Array.from(map.entries()).map(([name, data]) => ({
      name,
      total: data.total,
      completed: data.completed,
      minutes: data.minutes,
      rate: data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0,
    }));

    return result.sort((a, b) => b.total - a.total);
  }, [tasks]);

  // Priority breakdown
  const priorityStats = useMemo(() => {
    const map: Record<TaskPriority, { total: number; completed: number }> = {
      high: { total: 0, completed: 0 },
      medium: { total: 0, completed: 0 },
      low: { total: 0, completed: 0 },
    };

    for (let i = 29; i >= 0; i--) {
      const dateStr = getRelativeDay(TODAY_ISO, -i);
      const dayTasks = tasks.filter((t) => t.date === dateStr);
      dayTasks.forEach((t) => {
        if (map[t.priority]) {
          map[t.priority].total += 1;
          if (t.status === 'completed') {
            map[t.priority].completed += 1;
          }
        }
      });
    }

    return [
      {
        priority: 'High Priority',
        total: map.high.total,
        completed: map.high.completed,
        rate: map.high.total > 0 ? Math.round((map.high.completed / map.high.total) * 100) : 0,
      },
      {
        priority: 'Medium Priority',
        total: map.medium.total,
        completed: map.medium.completed,
        rate: map.medium.total > 0 ? Math.round((map.medium.completed / map.medium.total) * 100) : 0,
      },
      {
        priority: 'Low Priority',
        total: map.low.total,
        completed: map.low.completed,
        rate: map.low.total > 0 ? Math.round((map.low.completed / map.low.total) * 100) : 0,
      },
    ];
  }, [tasks]);

  // Day of Week Performance (Mon - Sun)
  const dayOfWeekStats = useMemo(() => {
    const days = [
      { day: 'Mon', dayIdx: 1, total: 0, completed: 0 },
      { day: 'Tue', dayIdx: 2, total: 0, completed: 0 },
      { day: 'Wed', dayIdx: 3, total: 0, completed: 0 },
      { day: 'Thu', dayIdx: 4, total: 0, completed: 0 },
      { day: 'Fri', dayIdx: 5, total: 0, completed: 0 },
      { day: 'Sat', dayIdx: 6, total: 0, completed: 0 },
      { day: 'Sun', dayIdx: 0, total: 0, completed: 0 },
    ];

    for (let i = 29; i >= 0; i--) {
      const dateStr = getRelativeDay(TODAY_ISO, -i);
      const d = parseISODate(dateStr);
      const dayIdx = d.getDay();
      const stats = getDayStats(dateStr);

      const target = days.find((item) => item.dayIdx === dayIdx);
      if (target) {
        target.total += stats.total;
        target.completed += stats.completed;
      }
    }

    return days.map((d) => ({
      day: d.day,
      rate: d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0,
      completed: d.completed,
      total: d.total,
    }));
  }, [tasks, getDayStats]);

  // Average productivity score
  const avgProductivityScore = useMemo(() => {
    const relevantLogs = dailyLogs.filter((l) => l.productivityScore > 0);
    if (relevantLogs.length === 0) return 4.2;
    const sum = relevantLogs.reduce((acc, l) => acc + l.productivityScore, 0);
    return (sum / relevantLogs.length).toFixed(1);
  }, [dailyLogs]);

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Sleek Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              30-Day Completion
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {aggregate30DayStats.overallRate}%
              </span>
              <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5" /> High
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              {aggregate30DayStats.totalCompleted} / {aggregate30DayStats.totalScheduled} tasks done
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Active Streak
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {streaks.currentStreak}
              </span>
              <span className="text-sm font-semibold text-slate-500">Days</span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Best record: <strong className="text-slate-700">{streaks.bestStreak} days</strong>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Flame className="w-6 h-6 fill-amber-500" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Focus Time Logged
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {aggregate30DayStats.totalHours}
              </span>
              <span className="text-sm font-semibold text-slate-500">Hrs</span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Avg {aggregate30DayStats.avgTasksPerDay} tasks/day
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Avg Review Rating
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                {avgProductivityScore}
              </span>
              <span className="text-sm font-semibold text-slate-500">/ 5★</span>
            </div>
            <p className="text-xs text-slate-400 font-medium mt-1">
              Across {dailyLogs.length} reflection entries
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Productivity Trend Chart (Matching Sleek Interface Aesthetics) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Productivity Trend & Completion Rate
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Daily execution percentage and task volume
            </p>
          </div>

          {/* Time range selector pills */}
          <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
            {([7, 14, 30] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                  timeRange === r
                    ? 'bg-white text-indigo-600 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {r} Days
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="sleekRateGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                domain={[0, 100]}
                unit="%"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1">
                        <div className="font-bold border-b border-slate-700 pb-1">
                          {data.label} ({data.weekday})
                        </div>
                        <div className="text-indigo-300 font-semibold">
                          Completion Rate: {data.completionRate}%
                        </div>
                        <div className="text-emerald-300">
                          Completed: {data.completed} / {data.total} tasks
                        </div>
                        <div className="text-slate-300">Focused Time: {data.actualMinutes}m</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                yAxisId="right"
                dataKey="total"
                name="Scheduled"
                fill="#e2e8f0"
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
              />
              <Bar
                yAxisId="right"
                dataKey="completed"
                name="Completed"
                fill="#4f46e5"
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
              />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="completionRate"
                name="Completion %"
                stroke="#4f46e5"
                strokeWidth={2.5}
                fill="url(#sleekRateGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-2 text-xs font-medium text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span>Completion Rate (%)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span>Tasks Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            <span>Total Tasks Scheduled</span>
          </div>
        </div>
      </div>

      {/* Grid: Category Breakdown & Priority Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Category Breakdown (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                Category Distribution & Efficiency
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-0.5">
                Task completion breakdown across personal and work domains
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Donut Chart */}
            <div className="sm:col-span-5 h-52 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryStats}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    paddingAngle={3}
                  >
                    {categoryStats.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs space-y-0.5">
                            <div className="font-bold">{d.name}</div>
                            <div>Total: {d.total} tasks</div>
                            <div>Completed: {d.completed} ({d.rate}%)</div>
                            <div>Time: {Math.round(d.minutes / 60)}h {d.minutes % 60}m</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category list progress bars */}
            <div className="sm:col-span-7 space-y-3">
              {categoryStats.slice(0, 5).map((cat, idx) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 font-semibold text-slate-800">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                      />
                      <span>{cat.name}</span>
                    </div>
                    <span className="font-bold text-slate-700">
                      {cat.completed}/{cat.total} ({cat.rate}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${cat.rate}%`,
                        backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Matrix & Weekday Output (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Priority Execution Matrix */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              Priority Execution Matrix
            </h3>

            <div className="space-y-3">
              {priorityStats.map((item) => (
                <div
                  key={item.priority}
                  className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800">{item.priority}</span>
                    <span className="text-indigo-600 font-bold">{item.rate}% rate</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>{item.completed} completed</span>
                    <span>{item.total} scheduled</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full"
                      style={{ width: `${item.rate}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Productivity by Day of Week */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-500" />
              Productivity by Day of Week
            </h3>

            <div className="h-36 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeekStats} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f8fafc" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    unit="%"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded-xl text-xs">
                            <div className="font-bold">{d.day}</div>
                            <div>Completion: {d.rate}%</div>
                            <div>Completed: {d.completed}/{d.total} tasks</div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="rate"
                    name="Completion %"
                    fill="#4f46e5"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
