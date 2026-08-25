import { Task, DailyLog, HabitTemplate } from '../types';
import { getRelativeDay, TODAY_ISO } from '../utils/dateUtils';

export const DEFAULT_HABITS: HabitTemplate[] = [
  {
    id: 'habit-1',
    title: 'Morning 20m Mobility & Workout',
    category: 'Health & Fitness',
    priority: 'high',
    estimatedMinutes: 25,
    activeDays: [1, 2, 3, 4, 5, 6], // Mon - Sat
    enabled: true,
  },
  {
    id: 'habit-2',
    title: 'Daily Standup & Priority Alignment',
    category: 'Work',
    priority: 'high',
    estimatedMinutes: 15,
    activeDays: [1, 2, 3, 4, 5], // Mon - Fri
    enabled: true,
  },
  {
    id: 'habit-3',
    title: 'Deep Work Block (Focus Mode)',
    category: 'Projects',
    priority: 'high',
    estimatedMinutes: 90,
    activeDays: [1, 2, 3, 4, 5],
    enabled: true,
  },
  {
    id: 'habit-4',
    title: 'Technical Reading / Skill Practice',
    category: 'Learning',
    priority: 'medium',
    estimatedMinutes: 30,
    activeDays: [0, 1, 2, 3, 4, 5, 6], // Every day
    enabled: true,
  },
  {
    id: 'habit-5',
    title: 'Evening Progress Review & Shutdown',
    category: 'Personal',
    priority: 'medium',
    estimatedMinutes: 15,
    activeDays: [0, 1, 2, 3, 4, 5, 6],
    enabled: true,
  },
];

