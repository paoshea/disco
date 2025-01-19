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
  batteryStats?: {
    currentLevel: number;
    averageDailyDrain: number;
    discoveryModeActive: boolean;
    bluetoothActive: boolean;
  };
  privacyMode?: 'standard' | 'strict';
}

export function DashboardHeader({
  userName,
  userId,
  userAvatar,
  onProfileClick,
  onSettingsClick,
  batteryStats,
  privacyMode,
}: DashboardHeaderProps) {
  return (
    <header className="p-4 bg-white shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar userId={userId} imageUrl={userAvatar} size="lg" />
          <div>
            <h1 className="text-2xl font-bold">Welcome, {userName}!</h1>
            <p className="text-gray-600">Your Safety Dashboard</p>
          </div>
        </div>

        {/* Status Indicators */}
        {(batteryStats || privacyMode) && (
          <div className="flex items-center space-x-6 my-4 md:my-0">
            {batteryStats && (
              <div className="flex items-center space-x-4">
                {/* Battery Status */}
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium text-gray-600">Battery</div>
                  <div className={`text-sm font-bold ${
                    batteryStats.currentLevel > 20 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {batteryStats.currentLevel}%
                  </div>
                </div>

                {/* Discovery Mode Status */}
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium text-gray-600">Discovery</div>
                  <div className={`h-2 w-2 rounded-full ${
                    batteryStats.discoveryModeActive ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                </div>

                {/* Bluetooth Status */}
                <div className="flex items-center space-x-2">
                  <div className="text-sm font-medium text-gray-600">Bluetooth</div>
                  <div className={`h-2 w-2 rounded-full ${
                    batteryStats.bluetoothActive ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                </div>
              </div>
            )}

            {privacyMode && (
              <div className="flex items-center space-x-2">
                <div className="text-sm font-medium text-gray-600">Privacy</div>
                <div className={`text-sm font-bold ${
                  privacyMode === 'strict' ? 'text-purple-600' : 'text-blue-600'
                }`}>
                  {privacyMode === 'strict' ? 'Enhanced' : 'Standard'}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex space-x-2">
          <Button variant="secondary" onClick={onProfileClick}>
            Profile
          </Button>
          <Button variant="secondary" onClick={onSettingsClick}>
            Settings
          </Button>
        </div>
      </div>
    </header>
  );
}
