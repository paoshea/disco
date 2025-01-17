import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/hooks/useAuth';
import { useSafetyAlert } from '@/hooks/useSafetyAlert';
import { Layout } from '@/components/layout/Layout';
import { SafetyCenter } from '@/components/safety/SafetyCenter';
import { EmergencyContacts } from '@/components/safety/EmergencyContacts';
import { SafetyChecks } from '@/components/safety/SafetyChecks';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Tab } from '@headlessui/react';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Safety() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const {
    alerts,
    safetyChecks,
    isLoading: safetyLoading,
    error,
    triggerEmergencyAlert,
    resolveSafetyCheck,
    dismissAlert,
  } = useSafetyAlert();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  if (authLoading || safetyLoading) {
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
        <div className="py-6">
          <h1 className="text-3xl font-bold text-gray-900">Safety Center</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your safety settings and emergency contacts
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

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
              <SafetyCenter
                alerts={alerts}
                onTriggerAlert={triggerEmergencyAlert}
                onDismissAlert={dismissAlert}
              />
            </Tab.Panel>
            <Tab.Panel>
              <EmergencyContacts userId={user.id} />
            </Tab.Panel>
            <Tab.Panel>
              <SafetyChecks
                safetyChecks={safetyChecks}
                onResolve={resolveSafetyCheck}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </Layout>
  );
}
