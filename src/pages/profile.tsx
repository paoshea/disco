import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout/Layout';
import { ProfileSettings } from '@/components/profile/ProfileSettings';
import { useAuth } from '@/contexts/AuthContext';
import { UserSettings } from '@/types/user';

const ProfilePage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchSettings();
    }
  }, [user, authLoading, router]);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/user/settings', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (newSettings: UserSettings) => {
    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        setSettings(newSettings);
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw error;
    }
  };

  if (loading || !user || !settings) {
    return (
      <Layout title="Profile - DISCO!">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Profile - DISCO!">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your profile information and preferences
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Personal Information</h2>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">
                {user.firstName} {user.lastName}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <p className="mt-1 text-sm text-gray-900">{user.username}</p>
            </div>
          </div>
        </div>

        <ProfileSettings user={user} settings={settings} onSave={handleSaveSettings} />
      </div>
    </Layout>
  );
};

export default ProfilePage;