export function generateSeedData(): { tasks: Task[]; dailyLogs: DailyLog[]; habits: HabitTemplate[] } {
  const tasks: Task[] = [];
  const dailyLogs: DailyLog[] = [];

  const taskPool = [
    { title: 'Review pull requests & merge architecture RFC', cat: 'Work', p: 'high', mins: 45 },
    { title: 'Update project timeline & sprint backlog', cat: 'Work', p: 'medium', mins: 30 },
    { title: 'Debug memory leak in real-time stream', cat: 'Projects', p: 'high', mins: 60 },
    { title: 'Prepare monthly budget spreadsheet', cat: 'Finance', p: 'medium', mins: 35 },
    { title: '5km jog & stretch routine', cat: 'Health & Fitness', p: 'high', mins: 40 },
    { title: 'Read System Design chapter 4', cat: 'Learning', p: 'medium', mins: 30 },
    { title: 'Sync with product design on UI tokens', cat: 'Work', p: 'medium', mins: 30 },
    { title: 'Clean up desk and archive old paper receipts', cat: 'Personal', p: 'low', mins: 20 },
    { title: 'Optimize SQL indexing for analytics query', cat: 'Projects', p: 'high', mins: 50 },
    { title: 'Meal prep high-protein lunches for the week', cat: 'Health & Fitness', p: 'medium', mins: 60 },
    { title: 'Pay quarterly utilities & credit card balance', cat: 'Finance', p: 'high', mins: 15 },
    { title: 'Complete TypeScript generics exercises', cat: 'Learning', p: 'medium', mins: 45 },
    { title: 'Refactor authentication error handler', cat: 'Projects', p: 'high', mins: 40 },
    { title: 'Call insurance provider regarding policy renewal', cat: 'Errands', p: 'low', mins: 25 },
    { title: 'Schedule dental checkup appointment', cat: 'Health & Fitness', p: 'low', mins: 10 },
  ];

  let idCounter = 1;

  // Generate for past 28 days
  for (let offset = 28; offset >= 1; offset--) {
    const dateStr = getRelativeDay(TODAY_ISO, -offset);
    const d = new Date(dateStr + 'T00:00:00');
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Number of tasks for the day
    const taskCount = isWeekend ? 3 + Math.floor(Math.random() * 2) : 5 + Math.floor(Math.random() * 3);
    const dayPool = [...taskPool].sort(() => 0.5 - Math.random()).slice(0, taskCount);

    let completedDayCount = 0;

    dayPool.forEach((item, index) => {
      // 80% chance of completion in past days
      const isCompleted = Math.random() < (isWeekend ? 0.85 : 0.78);
      const isDeferred = !isCompleted && Math.random() < 0.35;
      const status = isCompleted ? 'completed' : isDeferred ? 'deferred' : 'todo';

      if (isCompleted) completedDayCount++;

      const est = item.mins;
      const act = isCompleted ? Math.round(est * (0.8 + Math.random() * 0.4)) : 0;

      tasks.push({
        id: `task-seed-${idCounter++}`,
        title: item.title,
        date: dateStr,
        status: status as any,
        priority: item.p as any,
        category: item.cat,
        estimatedMinutes: est,
        actualMinutes: act,
        createdAt: `${dateStr}T08:30:00Z`,
        completedAt: isCompleted ? `${dateStr}T17:${10 + index * 5}:00Z` : undefined,
        notes: isCompleted ? 'Executed without blockers.' : isDeferred ? 'Moved due to urgent priority shift.' : undefined,
      });
    });

    // Add daily log
    const completionRate = completedDayCount / taskCount;
    const score = completionRate >= 0.8 ? 5 : completionRate >= 0.6 ? 4 : completionRate >= 0.4 ? 3 : 2;
    const moods = ['energized', 'focused', 'steady', 'tired', 'overwhelmed'] as const;
    const moodIndex = score >= 4 ? Math.floor(Math.random() * 2) : score === 3 ? 2 : 3;

    dailyLogs.push({
      date: dateStr,
      productivityScore: score,
      mood: moods[moodIndex],
      reflectionNote:
        score >= 4
          ? 'Strong focus on deep work blocks and delivered critical milestones.'
          : 'Decent momentum, though got slightly interrupted by context switching.',
      mainHighlight: dayPool[0].title,
    });
  }

  // Generate Today's tasks (2026-08-24)
  const todayTasks = [
    {
      title: 'Review weekly sprint goals & team roadmap',
      cat: 'Work',
      p: 'high',
      mins: 30,
      status: 'completed',
      act: 25,
      notes: 'Roadmap approved by tech lead.',
    },
    {
      title: 'Implement daily & monthly progress tracker features',
      cat: 'Projects',
      p: 'high',
      mins: 75,
      status: 'in-progress',
      act: 40,
      notes: 'Building visualizations, calendar matrix, and report export.',
    },
    {
      title: 'Morning 20m high-intensity interval training',
      cat: 'Health & Fitness',
      p: 'high',
      mins: 25,
      status: 'completed',
      act: 25,
      notes: 'Completed heart rate target.',
    },
    {
      title: 'Review D3 and Recharts documentation for trend curves',
      cat: 'Learning',
      p: 'medium',
      mins: 40,
      status: 'completed',
      act: 35,
      notes: 'Explored area gradient charts.',
    },
    {
      title: 'Check investment portfolio & rebalance ETF allocations',
      cat: 'Finance',
      p: 'medium',
      mins: 20,
      status: 'todo',
      act: 0,
    },
    {
      title: 'Grocery replenishment & weekly meal ingredients',
      cat: 'Personal',
      p: 'low',
      mins: 45,
      status: 'todo',
      act: 0,
    },
  ];

  todayTasks.forEach((item) => {
    tasks.push({
      id: `task-seed-${idCounter++}`,
      title: item.title,
      date: TODAY_ISO,
      status: item.status as any,
      priority: item.p as any,
      category: item.cat,
      estimatedMinutes: item.mins,
      actualMinutes: item.act,
      createdAt: `${TODAY_ISO}T08:00:00Z`,
      completedAt: item.status === 'completed' ? `${TODAY_ISO}T10:15:00Z` : undefined,
      notes: item.notes,
    });
  });

  // Today's daily log draft
  dailyLogs.push({
    date: TODAY_ISO,
    productivityScore: 4,
    mood: 'focused',
    reflectionNote: 'Great morning start with high energy. Continuing on track with key development deliverables.',
    mainHighlight: 'Implement daily & monthly progress tracker features',
  });

  return {
    tasks,
    dailyLogs,
    habits: DEFAULT_HABITS,
  };
}
