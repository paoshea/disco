import type { BaseUser } from './user';

export interface UserWithStats extends BaseUser {
  lastLogin: Date | null;
  streakCount: number;
  lastStreak: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Achievement {
  id: string;
  type: 'STREAK' | 'EVENTS' | 'SOCIAL';
  level: number;
  progress: number;
  completedAt: Date | null;
}
