'use client';

/* eslint-disable @typescript-eslint/no-misused-promises, @typescript-eslint/no-unused-vars */
import { useCallback, useEffect, useState } from 'react';
import { z } from 'zod';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardStats } from './components/DashboardStats';
import { SafetyCheckList } from '@/components/safety/SafetyCheckList';
import { EmergencyContactList } from '@/components/safety/EmergencyContactList';
import { SafetyCheckModalAsync } from '@/components/safety/SafetyCheckModalAsync';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Layout } from '@/components/layout/Layout';
import { fetchApi } from '@/lib/fetch';
import type { SafetyCheckNew } from '@/types/safety';
import type { EmergencyContact } from '@/types/user';

// API response schemas
const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  lastActive: z.string(),
  memberSince: z.string(),
  streakStats: z.object({
    currentStreak: z.number(),
    lastStreakUpdate: z.string().nullable(),
    nextAchievementIn: z.number().nullable(),
    latestAchievement: z
      .object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        earnedAt: z.string(),
      })
      .nullable(),
  }),
  newAchievement: z
    .object({
      name: z.string(),
      description: z.string(),
    })
    .nullable(),
});

const dashboardStatsSchema = z.object({
  stats: z.object({
    totalSafetyChecks: z.number(),
    completedSafetyChecks: z.number(),
    pendingSafetyChecks: z.array(
      z.object({
        id: z.string(),
        userId: z.string(),
        type: z.enum(['meetup', 'location', 'custom']),
        status: z.enum(['pending', 'completed', 'missed']),
        scheduledFor: z.string(),
        completedAt: z.string().optional(),
        location: z
          .object({
            latitude: z.number(),
            longitude: z.number(),
            accuracy: z.number(),
            privacyZone: z.boolean(),
          })
          .optional(),
        description: z.string().optional(),
        createdAt: z.string(),
        updatedAt: z.string(),
        batteryLevel: z.number().optional(),
        bluetoothEnabled: z.boolean().optional(),
      })
    ),
    emergencyContacts: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        relationship: z.string(),
        phoneNumber: z.string(),
        email: z.string(),
        notifyOn: z.object({
          sosAlert: z.boolean(),
          meetupStart: z.boolean(),
          meetupEnd: z.boolean(),
          lowBattery: z.boolean(),
          enterPrivacyZone: z.boolean(),
          exitPrivacyZone: z.boolean(),
        }),
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
      })
    ),
    privacySettings: z.object({
      mode: z.enum(['standard', 'strict']),
      autoDisableDiscovery: z.boolean(),
      progressiveDisclosure: z.boolean(),
      privacyZonesEnabled: z.boolean(),
      batteryOptimization: z.boolean(),
    }),
    batteryStats: z.object({
      currentLevel: z.number(),
      averageDailyDrain: z.number(),
      discoveryModeActive: z.boolean(),
      bluetoothActive: z.boolean(),
    }),
  }),
});

