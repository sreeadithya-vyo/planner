export interface UserProfile {
  name: string;
  grade: string;
  subjects: string[];
  weakSubjects: string[];
  dailyHours: number;
  isSetup: boolean;
}

export interface StudyTask {
  id: string;
  subject: string;
  topic: string;
  type: 'study' | 'break' | 'revision';
  durationMinutes: number;
  completed: boolean;
  notes?: string;
}

export interface StudyPlan {
  date: string;
  tasks: StudyTask[];
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export enum AppView {
  ONBOARDING = 'ONBOARDING',
  PLANNER = 'PLANNER',
  CHAT = 'CHAT',
  PROGRESS = 'PROGRESS',
  SETTINGS = 'SETTINGS',
  EXAM = 'EXAM'
}