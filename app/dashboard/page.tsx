'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Logo } from '@/components/ui/Logo';
import { SafetyCheckModal } from '@/components/dashboard/SafetyCheckModal';
import { EmergencyContactsModal } from '@/components/dashboard/EmergencyContactsModal';
import { FindMatchesModal } from '@/components/dashboard/FindMatchesModal';
import {
  SafetyIcon,
  ContactsIcon,
  MatchesIcon,
  StreakIcon,
  CalendarIcon,
  ClockIcon,
} from '@/src/assets/icons';

interface DashboardStats {
  streakCount: number;
  lastLogin: string;
  safetyScore: number;
  pendingChecks: number;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSafetyModalOpen, setSafetyModalOpen] = useState(false);
  const [isContactsModalOpen, setContactsModalOpen] = useState(false);
  const [isMatchesModalOpen, setMatchesModalOpen] = useState(false);

  useEffect(() => {
    async function fetchDashboardStats() {
      try {
        const response = await fetch('/api/dashboard/stats');
        if (!response.ok) throw new Error('Failed to fetch dashboard stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    void fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex items-center space-x-4">
            <Logo className="w-12 h-12" />
            <div>
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                Welcome back, {user?.firstName}!
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Here's your safety and connection overview
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Streak Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <StreakIcon className="h-6 w-6 text-yellow-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Current Streak
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.streakCount || 0} days
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Safety Score Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <SafetyIcon className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Safety Score
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.safetyScore || 0}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Safety Checks */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CalendarIcon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending Check-ins
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.pendingChecks || 0}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Last Login */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClockIcon className="h-6 w-6 text-purple-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Last Login
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats?.lastLogin
                          ? new Date(stats.lastLogin).toLocaleDateString()
                          : 'First time!'}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Quick Actions
          </h3>
          <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <button
              type="button"
              onClick={() => setSafetyModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-sky-500 to-sky-700 hover:from-sky-600 hover:to-sky-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 transition-all duration-200 transform hover:scale-[1.02] focus:scale-[0.98]"
            >
              <CalendarIcon className="h-5 w-5 mr-2" />
              Schedule Safety Check
            </button>
            <button
              type="button"
              onClick={() => setContactsModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all duration-200 transform hover:scale-[1.02] focus:scale-[0.98]"
            >
              <ContactsIcon className="h-5 w-5 mr-2" />
              Update Emergency Contacts
            </button>
            <button
              type="button"
              onClick={() => setMatchesModalOpen(true)}
              className="inline-flex items-center justify-center px-4 py-3 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 transform hover:scale-[1.02] focus:scale-[0.98]"
            >
              <MatchesIcon className="h-5 w-5 mr-2" />
              Find New Matches
            </button>
          </div>
        </div>

        {/* Modals */}
        <SafetyCheckModal
          isOpen={isSafetyModalOpen}
          onClose={() => setSafetyModalOpen(false)}
        />
        <EmergencyContactsModal
          isOpen={isContactsModalOpen}
          onClose={() => setContactsModalOpen(false)}
        />
        <FindMatchesModal
          isOpen={isMatchesModalOpen}
          onClose={() => setMatchesModalOpen(false)}
        />
      </div>
    </Layout>
  );
}
