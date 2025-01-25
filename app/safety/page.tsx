'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { SafetyService } from '@/services/safety/safety.service';
import { createToast } from '@/hooks/use-toast';
import { Switch } from '@headlessui/react';

interface SafetySettings {
  enabled: boolean;
  emergencyContacts: {
    id: string;
    name: string;
    phone: string;
    email: string;
    priority: 'primary' | 'secondary';
  }[];
}

export default function SafetyPage() {
  const { isLoading, user } = useAuth();
  const router = useRouter();
  const [settings, setSettings] = useState<SafetySettings>({
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
        const safetyService = SafetyService.getInstance();
        const contacts = await safetyService.getEmergencyContacts(user.id);

        setSettings({
          enabled: true, // TODO: Get from settings when implemented
          emergencyContacts: contacts.map(c => ({
            id: c.id,
            name: `${c.firstName} ${c.lastName}`,
            phone: c.phoneNumber || '',
            email: c.email || '',
            priority: 'primary' as const,
          })),
        });
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
                  onChange={enabled => setSettings({ ...settings, enabled })}
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

                <button
                  type="button"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => {
                    // TODO: Implement add contact
                    createToast.info({
                      title: 'Coming Soon',
                      description:
                        'Adding emergency contacts will be available soon.',
                    });
                  }}
                >
                  Add Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
'use client';

import { SafetyFeatures } from '@/components/safety/SafetyFeatures';
import { SafetyCenter } from '@/components/safety/SafetyCenter';

export default function SafetyPage() {
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Safety & Security</h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Your safety is our top priority. Learn about our comprehensive safety features and guidelines.
          </p>
        </div>
        <SafetyFeatures />
        <SafetyCenter />
      </div>
    </div>
  );
}
