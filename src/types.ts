export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskStatus = 'todo' | 'in-progress' | 'completed' | 'deferred';

export type TaskCategory =
  | 'Work'
  | 'Personal'
  | 'Learning'
  | 'Health & Fitness'
  | 'Finance'
  | 'Projects'
  | 'Errands'
  | string;

export interface Task {
  id: string;
  title: string;
  notes?: string;
  date: string; // YYYY-MM-DD
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  estimatedMinutes: number;
  actualMinutes: number;
  createdAt: string;
  completedAt?: string;
  isRecurring?: boolean;
  tags?: string[];
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  productivityScore: number; // 1 - 5
  mood: 'energized' | 'focused' | 'steady' | 'tired' | 'overwhelmed';
  reflectionNote?: string;
  mainHighlight?: string;
}

export interface HabitTemplate {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  estimatedMinutes: number;
  activeDays: number[]; // 0 for Sunday, 1 for Monday... 6 for Saturday
  enabled: boolean;
}

export type ViewTab = 'daily' | 'dashboard' | 'monthly' | 'daily-report';

export interface TaskFilterOptions {
  status: TaskStatus | 'all';
  priority: TaskPriority | 'all';
  category: string | 'all';
  searchQuery: string;
}

export interface DayStats {
  date: string;
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  deferred: number;
  completionRate: number; // 0 - 100
  estimatedMinutes: number;
  actualMinutes: number;
}

export interface AuthUser {
  name: string;
  isLoggedIn: boolean;
  avatarInitial?: string;
  loginTime?: string;
}
