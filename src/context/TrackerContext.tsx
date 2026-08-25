import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { Task, DailyLog, HabitTemplate, ViewTab, DayStats, TaskStatus, AuthUser } from '../types';
import { generateSeedData, DEFAULT_HABITS } from '../data/seedData';
import { TODAY_ISO, parseISODate, formatDateToISO } from '../utils/dateUtils';

interface TrackerContextType {
  tasks: Task[];
  dailyLogs: DailyLog[];
  habits: HabitTemplate[];
  selectedDate: string;
  activeTab: ViewTab;
  categories: string[];
  user: AuthUser;
  login: (name: string, password?: string) => void;
  logout: () => void;
  setSelectedDate: (date: string) => void;
  setActiveTab: (tab: ViewTab) => void;
  addTask: (taskData: Omit<Task, 'id' | 'createdAt'>) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  setTaskStatus: (id: string, status: TaskStatus) => void;
  rolloverUnfinishedTasks: (fromDate: string, toDate: string) => number;
  applyHabitTemplates: (targetDate: string) => number;
  saveDailyLog: (log: DailyLog) => void;
  addCategory: (category: string) => void;
  addHabit: (habit: Omit<HabitTemplate, 'id'>) => void;
  updateHabit: (id: string, updates: Partial<HabitTemplate>) => void;
  deleteHabit: (id: string) => void;
  resetToDefaultData: () => void;
  clearAllData: () => void;
  importData: (jsonString: string) => boolean;
  exportData: () => string;
  getDayStats: (date: string) => DayStats;
  triggerConfetti: () => void;
}

const STORAGE_KEYS = {
  TASKS: 'task_tracker_tasks_v2',
  LOGS: 'task_tracker_logs_v2',
  HABITS: 'task_tracker_habits_v2',
  CATEGORIES: 'task_tracker_categories_v2',
  USER: 'task_tracker_user_v2',
};

const DEFAULT_CATEGORIES = [
  'Work',
  'Personal',
  'Projects',
  'Health & Fitness',
  'Learning',
  'Finance',
  'Errands',
];

const TrackerContext = createContext<TrackerContextType | undefined>(undefined);

