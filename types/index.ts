import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  name: string;
  email: string;
  password?: string;
  createdAt: Date;
}

export interface Task {
  _id?: ObjectId | string;
  userId: string | ObjectId;
  title: string;
  description: string;
  time: string; // HH:mm format
  progress: number; // 0-100
  type: 'one-time' | 'repeating' | 'annual';
  
  // Specific configurations
  date?: Date; // For one-time tasks
  daysOfWeek?: number[]; // For repeating tasks (0-6)
  annualDate?: { month: number; day: number }; // For annual tasks (0-based month)
  
  // Progress/Completion tracking
  completedDate?: string;   // YYYY-MM-DD string — the date this task was completed
  completedDates?: string[]; // Array of YYYY-MM-DD strings for repetitive tasks
  lastRolloverDate?: string; // The last date this task was auto-forwarded to (YYYY-MM-DD)
  
  createdAt: Date;
  updatedAt: Date;
}

export interface Holiday {
  date: string;
  name: string;
}
