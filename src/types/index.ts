export type NavigationTab = 
  | 'daily-quests'
  | 'scholarship-roadmap'
  | 'budget-and-coins'
  | 'focus-session'
  | 'mood-tracker';

export type TaskCategory = string;

export interface TaskUserCategory {
  id: string;
  name: string;
  isDefault?: boolean;
}

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  completed: boolean;
  dueDate?: string;
  subject?: string;
  badgeLabel?: string;
  badgeVariant?: 'red' | 'gray' | 'green' | 'blue';
  detail?: string;
  currentStep?: number;
  totalSteps?: number;
  completedAt?: string;
  createdAt: string;
}

export interface BudgetCategory {
  id: string;
  name: string;
  spent: number;
  limit: number;
  icon: string;
}

export interface QuickPreset {
  id: string;
  name: string;
  amount: number;
  icon: string;
  categoryId: string;
}

export interface ExpenseRecord {
  id: string;
  title: string;
  categoryId: string;
  date: string;
  amount: number;
  isRefund?: boolean;
  icon: string;
}

export interface SavingsGoal {
  name: string;
  target: number;
  current: number;
  weeklyAutoSave: number;
  base: number;
  midpoint: number;
}

export interface ScholarshipRecord {
  id: string;
  activity: string;
  hours: number;
  date: string;
  notes?: string;
}

export type MoodType = 'super' | 'chilling' | 'tired' | 'stressed' | 'melting' | 'hungry';

export interface MoodEntry {
  id: string;
  mood: MoodType;
  emoji: string;
  label: string;
  quote: string;
  funFact: string;
  timestamp: string;
  weekKey?: string;
  isoDate?: string;
}
