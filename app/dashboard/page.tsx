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

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const response = await fetchApi('/api/dashboard/stats');
      const parsed = dashboardStatsSchema.parse(response);
      setStats(parsed.stats);
    } catch (err) {
      setError('Failed to load dashboard stats');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileClick = () => {
    // Navigate to profile
  };

  const handleSettingsClick = () => {
    // Navigate to settings
  };

  const handleCheckComplete = async (checkId: string) => {
    try {
      await fetchApi(`/api/safety/checks/${checkId}/complete`, {
        method: 'POST',
      });
      await fetchStats(); // Refresh stats after completing check
    } catch (err) {
      setError('Failed to complete safety check');
      console.error(err);
    }
  };

  const handleEditContact = (contact: EmergencyContact) => {
    // Handle editing contact
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      await fetchApi(`/api/contacts/${contactId}`, {
        method: 'DELETE',
      });
      await fetchStats();
    } catch (err) {
      setError('Failed to delete contact');
      console.error(err);
    }
  };

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
          onClose={() => {
            setShowSafetyCheck(false);
            setCurrentCheck(null);
          }}
          onResolve={async (checkId, status, notes) => {
            await handleCheckComplete(checkId);
            setShowSafetyCheck(false);
            setCurrentCheck(null);
          }}
        />
      )}
    </Layout>
  );
}
