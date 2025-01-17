import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { ProfileEdit } from '@/components/profile/ProfileEdit';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Button } from '@/components/ui/Button';
import { Tab } from '@headlessui/react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Profile() {
  const router = useRouter();
  const { user, isLoading, error, logout, updateProfile, sendVerificationEmail } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleVerifyEmail = async () => {
    try {
      await sendVerificationEmail();
    } catch (err) {
      console.error('Failed to send verification email:', err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
            {!user.emailVerified && (
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
              <ProfileEdit user={user} onUpdate={updateProfile} />
            </Tab.Panel>
            <Tab.Panel>
              <ProfileSettings user={user} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </Layout>
  );
}
