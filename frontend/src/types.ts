export interface StudySession {
  id: string;
  durationMinutes: number;
  date: string;
  theme: string;
}

export interface TaskItem {
  id: string;
  title: string;
  time: string; // e.g. "09 : 00 AM" or "10 : 00 AM"
  completed: boolean;
}

export interface WeeklyLog {
  day: string; // "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"
  percentage: number; // e.g., 40% completed
}

export type FocusTheme = 'Kurinji' | 'Mullai' | 'Marutham' | 'Neythal' | 'Palai';
export type StudyModeType = 'Pomodoro' | 'Focus' | 'Infinite';

export interface UserProfile {
  name: string;
  avatarLetter: string;
  group: string; // e.g., "TNPSC Group 1 - 2026"
  isVerified: boolean;
  phone?: string;
  email?: string;
}

export interface FocusRecordItem {
  id: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  period: "today" | "week";
}

