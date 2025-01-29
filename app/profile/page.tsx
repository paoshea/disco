'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { ProfileEdit } from '@/components/profile/ProfileEdit';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Tab, TabGroup, TabList, TabPanels, TabPanel } from '@headlessui/react';
import { userService } from '@/services/api/user.service';
import type { User } from '@/types/user';
import type { UpdateProfileData } from '@/hooks//useAuth';
import dynamic from 'next/dynamic';

const RoleUpgrade = dynamic(
  () =>
    import('@/components/profile/RoleUpgrade').then(mod => ({
      default: mod.RoleUpgrade,
    })),
  { ssr: false }
);

const ProgressDashboard = dynamic(
  () =>
    import('@/components/profile/ProgressDashboard').then(mod => ({
      default: mod.ProgressDashboard,
    })),
  { ssr: false }
);

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function ProfilePage() {
  const router = useRouter();
  const {
    user: authUser,
    isLoading: authLoading,
    error: authError,
    logout,
    updateProfile,
  } = useAuth();

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<User | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const init = async () => {
      try {
        if (!authUser) {
          router.push('/login');
          return;
        }
        await loadProfileData();
      } catch (err) {
        console.error('Profile initialization error:', err);
      }
    };

    void init();
  }, [router, authUser]);

  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await userService.getProfile();

      if (data.stats && !Array.isArray(data.stats.achievements)) {
        data.stats.achievements = [];
      }

      setProfileData(data);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to load profile data'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
      setError(err instanceof Error ? err.message : 'Failed to logout');
    }
  };

  const handleUpdateProfile = async (data: Partial<User>): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      if (!authUser) {
        throw new Error('Not authenticated');
      }
      await updateProfile(data as UpdateProfileData);
      await loadProfileData();
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (authError || !authUser) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Profile</h1>
          <Button onClick={() => void handleLogout()} variant="secondary">
            Logout
          </Button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <TabGroup>
          <TabList className="mb-8 flex space-x-1 rounded-xl bg-gray-100 p-1">
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-600'
                )
              }
            >
              Edit Profile
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-gray-600 hover:bg-white/[0.12] hover:text-blue-600'
                )
              }
            >
              Settings
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {profileData && (
                <ProfileEdit
                  user={profileData}
                  onUpdate={handleUpdateProfile}
                />
              )}
            </TabPanel>
            <TabPanel>
              {authUser && <ProfileSettings user={authUser} />}
              <div className="mt-6">
                <RoleUpgrade />
              </div>
            </TabPanel>
            <TabPanel>
              {profileData?.stats && (
                <ProgressDashboard
                  user={authUser}
                  stats={{
                    responseRate: profileData.stats.responseRate,
                    meetupSuccessRate: profileData.stats.meetupSuccessRate,
                    matchRate: profileData.stats.matchRate,
                    lastActive: profileData.stats.lastActive,
                    safetyChecks: profileData.stats.safetyChecks,
                    matches: profileData.stats.matches,
                    events: profileData.stats.events,
                    achievements: Array.isArray(profileData.stats.achievements)
                      ? profileData.stats.achievements
                      : [], // ✅ Ensure achievements is always an array
                    pointsEarned: profileData.stats.pointsEarned,
                  }}
                />
              )}
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </div>
    </Layout>
  );
}
