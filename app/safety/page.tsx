'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { createToast } from '@/hooks/use-toast';
import { Switch } from '@headlessui/react';
import { SafetyFeatures } from '@/components/safety/SafetyFeatures';
import { SafetyCenter } from '@/components/safety/SafetyCenter';

export default function SafetyPage() {
  const { isLoading, user } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState({
    enabled: false,
    emergencyContacts: [],
  });
  const [loading, setLoading] = useState(true);

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
        const data = await response.json() as { enabled: boolean; emergencyContacts: Array<{ id: string; name: string; email: string; phone: string; priority: string }> };
        setSettings(data);
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
                  checked={settings.enabled}
                  onChange={async enabled => {
                    try {
                      const response = await fetch('/api/safety/settings', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ enabled }),
                      });
                      if (!response.ok)
                        throw new Error('Failed to update settings');
                      setSettings(prev => ({ ...prev, enabled }));
                    } catch (error) {
                      console.error('Failed to update safety settings:', error);
                      createToast.error({
                        title: 'Error',
                        description:
                          'Failed to update settings. Please try again.',
                      });
                    }
                  }}
                  className={`${
                    settings.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  } relative inline-flex h-6 w-11 items-center rounded-full`}
                >
                  <span className="sr-only">Enable safety features</span>
                  <span
                    className={`${
                      settings.enabled ? 'translate-x-6' : 'translate-x-1'
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
                {settings.emergencyContacts.map(contact => (
                  <div
                    key={contact.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {contact.name}
                      </p>
                      <p className="text-sm text-gray-500">{contact.email}</p>
                      <p className="text-sm text-gray-500">{contact.phone}</p>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          contact.priority === 'primary'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {contact.priority}
                      </span>
                    </div>
                  </div>
                ))}
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
          <SafetyFeatures />
          <SafetyCenter />
        </div>
      </div>
    </div>
  );
}
