import { Task } from '../types';

export const TODAY_ISO = '2026-08-24';

export function getTodayDateString(): string {
  // Use today date or fallback to system date formatted
  const d = new Date();
  // If year is realistic relative to system or anchor, allow formatting
  return formatDateToISO(d);
}

export function formatDateToISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseISODate(isoString: string): Date {
  const [year, month, day] = isoString.split('-').map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

export function formatFriendlyDate(isoString: string): string {
  const target = parseISODate(isoString);
  const today = parseISODate(TODAY_ISO);
  
  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === -1) return 'Yesterday';
  if (diffDays === 1) return 'Tomorrow';

  return target.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatFullDate(isoString: string): string {
  const target = parseISODate(isoString);
  return target.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatMonthYear(year: number, monthIndex: number): string {
  const d = new Date(year, monthIndex, 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getRelativeDay(isoString: string, offsetDays: number): string {
  const d = parseISODate(isoString);
  d.setDate(d.getDate() + offsetDays);
  return formatDateToISO(d);
}

export function getWeekDays(centerDateIso: string): { date: string; dayName: string; dayNumber: number; isCenter: boolean; isToday: boolean }[] {
  const center = parseISODate(centerDateIso);
  const today = parseISODate(TODAY_ISO);
  const todayIso = formatDateToISO(today);

  // Generate 7 days around center: -3 to +3
  const result = [];
  for (let i = -3; i <= 3; i++) {
    const d = new Date(center);
    d.setDate(d.getDate() + i);
    const iso = formatDateToISO(d);
    result.push({
      date: iso,
      dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
      dayNumber: d.getDate(),
      isCenter: iso === centerDateIso,
      isToday: iso === todayIso,
    });
  }
  return result;
}

export function getMonthMatrix(year: number, monthIndex: number): (string | null)[][] {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);

  const startDayOfWeek = firstDay.getDay(); // 0 is Sunday
  const totalDays = lastDay.getDate();

  const weeks: (string | null)[][] = [];
  let currentWeek: (string | null)[] = [];

  // Pad beginning of first week
  for (let i = 0; i < startDayOfWeek; i++) {
    currentWeek.push(null);
  }

  for (let day = 1; day <= totalDays; day++) {
    const d = new Date(year, monthIndex, day);
    currentWeek.push(formatDateToISO(d));

    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  // Pad remainder of last week
  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push(null);
    }
    weeks.push(currentWeek);
  }

  return weeks;
}

export function calculateStreaks(tasks: Task[]): { currentStreak: number; bestStreak: number } {
  // Map tasks by date
  const tasksByDate = new Map<string, Task[]>();
  tasks.forEach((t) => {
    const list = tasksByDate.get(t.date) || [];
    list.push(t);
    tasksByDate.set(t.date, list);
  });

  // Calculate qualifying days: days with at least 1 completed task OR >= 50% completion
  const isQualifyingDay = (dateIso: string): boolean => {
    const dayTasks = tasksByDate.get(dateIso);
    if (!dayTasks || dayTasks.length === 0) return false;
    const completedCount = dayTasks.filter((t) => t.status === 'completed').length;
    return completedCount > 0 && (completedCount / dayTasks.length >= 0.4 || completedCount >= 2);
  };

  let bestStreak = 0;
  let tempStreak = 0;

  // Let's inspect the past 60 days in chronological order
  const checkDays: string[] = [];
  for (let i = 60; i >= 0; i--) {
    checkDays.push(getRelativeDay(TODAY_ISO, -i));
  }

  for (const dateIso of checkDays) {
    if (isQualifyingDay(dateIso)) {
      tempStreak += 1;
      if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
      }
    } else {
      tempStreak = 0;
    }
  }

  // Calculate current streak ending today or yesterday
  let currentStreak = 0;
  let cursor = TODAY_ISO;
  
  // If today has completed tasks, count today
  if (isQualifyingDay(cursor)) {
    while (isQualifyingDay(cursor)) {
      currentStreak += 1;
      cursor = getRelativeDay(cursor, -1);
    }
  } else {
    // If today is still underway, check if streak from yesterday is active
    cursor = getRelativeDay(TODAY_ISO, -1);
    while (isQualifyingDay(cursor)) {
      currentStreak += 1;
      cursor = getRelativeDay(cursor, -1);
    }
  }

  return {
    currentStreak,
    bestStreak: Math.max(bestStreak, currentStreak),
  };
}
