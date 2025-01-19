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
          })
          .optional(),
        description: z.string().optional(),
        createdAt: z.string(),
        updatedAt: z.string(),
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
        }),
        createdAt: z.string().optional(),
        updatedAt: z.string().optional(),
      })
    ),
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
        />

        <DashboardStats stats={dashboardUser} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
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
            }))}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
          />
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
