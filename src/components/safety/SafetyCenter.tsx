'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createToast } from '@/hooks/use-toast';
import { Switch } from '@headlessui/react';
import { SafetyFeatures } from '@/components/safety/SafetyFeatures';
import type { SafetySettingsNew } from '@/types/safety';

interface SafetyCenterProps {
  safetySettings?: SafetySettingsNew;
  onSettingsChange?: (settings: Partial<SafetySettingsNew>) => void;
}

export default function SafetyCenter({
  safetySettings,
  onSettingsChange,
}: SafetyCenterProps) {
  const { isLoading, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(true);
  const [settings, setSettings] = useState<SafetySettingsNew>(
    safetySettings || {
      sosAlertEnabled: false,
      emergencyContacts: [],
      autoShareLocation: false,
      meetupCheckins: false,
      requireVerifiedMatch: false,
    }
  );

  const handleSettingsChange = useCallback(
    (newSettings: Partial<SafetySettingsNew>) => {
      setSettings(prev => ({ ...prev, ...newSettings }));
      onSettingsChange?.(newSettings);
    },
    [onSettingsChange]
  );

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      void router.push('/auth/signin');
      return;
    }

    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/safety/settings');
        if (!response.ok) throw new Error('Failed to fetch safety settings');
        const data: Partial<SafetySettingsNew> = await response.json();
        const typedSettings: SafetySettingsNew = {
          sosAlertEnabled: Boolean(data.sosAlertEnabled),
          emergencyContacts: Array.isArray(data.emergencyContacts)
            ? data.emergencyContacts
            : [],
          autoShareLocation: Boolean(data.autoShareLocation),
          meetupCheckins: Boolean(data.meetupCheckins),
          requireVerifiedMatch: Boolean(data.requireVerifiedMatch),
        };
        setSettings(typedSettings);
      } catch (error) {
        console.error('Failed to fetch safety settings:', error);
        createToast.error({
          title: 'Error',
          description: 'Failed to load safety settings. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    void fetchSettings();
  }, [isLoading, user, router]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Safety Settings
            </h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>
                Configure your safety preferences and emergency contacts. These
                settings help ensure your safety while using our service.
              </p>
            </div>
            <div className="mt-5">
              <div className="flex items-center">
                <Switch
                  checked={settings.sosAlertEnabled}
                  onChange={enabled => {
                    handleSettingsChange({ sosAlertEnabled: enabled });
                  }}
                  className={`${
                    settings.sosAlertEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span className="sr-only">Enable safety features</span>
                  <span
                    className={`${
                      settings.sosAlertEnabled
                        ? 'translate-x-6'
                        : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
                <span className="ml-3">
                  <span className="text-sm font-medium text-gray-900">
                    Enable Safety Features
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          {user && (
            <SafetyFeatures
              user={user}
              settings={settings}
              onSettingsChange={handleSettingsChange}
            />
          )}
        </div>
      </div>
    </div>
  );
}
