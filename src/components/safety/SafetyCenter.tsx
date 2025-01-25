'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createToast } from '@/hooks/use-toast';
import { Switch } from '@headlessui/react';
import { SafetyFeatures } from '@/components/safety/SafetyFeatures';
import React from 'react';
import type { SafetySettingsNew } from '@/types/safety';

interface SafetyCenterProps {
  userId: string;
  safetySettings: SafetySettingsNew;
  onSettingsChange?: (settings: Partial<SafetySettingsNew>) => void;
}

export default function SafetyCenter({ userId, safetySettings, onSettingsChange }: SafetyCenterProps) {
  const { user } = useAuth();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Safety Center</h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Safety Features</h3>
            <p className="text-sm text-gray-500">Configure your safety preferences</p>
          </div>
          <Switch
            checked={safetySettings.sosAlertEnabled}
            onChange={(enabled) => onSettingsChange?.({ sosAlertEnabled: enabled })}
            className={`${
              safetySettings.sosAlertEnabled ? 'bg-blue-600' : 'bg-gray-200'
            } relative inline-flex h-6 w-11 items-center rounded-full`}
          >
            <span className="sr-only">Enable safety features</span>
            <span
              className={`${
                safetySettings.sosAlertEnabled ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition`}
            />
          </Switch>
        </div>

        {safetySettings.sosAlertEnabled && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-base font-medium text-gray-900">Auto-share Location</h4>
                <p className="text-sm text-gray-500">Share location during meetups</p>
              </div>
              <Switch
                checked={safetySettings.autoShareLocation}
                onChange={(enabled) => onSettingsChange?.({ autoShareLocation: enabled })}
                className={`${
                  safetySettings.autoShareLocation ? 'bg-blue-600' : 'bg-gray-200'
                } relative inline-flex h-6 w-11 items-center rounded-full`}
              >
                <span className="sr-only">Enable auto location sharing</span>
                <span
                  className={`${
                    safetySettings.autoShareLocation ? 'translate-x-6' : 'translate-x-1'
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SafetyPage() {
  const { isLoading, user } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<SafetySettingsNew>({
    sosAlertEnabled: false,
    emergencyContacts: [],
    autoShareLocation: false,
    meetupCheckins: false,
    requireVerifiedMatch: false,
  });

  const updateSafetySettings = async (newSettings: Partial<SafetySettingsNew>) => {
    try {
      const response = await fetch('/api/safety/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });

      if (!response.ok) {
        throw new Error('Failed to update settings');
      }

      setSettings(prev => ({ ...prev, ...newSettings }));
      createToast.success({
        title: 'Settings Updated',
        description: 'Your safety settings have been saved.',
      });
    } catch (error) {
      console.error('Failed to update safety settings:', error);
      createToast.error({
        title: 'Error',
        description: 'Failed to update settings. Please try again.',
      });
    }
  };

  const [loading, setLoading] = useState<boolean>(true);

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
        const data = await response.json();
        const typedSettings = data as SafetySettingsNew;
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
                    void updateSafetySettings({ sosAlertEnabled: enabled });
                  }}
                  className={`${
                    settings.sosAlertEnabled ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span className="sr-only">Enable safety features</span>
                  <span
                    className={`${
                      settings.sosAlertEnabled ? 'translate-x-6' : 'translate-x-1'
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
            <div className="mt-6">
              <h4 className="text-base font-medium text-gray-900">
                Emergency Contacts
              </h4>
              <div className="mt-4 space-y-4">
                {settings.emergencyContacts.map(contact => {
                  const contactData: EmergencyContact = typeof contact === 'string'
                    ? { id: contact, email: '', phoneNumber: '' }
                    : contact;

                  return (
                    <div
                      key={contactData.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {contactData.id || 'Unknown Contact'}
                        </p>
                        <p className="text-sm text-gray-500">{contactData.email}</p>
                        <p className="text-sm text-gray-500">{contactData.phoneNumber}</p>
                      </div>
                    </div>
                  );
                })}
                {settings.emergencyContacts.length === 0 && (
                  <p className="text-sm text-gray-500">
                    No emergency contacts added yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <SafetyFeatures
            user={{
              id: user?.id || '',
              preferences: {
                maxDistance: 50,
                ageRange: {
                  min: 18,
                  max: 99
                },
                interests: [],
                gender: [],
                lookingFor: [],
                relationshipType: [],
                notifications: { 
                  matches: true,
                  messages: true,
                  events: true,
                  safety: true 
                },
                privacy: {
                  showOnlineStatus: true,
                  showLastSeen: true,
                  showLocation: true,
                  showAge: true
                },
                safety: {
                  requireVerifiedMatch: true,
                  meetupCheckins: true,
                  emergencyContactAlerts: true
                },
              },
            }}
            settings={settings}
            onSettingsChange={updateSafetySettings}
          />
          <SafetyCenter
            userId={user?.id || ''}
            safetySettings={settings}
            onSettingsChange={updateSafetySettings}
          />
        </div>
      </div>
    </div>
  );
}
interface EmergencyContact {
  id: string;
  email?: string;
  phoneNumber?: string;
}