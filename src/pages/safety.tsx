import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useSafetyAlert } from '@/contexts/SafetyAlertContext';
import { Layout } from '@/components/layout/Layout';
import { SafetyCenter } from '@/components/safety/SafetyCenter';
import { EmergencyContactList } from '@/components/safety/EmergencyContactList';
import { SafetyCheckList } from '@/components/safety/SafetyCheckList';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { Tab } from '@headlessui/react';
import type { SafetyAlert, SafetyCheck } from '@/types/safety';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Safety() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const {
    alerts,
    safetyChecks,
    isLoading: safetyLoading,
    triggerEmergencyAlert,
    resolveSafetyCheck,
    dismissAlert,
  } = useSafetyAlert();

  useEffect(() => {
    const init = async () => {
      try {
        if (!authLoading && !user) {
          await router.push('/login');
          return;
        }

        setIsLoading(true);
        setError(null);
        const [alertsData, checksData] = await Promise.all([
          safetyService.getAlerts(),
          safetyService.getChecks(),
        ]);
        setAlerts(alertsData);
        setChecks(checksData);
      } catch (err) {
        console.error('Error loading safety data:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred while loading safety data.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    void init();
  }, [router, user, authLoading]);

  if (isLoading || safetyLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-700">{error}</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <h1 className="text-3xl font-bold text-gray-900">Safety Center</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your safety settings and emergency contacts
          </p>
        </div>

        {error && <Alert type="error" title="Error" message={error} className="mb-6" />}

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
              Safety Center
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
              Emergency Contacts
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
              Safety Checks
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-6">
            <Tab.Panel>
              <SafetyCenter onTriggerAlert={triggerEmergencyAlert} onDismissAlert={dismissAlert} />
            </Tab.Panel>
            <Tab.Panel>
              <EmergencyContactList
                contacts={user?.emergencyContacts || []}
                onEdit={contact => {
                  // Handle contact edit
                  console.log('Editing contact:', contact);
                }}
                onDelete={contactId => {
                  // Handle contact delete
                  console.log('Deleting contact:', contactId);
                }}
              />
            </Tab.Panel>
            <Tab.Panel>
              <SafetyCheckList
                checks={safetyChecks}
                onResolve={(checkId: string) => {
                  // Adapt the onResolve function to match the expected signature
                  return resolveSafetyCheck(checkId, 'safe');
                }}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </Layout>
  );
}