type DashboardStats = z.infer<typeof dashboardStatsSchema>['stats'];

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [currentCheck, setCurrentCheck] = useState<SafetyCheckNew | null>(null);
  const [showSafetyCheck, setShowSafetyCheck] = useState(false);
  const [user, setUser] = useState<z.infer<typeof userSchema> | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const response = await fetchApi('/api/dashboard/stats');
      const parsedStats = dashboardStatsSchema.parse(response);
      setStats(parsedStats.stats);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setIsLoading(false);
    }
  }, []);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetchApi('/api/user/me');
      const parsedUser = userSchema.parse(response);
      setUser(parsedUser);
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
    void fetchUser();
  }, [fetchStats, fetchUser]);

  const handleCheckComplete = useCallback(
    async (checkId: string) => {
      try {
        await fetchApi(`/api/safety-checks/${checkId}/complete`, {
          method: 'POST',
        });
        void fetchStats();
      } catch (error) {
        console.error('Error completing safety check:', error);
      }
    },
    [fetchStats]
  );

  const handleModalClose = useCallback(() => {
    setShowSafetyCheck(false);
    setCurrentCheck(null);
  }, []);

  const handleSafetyCheckResolve = useCallback(
    async (checkId: string): Promise<void> => {
      await handleCheckComplete(checkId);
      setShowSafetyCheck(false);
      setCurrentCheck(null);
    },
    [handleCheckComplete]
  );

  const handleProfileClick = useCallback(() => {
    console.log('Navigate to profile');
  }, []);

  const handleSettingsClick = useCallback(() => {
    console.log('Navigate to settings');
  }, []);

  const handleEditContact = useCallback((contact: EmergencyContact) => {
    console.log('Edit contact:', contact);
  }, []);

  const handleDeleteContact = useCallback(
    async (contactId: string) => {
      try {
        await fetchApi(`/api/contacts/${contactId}`, {
          method: 'DELETE',
        });
        void fetchStats();
      } catch (error) {
        console.error('Error deleting contact:', error);
      }
    },
    [fetchStats]
  );

  const handlePrivacyModeChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      console.log('Change privacy mode:', event.target.value);
    },
    []
  );

  const handleAutoDisableChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log('Change auto-disable discovery:', event.target.checked);
    },
    []
  );

  const handleProgressiveDisclosureChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      console.log('Change progressive disclosure:', event.target.checked);
    },
    []
  );

  if (isLoading || !stats || !user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  // Create a user-like object from stats for DashboardStats
  const dashboardUser = {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    lastActive: user.lastActive,
    memberSince: user.memberSince,
    streakStats: user.streakStats,
    newAchievement: user.newAchievement,
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <DashboardHeader
          userName={user.firstName}
          userId={user.id}
          onProfileClick={handleProfileClick}
          onSettingsClick={handleSettingsClick}
          batteryStats={stats.batteryStats}
          privacyMode={stats.privacySettings.mode}
        />

        <DashboardStats stats={dashboardUser} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
          {/* Safety Features */}
          <div className="space-y-8">
            <SafetyCheckList
              checks={stats.pendingSafetyChecks}
              onComplete={handleCheckComplete}
            />
            <EmergencyContactList
              contacts={stats.emergencyContacts.map(contact => ({
                ...contact,
                sosAlert: contact.notifyOn.sosAlert,
                meetupStart: contact.notifyOn.meetupStart,
                meetupEnd: contact.notifyOn.meetupEnd,
                lowBattery: contact.notifyOn.lowBattery,
                enterPrivacyZone: contact.notifyOn.enterPrivacyZone,
                exitPrivacyZone: contact.notifyOn.exitPrivacyZone,
              }))}
              onEdit={handleEditContact}
              onDelete={handleDeleteContact}
            />
          </div>

          {/* Privacy and Battery Controls */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">Privacy Controls</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Privacy Mode</span>
                  <select
                    value={stats.privacySettings.mode}
                    className="rounded-md border-gray-300"
                    onChange={handlePrivacyModeChange}
                  >
                    <option value="standard">Standard</option>
                    <option value="strict">Enhanced Privacy</option>
                  </select>
                </div>
                <div className="flex justify-between items-center">
                  <span>Auto-disable Discovery</span>
                  <input
                    type="checkbox"
                    checked={stats.privacySettings.autoDisableDiscovery}
                    onChange={handleAutoDisableChange}
                    className="toggle"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span>Progressive Information Sharing</span>
                  <input
                    type="checkbox"
                    checked={stats.privacySettings.progressiveDisclosure}
                    onChange={handleProgressiveDisclosureChange}
                    className="toggle"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4">
                Battery Optimization
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Current Battery Level</span>
                  <span className="font-medium">
                    {stats.batteryStats.currentLevel}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Daily Usage</span>
                  <span className="font-medium">
                    {stats.batteryStats.averageDailyDrain}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Discovery Mode</span>
                  <span
                    className={`font-medium ${
                      stats.batteryStats.discoveryModeActive
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {stats.batteryStats.discoveryModeActive
                      ? 'Active'
                      : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Bluetooth Status</span>
                  <span
                    className={`font-medium ${
                      stats.batteryStats.bluetoothActive
                        ? 'text-green-600'
                        : 'text-gray-500'
                    }`}
                  >
                    {stats.batteryStats.bluetoothActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {currentCheck && (
        <SafetyCheckModalAsync
          check={currentCheck}
          isOpen={showSafetyCheck}
          onClose={handleModalClose}
          onResolveAsync={handleSafetyCheckResolve}
        />
      )}
    </Layout>
  );
}
