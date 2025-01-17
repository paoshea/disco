import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { ProfileEdit } from '@/components/profile/ProfileEdit';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Tab } from '@headlessui/react';
import { userService } from '@/services/api/user.service';
import type { User } from '@/types/user';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Profile() {
  const router = useRouter();
  const { user: authUser, isLoading: authLoading, error: authError, logout, updateProfile, sendVerificationEmail } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<User | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        if (!authUser) {
          await router.push('/login');
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
      setProfileData(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while loading profile data.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async (data: Partial<User>) => {
    try {
      setIsLoading(true);
      setError(null);
      const updatedProfile = await userService.updateProfile(data);
      setProfileData(updatedProfile);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while updating profile.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      await router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await sendVerificationEmail();
    } catch (err) {
      console.error('Failed to send verification email:', err);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!authUser || !profileData) {
    return null;
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            {!authUser.emailVerified && (
              <div className="mt-2">
                <p className="text-sm text-yellow-600">
                  Your email is not verified.{' '}
                  <button
                    onClick={handleVerifyEmail}
                    className="font-medium text-yellow-700 hover:text-yellow-600"
                  >
                    Resend verification email
                  </button>
                </p>
              </div>
            )}
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            Sign out
          </Button>
        </div>

        {authError && <p className="mb-4 text-sm text-red-600">{authError}</p>}
        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-primary-900/20 p-1">
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-primary-700 shadow'
                    : 'text-primary-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              Profile
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-primary-700 shadow'
                    : 'text-primary-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              Settings
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-6">
            <Tab.Panel>
              {profileData && (
                <ProfileEdit
                  user={profileData}
                  onUpdate={handleUpdateProfile}
                />
              )}
            </Tab.Panel>
            <Tab.Panel>
              {profileData && <ProfileSettings user={profileData} />}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </Layout>
  );
}
