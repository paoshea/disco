'use client';

import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import { useAuth } from '@/app/hooks/useAuth';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { SafetyCheckList } from '@/components/dashboard/SafetyCheckList';
import { EmergencyContactsModal } from '@/components/dashboard/EmergencyContactsModal';
import { SafetyCheckModal } from '@/components/dashboard/SafetyCheckModal';
import { FindMatchesModal } from '@/components/dashboard/FindMatchesModal';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Layout } from '@/components/layout/Layout';
import { api } from '@/lib/api';

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
  }),
});

type DashboardStats = z.infer<typeof dashboardStatsSchema>['stats'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showContactsModal, setShowContactsModal] = useState(false);
  const [showSafetyModal, setSafetyModalOpen] = useState(false);
  const [isMatchesModalOpen, setMatchesModalOpen] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      const data = await api.get<unknown>('/api/dashboard/stats');
      const result = dashboardStatsSchema.safeParse(data);

      if (result.success) {
        setStats(result.data.stats);
      } else {
        console.error('Invalid dashboard stats:', result.error);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  return (
    <Layout>
      <div className="min-h-screen bg-gray-100">
        <DashboardHeader />

        <main className="py-10">
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName}!
            </h1>

            {stats && <DashboardStats stats={stats} />}

            {isLoading && (
              <div className="mt-8 flex justify-center">
                <LoadingSpinner />
              </div>
            )}

            <div className="mt-8">
              <SafetyCheckList />
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <button
                  type="button"
                  onClick={() => setSafetyModalOpen(true)}
                  className="inline-flex items-center justify-center px-4 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-sky-500 to-sky-700 hover:from-sky-600 hover:to-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 transform hover:scale-[1.02] focus:scale-[0.98]"
                >
                  Schedule Safety Check
                </button>
                <button
                  type="button"
                  onClick={() => setShowContactsModal(true)}
                  className="inline-flex items-center justify-center px-4 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-[1.02] focus:scale-[0.98]"
                >
                  Update Emergency Contacts
                </button>
                <button
                  type="button"
                  onClick={() => setMatchesModalOpen(true)}
                  className="inline-flex items-center justify-center px-4 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-[1.02] focus:scale-[0.98]"
                >
                  Find New Matches
                </button>
              </div>
            </div>

            {/* Modals */}
            <EmergencyContactsModal
              isOpen={showContactsModal}
              onClose={() => setShowContactsModal(false)}
            />
            <SafetyCheckModal
              isOpen={showSafetyModal}
              onClose={() => setSafetyModalOpen(false)}
            />
            <FindMatchesModal
              isOpen={isMatchesModalOpen}
              onClose={() => setMatchesModalOpen(false)}
            />
          </div>
        </main>
      </div>
    </Layout>
  );
}
