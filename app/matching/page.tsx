'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';
import { Switch } from '@headlessui/react';
import { LocationService } from '@/services/location/location.service';

interface MatchingSettings {
  enabled: boolean;
  radius: number;
  interests: string[];
}

interface User {
  id: string;
}

export default function MatchingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [settings, setSettings] = useState<MatchingSettings>({
    enabled: false,
    radius: 5000,
    interests: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!user?.id) {
        router.push('/auth/signin');
        return;
      }

      try {
        const locationService = LocationService.getInstance();
        const { data: locationState } = await locationService.getLocationState(user.id);
        
        if (locationState) {
          setSettings(prev => ({
            ...prev,
            enabled: locationState.enabled,
          }));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load matching settings');
      } finally {
        setLoading(false);
      }
    };

    void fetchSettings();
  }, [user?.id, router]);

  const handleToggleMatching = async (enabled: boolean) => {
    if (!user?.id) return;

    try {
      const locationService = LocationService.getInstance();
      await locationService.updateLocationState(user.id, {
        enabled,
      });
      setSettings(prev => ({ ...prev, enabled }));
      toast.success(enabled ? 'Matching enabled' : 'Matching disabled');
    } catch (error) {
      console.error('Error updating matching settings:', error);
      toast.error('Failed to update matching settings');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Matching Settings</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Enable Matching</h2>
            <p className="text-gray-600">
              Allow others to discover and connect with you based on shared interests
            </p>
          </div>
          <Switch
            checked={settings.enabled}
            onChange={(enabled: boolean) => handleToggleMatching(enabled)}
            className={`${
              settings.enabled ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span
              className={`${
                settings.enabled ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>
      </div>
    </div>
  );
}
