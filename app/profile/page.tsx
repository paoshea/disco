'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function ProfilePage() {
  const router = useRouter();
  const {
    user: authUser,
    isLoading: authLoading,
    error: authError,
    logout,
    updateProfile,
    sendVerificationEmail,
  } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<User | null>(null);

  useEffect(() => {
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
      await updateProfile(data);
      await loadProfileData();
    } catch (err) {
      console.error('Profile update error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await sendVerificationEmail();
      setError('Verification email sent successfully');
    } catch (err) {
      console.error('Send verification email error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to send verification email'
      );
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

        {!authUser.emailVerified && (
          <div className="mb-4 rounded-md bg-yellow-50 p-4">
            <p className="text-sm text-yellow-700">
              Your email is not verified.{' '}
              <button
                onClick={() => void handleSendVerificationEmail()}
                className="font-medium text-yellow-800 hover:underline"
              >
                Click here to resend verification email
              </button>
            </p>
          </div>
        )}

        <Tab.Group>
          <Tab.List className="mb-8 flex space-x-1 rounded-xl bg-gray-100 p-1">
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
          </Tab.List>
          <Tab.Panels>
            <Tab.Panel>
              {profileData && (
                <ProfileEdit
                  user={profileData}
                  onUpdate={async (data: Partial<User>) => {
                    await handleUpdateProfile(data);
                  }}
                />
              )}
            </Tab.Panel>
            <Tab.Panel>
              {authUser && (
                <ProfileSettings
                  user={{
                    id: authUser.id,
                    email: authUser.email,
                    firstName: authUser.firstName,
                    lastName: authUser.lastName,
                    emailVerified: authUser.emailVerified,
                    name: `${authUser.firstName} ${authUser.lastName}`,
                    lastActive: authUser.updatedAt,
                    createdAt: authUser.createdAt,
                    updatedAt: authUser.updatedAt,
                    verificationStatus: authUser.emailVerified
                      ? 'verified'
                      : 'pending',
                  }}
                />
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </Layout>
  );
}
