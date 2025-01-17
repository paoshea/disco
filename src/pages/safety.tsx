import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Layout } from '@/components/layout/Layout';
import { SafetyFeatures } from '@/components/safety/SafetyFeatures';
import { useAuth } from '@/contexts/AuthContext';
import { EmergencyContact } from '@/types/user';

const SafetyPage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleUpdateEmergencyContacts = async (contacts: EmergencyContact[]) => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/emergency-contacts', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify({ contacts }),
      });

      if (!response.ok) {
        throw new Error('Failed to update emergency contacts');
      }
    } catch (error) {
      console.error('Failed to update emergency contacts:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSafetySettings = async (settings: any) => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/safety-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error('Failed to update safety settings');
      }
    } catch (error) {
      console.error('Failed to update safety settings:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSOS = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/safety/sos', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to trigger SOS');
      }
    } catch (error) {
      console.error('Failed to trigger SOS:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading || !user) {
    return (
      <Layout title="Safety - DISCO!">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Safety - DISCO!">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Safety Center</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your safety settings and emergency contacts
          </p>
        </div>

        <SafetyFeatures
          user={user}
          onUpdateEmergencyContacts={handleUpdateEmergencyContacts}
          onUpdateSafetySettings={handleUpdateSafetySettings}
          onTriggerSOS={handleTriggerSOS}
        />
      </div>
    </Layout>
  );
};

export default SafetyPage;
