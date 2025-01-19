'use client';

import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import useAuth from '@/app/hooks/useAuth';
import { DashboardHeader } from './components/DashboardHeader';
import { DashboardStats } from './components/DashboardStats';
import { SafetyCheckList } from '@/components/safety/SafetyCheckList';
import { EmergencyContactList } from '@/components/safety/EmergencyContactList';
import { SafetyCheckModal } from '@/components/safety/SafetyCheckModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Layout } from '@/components/layout/Layout';
import { fetchApi } from '@/lib/fetch';
import type { SafetyCheckNew } from '@/types/safety';
import type { EmergencyContact } from '@/types/user';

const dashboardStatsSchema = z.object({
  stats: z.object({
    id: z.string(),
    email: z.string(),
    firstName: z.string(),
    lastName: z.string(),
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
    safetyChecks: z.array(
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
      z
        .object({
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
        .transform(contact => ({
          ...contact,
          sosAlert: contact.notifyOn.sosAlert,
          meetupStart: contact.notifyOn.meetupStart,
          meetupEnd: contact.notifyOn.meetupEnd,
        }))
    ),
  }),
});

type DashboardStats = z.infer<typeof dashboardStatsSchema>['stats'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSafetyCheck, setShowSafetyCheck] = useState(false);
  const [currentCheck, setCurrentCheck] = useState<SafetyCheckNew | null>(null);

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetchApi('/api/dashboard/stats');
      const parsed = dashboardStatsSchema.parse(response);
      setStats(parsed.stats);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load dashboard stats'
      );
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      void fetchStats();
    }
  }, [user, fetchStats]);

  const handleProfileClick = () => {
    // Navigate to profile
  };

  const handleSettingsClick = () => {
    // Navigate to settings
  };

  const handleCheckComplete = useCallback(
    async (checkId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await fetchApi(`/api/safety/checks/${checkId}/complete`, {
          method: 'POST',
        });
        void fetchStats(); // Refresh stats after completing check
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to complete safety check'
        );
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchStats]
  );

  const handleSafetyCheck = useCallback(
    async (checkId: string): Promise<void> => {
      await handleCheckComplete(checkId);
      setShowSafetyCheck(false);
      setCurrentCheck(null);
    },
    [handleCheckComplete]
  );

  const handleModalClose = useCallback((): void => {
    setShowSafetyCheck(false);
    setCurrentCheck(null);
  }, []);

  const handleResolve = useCallback(
    (checkId: string): void => {
      void handleSafetyCheck(checkId);
    },
    [handleSafetyCheck]
  );

  const handleEditContact = (contact: EmergencyContact) => {
    console.log('Editing contact:', contact);
  };

  const handleDeleteContact = useCallback(
    async (contactId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await fetchApi(`/api/contacts/${contactId}`, {
          method: 'DELETE',
        });
        void fetchStats();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to delete contact'
        );
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchStats]
  );

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error || !stats) {
    return (
      <div className="text-red-600">{error || 'Failed to load dashboard'}</div>
    );
  }

  return (
    <Layout>
      <DashboardHeader
        userName={user?.firstName || ''}
        userId={user?.id || ''}
        onProfileClick={handleProfileClick}
        onSettingsClick={handleSettingsClick}
      />

      <DashboardStats stats={stats} />

      <div className="mt-8">
        <SafetyCheckList
          checks={stats.safetyChecks}
          onComplete={handleCheckComplete}
        />
      </div>

      <div className="mt-8">
        <EmergencyContactList
          contacts={stats.emergencyContacts}
          onEdit={handleEditContact}
          onDelete={handleDeleteContact}
        />
      </div>

      {currentCheck && (
        <SafetyCheckModal
          check={currentCheck}
          isOpen={showSafetyCheck}
          onClose={handleModalClose}
          onResolve={async function (
            checkId: string,
            _status: 'safe' | 'unsafe'
          ) {
            await handleCheckComplete(checkId);
            setShowSafetyCheck(false);
            setCurrentCheck(null);
          }}
        />
      )}
    </Layout>
  );
}