export function TrackerProvider({ children }: { children: ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<string>(TODAY_ISO);
  const [activeTab, setActiveTab] = useState<ViewTab>('daily');

  // Load Initial State (Defaulting to clean state without demo data)
  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TASKS);
      if (stored !== null) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored tasks', e);
    }
    return [];
  });

  const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.LOGS);
      if (stored !== null) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse stored logs', e);
    }
    return [];
  });

  const [habits, setHabits] = useState<HabitTemplate[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.HABITS);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse habits', e);
    }
    return DEFAULT_HABITS;
  });

  const [categories, setCategories] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse categories', e);
    }
    return DEFAULT_CATEGORIES;
  });

  const [user, setUser] = useState<AuthUser>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.USER);
      if (stored) return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to parse user', e);
    }
    return {
      name: 'Alex',
      isLoggedIn: false,
      avatarInitial: 'A',
    };
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(dailyLogs));
  }, [dailyLogs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HABITS, JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }, [user]);

  const login = (name: string, _password?: string) => {
    const trimmed = name.trim();
    const initial = trimmed ? trimmed.charAt(0).toUpperCase() : 'U';
    const updatedUser: AuthUser = {
      name: trimmed || 'User',
      isLoggedIn: true,
      avatarInitial: initial,
      loginTime: new Date().toISOString(),
    };
    setUser(updatedUser);
  };

  const logout = () => {
    const resetUser: AuthUser = {
      name: 'Guest',
      isLoggedIn: false,
      avatarInitial: 'G',
    };
    setUser(resetUser);
  };

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.65 },
        colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'],
      });
    } catch {
      // safe fallback
    }
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt'>): Task => {
    const newTask: Task = {
      ...taskData,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      completedAt: taskData.status === 'completed' ? new Date().toISOString() : undefined,
    };
    setTasks((prev) => [newTask, ...prev]);

    // Check if category is new
    if (newTask.category && !categories.includes(newTask.category)) {
      setCategories((prev) => [...prev, newTask.category]);
    }

    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          if (updates.status === 'completed' && t.status !== 'completed' && !updated.completedAt) {
            updated.completedAt = new Date().toISOString();
          } else if (updates.status && updates.status !== 'completed') {
            updated.completedAt = undefined;
          }
          return updated;
        }
        return t;
      })
    );
  };

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) => {
      let isNewlyCompleted = false;
      const updated = prev.map((t) => {
        if (t.id === id) {
          const nextStatus: TaskStatus = t.status === 'completed' ? 'todo' : 'completed';
          if (nextStatus === 'completed') isNewlyCompleted = true;
          return {
            ...t,
            status: nextStatus,
            completedAt: nextStatus === 'completed' ? new Date().toISOString() : undefined,
            actualMinutes: nextStatus === 'completed' && t.actualMinutes === 0 ? t.estimatedMinutes : t.actualMinutes,
          };
        }
        return t;
      });

      if (isNewlyCompleted) {
        // Check if all today's tasks are now completed
        const currentDayTasks = updated.filter((t) => t.date === selectedDate);
        if (currentDayTasks.length > 0 && currentDayTasks.every((t) => t.status === 'completed')) {
          triggerConfetti();
        }
      }

      return updated;
    });
  };

  const setTaskStatus = (id: string, status: TaskStatus) => {
    updateTask(id, { status });
  };

  const rolloverUnfinishedTasks = (fromDate: string, toDate: string): number => {
    const unfinished = tasks.filter((t) => t.date === fromDate && (t.status === 'todo' || t.status === 'in-progress'));
    if (unfinished.length === 0) return 0;

    setTasks((prev) => {
      // Mark old ones as deferred and clone new to toDate
      const markedOld = prev.map((t) => {
        if (t.date === fromDate && (t.status === 'todo' || t.status === 'in-progress')) {
          return { ...t, status: 'deferred' as TaskStatus };
        }
        return t;
      });

      const newClonedTasks: Task[] = unfinished.map((t) => ({
        ...t,
        id: `task_roll_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        date: toDate,
        status: 'todo',
        actualMinutes: 0,
        createdAt: new Date().toISOString(),
        completedAt: undefined,
        notes: t.notes ? `${t.notes} (Rolled over from ${fromDate})` : `Rolled over from ${fromDate}`,
      }));

      return [...newClonedTasks, ...markedOld];
    });

    return unfinished.length;
  };

  const applyHabitTemplates = (targetDate: string): number => {
    const targetDateObj = parseISODate(targetDate);
    const dayOfWeek = targetDateObj.getDay();

    const matchingHabits = habits.filter((h) => h.enabled && h.activeDays.includes(dayOfWeek));
    const existingDayTitles = new Set(tasks.filter((t) => t.date === targetDate).map((t) => t.title.toLowerCase().trim()));

    const toCreate = matchingHabits.filter((h) => !existingDayTitles.has(h.title.toLowerCase().trim()));

    if (toCreate.length === 0) return 0;

    const newTasks: Task[] = toCreate.map((h) => ({
      id: `task_habit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      title: h.title,
      date: targetDate,
      status: 'todo',
      priority: h.priority,
      category: h.category,
      estimatedMinutes: h.estimatedMinutes,
      actualMinutes: 0,
      isRecurring: true,
      createdAt: new Date().toISOString(),
    }));

    setTasks((prev) => [...newTasks, ...prev]);
    return newTasks.length;
  };

  const saveDailyLog = (log: DailyLog) => {
    setDailyLogs((prev) => {
      const idx = prev.findIndex((l) => l.date === log.date);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = log;
        return next;
      }
      return [log, ...prev];
    });
  };

  const addCategory = (category: string) => {
    const trimmed = category.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories((prev) => [...prev, trimmed]);
    }
  };

  const addHabit = (habitData: Omit<HabitTemplate, 'id'>) => {
    const newHabit: HabitTemplate = {
      ...habitData,
      id: `habit_${Date.now()}`,
    };
    setHabits((prev) => [...prev, newHabit]);
  };

  const updateHabit = (id: string, updates: Partial<HabitTemplate>) => {
    setHabits((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  };

  const deleteHabit = (id: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== id));
  };

  const resetToDefaultData = () => {
    const seed = generateSeedData();
    setTasks(seed.tasks);
    setDailyLogs(seed.dailyLogs);
    setHabits(seed.habits);
    setCategories(DEFAULT_CATEGORIES);
    setSelectedDate(TODAY_ISO);
  };

  const clearAllData = () => {
    setTasks([]);
    setDailyLogs([]);
    setHabits(DEFAULT_HABITS);
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify([]));
  };

  const exportData = (): string => {
    return JSON.stringify(
      {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        tasks,
        dailyLogs,
        habits,
        categories,
      },
      null,
      2
    );
  };

  const importData = (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.tasks)) {
        setTasks(parsed.tasks);
        if (Array.isArray(parsed.dailyLogs)) setDailyLogs(parsed.dailyLogs);
        if (Array.isArray(parsed.habits)) setHabits(parsed.habits);
        if (Array.isArray(parsed.categories)) setCategories(parsed.categories);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import error', e);
      return false;
    }
  };

  const getDayStats = (dateStr: string): DayStats => {
    const dayTasks = tasks.filter((t) => t.date === dateStr);
    const total = dayTasks.length;
    const completed = dayTasks.filter((t) => t.status === 'completed').length;
    const inProgress = dayTasks.filter((t) => t.status === 'in-progress').length;
    const todo = dayTasks.filter((t) => t.status === 'todo').length;
    const deferred = dayTasks.filter((t) => t.status === 'deferred').length;

    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const estimatedMinutes = dayTasks.reduce((acc, t) => acc + (t.estimatedMinutes || 0), 0);
    const actualMinutes = dayTasks.reduce((acc, t) => acc + (t.actualMinutes || 0), 0);

    return {
      date: dateStr,
      total,
      completed,
      inProgress,
      todo,
      deferred,
      completionRate,
      estimatedMinutes,
      actualMinutes,
    };
  };

  return (
    <TrackerContext.Provider
      value={{
        tasks,
        dailyLogs,
        habits,
        selectedDate,
        activeTab,
        categories,
        user,
        login,
        logout,
        setSelectedDate,
        setActiveTab,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        setTaskStatus,
        rolloverUnfinishedTasks,
        applyHabitTemplates,
        saveDailyLog,
        addCategory,
        addHabit,
        updateHabit,
        deleteHabit,
        resetToDefaultData,
        clearAllData,
        importData,
        exportData,
        getDayStats,
        triggerConfetti,
      }}
    >
      {children}
    </TrackerContext.Provider>
  );
}

export function useTracker(): TrackerContextType {
  const context = useContext(TrackerContext);
  if (!context) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return context;
}
