import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle, Flame, Clock } from 'lucide-react';
import { useTracker } from '../context/TrackerContext';
import { Task } from '../types';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTask?: Task | null;
}

export function PomodoroModal({ isOpen, onClose, initialTask }: PomodoroModalProps) {
  const { tasks, updateTask, selectedDate, triggerConfetti } = useTracker();

  const [selectedTaskId, setSelectedTaskId] = useState<string>(initialTask?.id || '');
  const [durationMinutes, setDurationMinutes] = useState<number>(25);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [mode, setMode] = useState<'focus' | 'break'>('focus');

  const todayTasks = tasks.filter((t) => t.date === selectedDate);
  const activeTask = tasks.find((t) => t.id === selectedTaskId) || todayTasks[0];

  useEffect(() => {
    if (initialTask) {
      setSelectedTaskId(initialTask.id);
    } else if (todayTasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(todayTasks[0].id);
    }
  }, [initialTask, todayTasks]);

  useEffect(() => {
    let timer: any;
    if (isRunning && timeLeftSeconds > 0) {
      timer = setInterval(() => {
        setTimeLeftSeconds((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeftSeconds === 0) {
      setIsRunning(false);
      triggerConfetti();

      // If finished focus mode, increment actual minutes on active task
      if (mode === 'focus' && activeTask) {
        const addedMinutes = durationMinutes;
        updateTask(activeTask.id, {
          actualMinutes: (activeTask.actualMinutes || 0) + addedMinutes,
          status: activeTask.status === 'todo' ? 'in-progress' : activeTask.status,
        });
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeftSeconds, mode, activeTask, durationMinutes, updateTask, triggerConfetti]);

  if (!isOpen) return null;

  const handleSetDuration = (mins: number, timerMode: 'focus' | 'break') => {
    setIsRunning(false);
    setMode(timerMode);
    setDurationMinutes(mins);
    setTimeLeftSeconds(mins * 60);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeftSeconds(durationMinutes * 60);
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercent = Math.round(((durationMinutes * 60 - timeLeftSeconds) / (durationMinutes * 60)) * 100);

  return (
    <div
      id="pomodoro-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-xs p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="pomodoro-modal-container"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Focus Mode Timer</h3>
          </div>
          <button
            id="close-pomodoro-btn"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Target Task Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5 text-left">
              Focused Task
            </label>
            <select
              id="pomodoro-task-select"
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium focus:outline-none focus:border-indigo-500"
            >
              {todayTasks.length === 0 && <option value="">No tasks for this day</option>}
              {todayTasks.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title} ({t.status})
                </option>
              ))}
            </select>
          </div>

          {/* Mode presets */}
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handleSetDuration(25, 'focus')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'focus' && durationMinutes === 25
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              25m Focus
            </button>
            <button
              onClick={() => handleSetDuration(50, 'focus')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'focus' && durationMinutes === 50
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              50m Deep Work
            </button>
            <button
              onClick={() => handleSetDuration(5, 'break')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                mode === 'break' && durationMinutes === 5
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              5m Break
            </button>
          </div>

          {/* Timer Display */}
          <div className="relative py-4 flex flex-col items-center justify-center">
            <div className="font-mono text-5xl font-extrabold tracking-tight text-slate-900">
              {formatTime(timeLeftSeconds)}
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-2">
              {mode === 'focus' ? '🎯 High Focus Sprint' : '☕ Rest & Refresh'}
            </span>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full mt-5 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  mode === 'focus' ? 'bg-indigo-600' : 'bg-emerald-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-3">
            <button
              id="reset-timer-btn"
              onClick={handleReset}
              className="p-3 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              title="Reset Timer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            <button
              id="toggle-timer-btn"
              onClick={() => setIsRunning(!isRunning)}
              className={`px-8 py-3 rounded-xl text-white font-bold text-sm shadow-md transition-all flex items-center gap-2 ${
                isRunning
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="w-4 h-4 fill-white" /> Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" /> Start Session
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
