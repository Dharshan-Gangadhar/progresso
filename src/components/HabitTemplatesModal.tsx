import React, { useState } from 'react';
import { X, Plus, Repeat, Trash2, Check, Sparkles, Clock, Calendar } from 'lucide-react';
import { useTracker } from '../context/TrackerContext';
import { HabitTemplate, TaskPriority, TaskCategory } from '../types';
import { formatFriendlyDate } from '../utils/dateUtils';

interface HabitTemplatesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAYS_OF_WEEK = [
  { id: 0, label: 'Sun' },
  { id: 1, label: 'Mon' },
  { id: 2, label: 'Tue' },
  { id: 3, label: 'Wed' },
  { id: 4, label: 'Thu' },
  { id: 5, label: 'Fri' },
  { id: 6, label: 'Sat' },
];

export function HabitTemplatesModal({ isOpen, onClose }: HabitTemplatesModalProps) {
  const { habits, addHabit, updateHabit, deleteHabit, applyHabitTemplates, selectedDate, categories } = useTracker();

  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TaskCategory>('Work');
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newEstMinutes, setNewEstMinutes] = useState(25);
  const [newDays, setNewDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleToggleDay = (dayId: number) => {
    if (newDays.includes(dayId)) {
      setNewDays(newDays.filter((d) => d !== dayId));
    } else {
      setNewDays([...newDays, dayId]);
    }
  };

  const handleCreateHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addHabit({
      title: newTitle.trim(),
      category: newCategory,
      priority: newPriority,
      estimatedMinutes: Number(newEstMinutes) || 15,
      activeDays: newDays.length > 0 ? newDays : [1, 2, 3, 4, 5],
      enabled: true,
    });

    setNewTitle('');
    setIsCreating(false);
  };

  const handleApplyToSelectedDate = () => {
    const count = applyHabitTemplates(selectedDate);
    if (count > 0) {
      setFeedbackMsg(`Added ${count} recurring routine tasks to ${formatFriendlyDate(selectedDate)}!`);
    } else {
      setFeedbackMsg(`All matching routines are already added to ${formatFriendlyDate(selectedDate)}.`);
    }
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  return (
    <div
      id="habits-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="habits-modal-container"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Repeat className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Daily Habit & Routine Templates</h2>
              <p className="text-xs text-slate-500">Auto-recurring daily tasks you execute consistently</p>
            </div>
          </div>
          <button
            id="close-habits-modal-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {feedbackMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{feedbackMsg}</span>
            </div>
          )}

          {/* Quick Apply Action Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl">
            <div>
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                Apply to {formatFriendlyDate(selectedDate)}
              </h4>
              <p className="text-xs text-indigo-700 mt-0.5">
                Automatically generate all active habit templates for the selected day.
              </p>
            </div>
            <button
              id="apply-habits-to-date-btn"
              onClick={handleApplyToSelectedDate}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-xs font-bold rounded-lg shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Populate Day
            </button>
          </div>

          {/* Habits List */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Active Templates ({habits.length})
              </span>
              {!isCreating && (
                <button
                  id="toggle-create-habit-btn"
                  onClick={() => setIsCreating(true)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> New Routine
                </button>
              )}
            </div>

            {habits.map((habit) => (
              <div
                key={habit.id}
                className="flex items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/70 border border-slate-200/70 rounded-xl transition-all"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={habit.enabled}
                    onChange={(e) => updateHabit(habit.id, { enabled: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${habit.enabled ? 'text-slate-900' : 'text-slate-400 line-through'}`}>
                        {habit.title}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {habit.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {habit.estimatedMinutes}m
                      </span>
                      <span>•</span>
                      <div className="flex gap-1">
                        {DAYS_OF_WEEK.map((d) => (
                          <span
                            key={d.id}
                            className={`text-[10px] px-1 rounded ${
                              habit.activeDays.includes(d.id)
                                ? 'font-bold text-indigo-700 bg-indigo-100'
                                : 'text-slate-300'
                            }`}
                          >
                            {d.label[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  id={`delete-habit-${habit.id}`}
                  onClick={() => deleteHabit(habit.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-white transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Create Habit Form */}
          {isCreating && (
            <form onSubmit={handleCreateHabit} className="p-4 border border-indigo-200 bg-indigo-50/30 rounded-xl space-y-3">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">New Habit Template</h4>
              <input
                type="text"
                required
                placeholder="e.g. Daily LeetCode Problem, 10-minute Meditation..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Est. Minutes</label>
                  <input
                    type="number"
                    min="5"
                    step="5"
                    value={newEstMinutes}
                    onChange={(e) => setNewEstMinutes(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">Active Days</label>
                <div className="flex gap-1.5">
                  {DAYS_OF_WEEK.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleToggleDay(d.id)}
                      className={`flex-1 py-1 text-xs font-bold rounded-md transition-colors ${
                        newDays.includes(d.id)
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg shadow-xs hover:bg-indigo-700"
                >
                  Save Routine
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
