'use client';

import React from 'react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';

export interface DashboardHeaderProps {
  userName: string;
  userId: string;
  userAvatar?: string;
  onProfileClick: () => void;
  onSettingsClick: () => void;
}

export function DashboardHeader({
  userName,
  userId,
  userAvatar,
  onProfileClick,
  onSettingsClick,
}: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between p-4 bg-white shadow-sm">
      <div className="flex items-center space-x-4">
        <Avatar userId={userId} imageUrl={userAvatar} size="lg" />
        <div>
          <h1 className="text-2xl font-bold">Welcome, {userName}!</h1>
          <p className="text-gray-600">Your Safety Dashboard</p>
        </div>
      </div>
      <div className="flex space-x-2">
        <Button variant="secondary" onClick={onProfileClick}>
          Profile
        </Button>
        <Button variant="secondary" onClick={onSettingsClick}>
          Settings
        </Button>
      </div>
    </header>
  );
}
