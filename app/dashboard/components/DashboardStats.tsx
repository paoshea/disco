'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';

export interface DashboardStatsProps {
  stats: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    lastActive: string;
    memberSince: string;
    streakStats: {
      currentStreak: number;
      lastStreakUpdate: string | null;
      nextAchievementIn: number | null;
      latestAchievement: {
        id: string;
        name: string;
        description: string;
        earnedAt: string;
      } | null;
    };
    newAchievement: {
      name: string;
      description: string;
    } | null;
  };
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold">Current Streak</h3>
        <p className="text-3xl font-bold text-green-600">
          {stats.streakStats.currentStreak} days
        </p>
      </Card>
      <Card className="p-4">
        <h3 className="text-lg font-semibold">Member Since</h3>
        <p className="text-3xl font-bold text-blue-600">
          {new Date(stats.memberSince).toLocaleDateString()}
        </p>
      </Card>
      <Card className="p-4">
        <h3 className="text-lg font-semibold">Next Achievement</h3>
        <p className="text-3xl font-bold text-purple-600">
          {stats.streakStats.nextAchievementIn
            ? `${stats.streakStats.nextAchievementIn} days`
            : 'N/A'}
        </p>
      </Card>
      <Card className="p-4">
        <h3 className="text-lg font-semibold">Last Active</h3>
        <p className="text-3xl font-bold text-gray-600">
          {new Date(stats.lastActive).toLocaleDateString()}
        </p>
      </Card>
    </div>
  );
}
