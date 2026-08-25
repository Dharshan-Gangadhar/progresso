import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  Plus,
  Search,
  ArrowRightLeft,
  Sparkles,
  Edit2,
  Trash2,
  Flame,
  Check,
  TrendingUp,
  CheckSquare,
  Award,
} from 'lucide-react';
import { useTracker } from '../context/TrackerContext';
import { Task, TaskPriority, TaskStatus, DailyLog } from '../types';
import {
  TODAY_ISO,
  formatFriendlyDate,
  formatFullDate,
  getRelativeDay,
  getWeekDays,
} from '../utils/dateUtils';

interface DailyTaskViewProps {
  onOpenNewTask: (date?: string) => void;
  onEditTask: (task: Task) => void;
  onStartFocusOnTask: (task: Task) => void;
}

export function DailyTaskView({
  onOpenNewTask,
  onEditTask,
  onStartFocusOnTask,
}: DailyTaskViewProps) {
  const {
    tasks,
    selectedDate,
    setSelectedDate,
    toggleTaskStatus,
    setTaskStatus,
    deleteTask,
    addTask,
    rolloverUnfinishedTasks,
    applyHabitTemplates,
    getDayStats,
    dailyLogs,
    saveDailyLog,
    categories,
  } = useTracker();

  // Quick inline add state
  const [quickTitle, setQuickTitle] = useState('');
  const [quickCategory, setQuickCategory] = useState('Work');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium');
  const [quickMinutes, setQuickMinutes] = useState(30);

  // Filters
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<string | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Daily Log State for selected day
  const existingLog = dailyLogs.find((l) => l.date === selectedDate);
  const [prodScore, setProdScore] = useState<number>(existingLog?.productivityScore || 4);
  const [mood, setMood] = useState<DailyLog['mood']>(existingLog?.mood || 'focused');
  const [reflection, setReflection] = useState<string>(existingLog?.reflectionNote || '');
  const [logSavedFeedback, setLogSavedFeedback] = useState(false);

  // Notification for rollover/routine actions
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Day calculations
  const dayStats = getDayStats(selectedDate);
  const weekDays = getWeekDays(selectedDate);
  const dayTasks = tasks.filter((t) => t.date === selectedDate);

  // Monthly completed count calculation for the milestone card
  const currentMonthPrefix = selectedDate.substring(0, 7);
  const monthCompletedTasks = tasks.filter(
    (t) => t.date.startsWith(currentMonthPrefix) && t.status === 'completed'
  ).length;
  const monthTargetTasks = 60;
  const monthProgressPercent = Math.min(100, Math.round((monthCompletedTasks / monthTargetTasks) * 100));

  // Filtered tasks
  const filteredTasks = dayTasks.filter((task) => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterPriority !== 'all' && task.priority !== filterPriority) return false;
    if (filterCategory !== 'all' && task.category !== filterCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = task.title.toLowerCase().includes(q);
      const matchNotes = task.notes?.toLowerCase().includes(q);
      const matchCat = task.category.toLowerCase().includes(q);
      if (!matchTitle && !matchNotes && !matchCat) return false;
    }
    return true;
  });

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;

    addTask({
      title: quickTitle.trim(),
      date: selectedDate,
      status: 'todo',
      priority: quickPriority,
      category: quickCategory,
      estimatedMinutes: Number(quickMinutes) || 25,
      actualMinutes: 0,
    });

    setQuickTitle('');
  };

  const handleSaveDailyLog = (e: React.FormEvent) => {
    e.preventDefault();
    saveDailyLog({
      date: selectedDate,
      productivityScore: prodScore,
      mood,
      reflectionNote: reflection.trim(),
      mainHighlight: dayTasks.find((t) => t.status === 'completed')?.title,
    });
    setLogSavedFeedback(true);
    setTimeout(() => setLogSavedFeedback(false), 2500);
  };

  const handleRollover = () => {
    const yesterdayIso = getRelativeDay(selectedDate, -1);
    const count = rolloverUnfinishedTasks(yesterdayIso, selectedDate);
    if (count > 0) {
      setActionNotice(
        `Rolled over ${count} unfinished tasks from ${formatFriendlyDate(yesterdayIso)} to ${formatFriendlyDate(selectedDate)}!`
      );
    } else {
      setActionNotice(`No pending tasks to rollover from ${formatFriendlyDate(yesterdayIso)}.`);
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  const handleApplyHabits = () => {
    const count = applyHabitTemplates(selectedDate);
    if (count > 0) {
      setActionNotice(
        `Added ${count} recurring habits for ${formatFriendlyDate(selectedDate)}!`
      );
    } else {
      setActionNotice(`All active habits already exist for ${formatFriendlyDate(selectedDate)}.`);
    }
    setTimeout(() => setActionNotice(null), 3500);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Date Switcher Ribbon */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Day Title & Navigation */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button
                id="prev-day-btn"
                onClick={() => setSelectedDate(getRelativeDay(selectedDate, -1))}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                id="jump-today-btn"
                onClick={() => setSelectedDate(TODAY_ISO)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                  selectedDate === TODAY_ISO
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Today
              </button>
              <button
                id="next-day-btn"
                onClick={() => setSelectedDate(getRelativeDay(selectedDate, 1))}
                className="p-1.5 rounded-lg hover:bg-white text-slate-700 transition-colors"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 leading-none">
                  {formatFriendlyDate(selectedDate)}
                </h2>
                {selectedDate === TODAY_ISO && (
                  <span className="text-emerald-600 text-[10px] font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    Today
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">{formatFullDate(selectedDate)}</p>
            </div>
          </div>

          {/* Date Picker Input */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <input
                id="native-date-selector"
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && setSelectedDate(e.target.value)}
                className="bg-transparent text-slate-800 text-xs font-semibold focus:outline-none cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 7-Day Interactive Ribbon */}
        <div className="grid grid-cols-7 gap-2 pt-2 border-t border-slate-100">
          {weekDays.map((day) => {
            const stats = getDayStats(day.date);
            const isSelected = day.isCenter;
            return (
              <button
                key={day.date}
                id={`day-ribbon-${day.date}`}
                onClick={() => setSelectedDate(day.date)}
                className={`flex flex-col items-center py-2.5 px-1 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20'
                    : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <span
                  className={`text-[10px] font-semibold uppercase tracking-wider ${
                    isSelected ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {day.dayName}
                </span>
                <span className="text-sm font-bold my-0.5">{day.dayNumber}</span>
                {/* Progress bar indicator */}
                <div className="w-full max-w-[28px] h-1 bg-black/10 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-500'}`}
                    style={{ width: `${stats.completionRate}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-900 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-indigo-500 hover:text-indigo-700 font-medium"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tasks List & Quick Add (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Quick inline task add */}
          <form
            onSubmit={handleQuickAdd}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm space-y-3"
          >
            <div className="flex items-center gap-2">
              <input
                id="inline-task-title"
                type="text"
                placeholder={`+ Add a new task for ${formatFriendlyDate(selectedDate)}...`}
                value={quickTitle}
                onChange={(e) => setQuickTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <button
                id="inline-add-task-btn"
                type="submit"
                disabled={!quickTitle.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-100 transition-all shrink-0 flex items-center gap-1 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Task
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={quickCategory}
                  onChange={(e) => setQuickCategory(e.target.value)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-700 font-medium text-xs focus:outline-none"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
                  {(['low', 'medium', 'high'] as TaskPriority[]).map((p) => {
                    const isSelected = quickPriority === p;
                    const colors = {
                      low: isSelected ? 'bg-emerald-600 text-white' : 'text-slate-600',
                      medium: isSelected ? 'bg-amber-500 text-white' : 'text-slate-600',
                      high: isSelected ? 'bg-rose-600 text-white' : 'text-slate-600',
                    };
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setQuickPriority(p)}
                        className={`px-2 py-0.5 text-[11px] font-bold capitalize rounded-md transition-all ${colors[p]}`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-1 text-slate-500 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-lg">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={quickMinutes}
                    onChange={(e) => setQuickMinutes(Number(e.target.value))}
                    className="w-10 bg-transparent text-slate-800 font-semibold focus:outline-none text-right"
                  />
                  <span>m</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onOpenNewTask(selectedDate)}
                className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 hover:underline"
              >
                <span>Full Details Form</span>
              </button>
            </div>
          </form>

          {/* Filters & Search Header */}
          <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-700 font-medium text-xs focus:outline-none"
              >
                <option value="all">All Statuses ({dayTasks.length})</option>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="deferred">Deferred</option>
              </select>

              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value as any)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-700 font-medium text-xs focus:outline-none"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-lg text-slate-700 font-medium text-xs focus:outline-none"
              >
                <option value="all">All Categories</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sleek Task List */}
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center border border-slate-100 shadow-sm space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                  <CheckSquare className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">No tasks found for this view</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    {dayTasks.length === 0
                      ? `No tasks scheduled for ${formatFriendlyDate(selectedDate)}. Add your first task or populate recurring habits.`
                      : 'No tasks match your current filter settings.'}
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={handleApplyHabits}
                    className="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Apply Routines
                  </button>
                  <button
                    onClick={() => onOpenNewTask(selectedDate)}
                    className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-100"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Task
                  </button>
                </div>
              </div>
            ) : (
              filteredTasks.map((task) => {
                const isCompleted = task.status === 'completed';
                const isInProgress = task.status === 'in-progress';
                const isDeferred = task.status === 'deferred';

                return (
                  <div
                    key={task.id}
                    id={`task-item-${task.id}`}
                    className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                      isCompleted
                        ? 'border-slate-100 bg-slate-50/50'
                        : isInProgress
                        ? 'border-indigo-200/80 bg-indigo-50/20 shadow-xs'
                        : 'bg-white border-slate-100 hover:border-indigo-200 shadow-xs'
                    }`}
                  >
                    {/* Left: Sleek Square Checkbox + Info */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Sleek square checkbox matching design theme */}
                      <button
                        id={`toggle-task-${task.id}`}
                        onClick={() => toggleTaskStatus(task.id)}
                        className="mt-0.5 shrink-0 transition-transform active:scale-95 cursor-pointer"
                        title={isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                      >
                        {isCompleted ? (
                          <div className="w-6 h-6 border-2 border-indigo-600 rounded-md flex items-center justify-center bg-indigo-600 text-white">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : isInProgress ? (
                          <div className="w-6 h-6 border-2 border-amber-500 rounded-md flex items-center justify-center bg-amber-50 text-amber-600 font-bold text-[10px]">
                            •
                          </div>
                        ) : (
                          <div className="w-6 h-6 border-2 border-slate-300 rounded-md hover:border-indigo-400 transition-colors" />
                        )}
                      </button>

                      <div className="space-y-0.5 min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p
                            className={`text-sm font-semibold truncate ${
                              isCompleted
                                ? 'line-through text-slate-900 opacity-40'
                                : isDeferred
                                ? 'text-slate-500 italic'
                                : 'text-slate-900'
                            }`}
                          >
                            {task.title}
                          </p>

                          {task.isRecurring && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700">
                              Habit
                            </span>
                          )}
                        </div>

                        {/* Sleek Subtitle micro-labels */}
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-400 uppercase font-medium">
                          <span>{task.category}</span>
                          <span>•</span>
                          <span
                            className={
                              task.priority === 'high'
                                ? 'text-rose-500 font-bold'
                                : task.priority === 'medium'
                                ? 'text-amber-600 font-semibold'
                                : 'text-emerald-600'
                            }
                          >
                            {task.priority} Priority
                          </span>
                          <span>•</span>
                          <span>
                            {task.actualMinutes > 0 ? (
                              <span className="text-slate-600 font-bold">
                                {task.actualMinutes}m / {task.estimatedMinutes}m
                              </span>
                            ) : (
                              <span>{task.estimatedMinutes}m est</span>
                            )}
                          </span>

                          {isCompleted && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 font-bold">Completed</span>
                            </>
                          )}
                        </div>

                        {task.notes && (
                          <p className="text-xs text-slate-500 pt-0.5 line-clamp-1">{task.notes}</p>
                        )}
                      </div>
                    </div>

                    {/* Right: Quick actions & status selector */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <select
                        value={task.status}
                        onChange={(e) => setTaskStatus(task.id, e.target.value as TaskStatus)}
                        className={`text-xs font-semibold px-2 py-1 rounded-lg border focus:outline-none ${
                          isCompleted
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : isInProgress
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : isDeferred
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : 'bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="todo">To Do</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="deferred">Deferred</option>
                      </select>

                      <button
                        id={`focus-task-${task.id}`}
                        onClick={() => onStartFocusOnTask(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Start Focus Timer on this task"
                      >
                        <Flame className="w-4 h-4" />
                      </button>

                      <button
                        id={`edit-task-${task.id}`}
                        onClick={() => onEditTask(task)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="Edit Task"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        id={`delete-task-${task.id}`}
                        onClick={() => deleteTask(task.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Task"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Daily Completion, Milestone Card & Reflection (4 cols) */}
        <div className="lg:col-span-4 space-y-5">
          {/* Daily Completion Circular Metric Card */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-800">Daily Completion</h3>
                <p className="text-xs text-slate-400 mt-0.5">{formatFriendlyDate(selectedDate)}</p>
              </div>
              <span className="text-emerald-500 text-xs font-bold bg-emerald-50 px-2 py-1 rounded-lg">
                {dayStats.completionRate}%
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center py-2">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-slate-100"
                    strokeWidth="3"
                  />
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    className="stroke-indigo-600 transition-all duration-500"
                    strokeWidth="3"
                    strokeDasharray={`${dayStats.completionRate}, 100`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-slate-900">
                    {dayStats.completed}/{dayStats.total}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-medium">
                    Tasks
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-3 border-t border-slate-100 text-xs">
              <div className="p-2 bg-emerald-50/60 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-emerald-800">Done</span>
                <p className="text-sm font-bold text-emerald-900 mt-0.5">{dayStats.completed}</p>
              </div>
              <div className="p-2 bg-amber-50/60 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-amber-800">Active</span>
                <p className="text-sm font-bold text-amber-900 mt-0.5">{dayStats.inProgress}</p>
              </div>
              <div className="p-2 bg-slate-100/70 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-700">Left</span>
                <p className="text-sm font-bold text-slate-800 mt-0.5">{dayStats.todo}</p>
              </div>
            </div>

            {/* Quick action buttons */}
            <div className="space-y-2 pt-3">
              <button
                id="rollover-yesterday-btn"
                onClick={handleRollover}
                className="w-full py-2 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-slate-200/60"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-indigo-600" />
                Rollover Pending from Yesterday
              </button>

              <button
                id="apply-day-routines-btn"
                onClick={handleApplyHabits}
                className="w-full py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                Populate Daily Routines
              </button>
            </div>
          </div>

          {/* Sleek Monthly Milestone Spotlight Card */}
          <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-200 text-white relative overflow-hidden">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <h3 className="font-bold text-lg mb-2 relative z-10">Monthly Milestone</h3>
            <p className="text-xs text-indigo-100 mb-4 opacity-90 leading-relaxed">
              You have completed {monthCompletedTasks} tasks this month. You're on track to beat your personal best!
            </p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold">Current: {monthCompletedTasks}</span>
              <span className="text-xs font-bold">Target: {monthTargetTasks}</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${monthProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Daily Reflection & Standup Check-in */}
          <form
            onSubmit={handleSaveDailyLog}
            className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Daily Reflection & Rating</h3>
              {logSavedFeedback && (
                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Saved
                </span>
              )}
            </div>

            {/* Productivity Score */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Productivity Rating
              </label>
              <div className="flex items-center justify-between gap-1">
                {[1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    type="button"
                    onClick={() => setProdScore(score)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      prodScore === score
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {score}★
                  </button>
                ))}
              </div>
            </div>

            {/* Mood selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Mental State / Mood
              </label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="energized">⚡ Energized & High Output</option>
                <option value="focused">🎯 Focused & In The Flow</option>
                <option value="steady">🌿 Steady & Consistent</option>
                <option value="tired">🥱 Fatigued / Low Energy</option>
                <option value="overwhelmed">🌪️ Overwhelmed / Interrupted</option>
              </select>
            </div>

            {/* Reflection Note */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                Key Accomplishment / Note
              </label>
              <textarea
                rows={2}
                placeholder="What went well today? Any blockers or wins?"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <button
              id="save-daily-log-btn"
              type="submit"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Save Daily Check-in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
