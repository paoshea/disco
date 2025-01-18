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
import { safetyService } from '@/services/api/safety.service';
import type { SafetyCheckNew as SafetyCheck } from '@/types/safety';
import type { EmergencyContact } from '@/types/user';

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

  // Use alerts to show active alerts if any
  const activeAlerts = alerts.filter(alert => alert.status === 'active');

  useEffect(() => {
    const init = async () => {
      try {
        if (!authLoading && !user) {
          await router.push('/login');
          return;
        }

        // Trigger emergency alert if there's a pending SOS
        if (activeAlerts.some(alert => alert.type === 'sos')) {
          await triggerEmergencyAlert();
        }
      } catch (err) {
        console.error('Error initializing safety page:', err);
        setError(
          err instanceof Error ? err.message : 'An error occurred while loading the safety page.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    void init();
  }, [router, user, authLoading, activeAlerts, triggerEmergencyAlert]);

  // Handle auto-dismissal of resolved alerts
  useEffect(() => {
    const dismissResolvedAlerts = async () => {
      try {
        // Since id is required in SafetyAlertNew interface, we can be sure it exists
        const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved');
        await Promise.all(resolvedAlerts.map(alert => dismissAlert(alert.id)));
      } catch (err) {
        console.error('Error dismissing resolved alerts:', err);
      }
    };

    void dismissResolvedAlerts();
  }, [alerts, dismissAlert]);

  if (isLoading || safetyLoading || authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const wrappedSettingsChange = (
    settings: Parameters<typeof safetyService.updateSafetySettings>[1]
  ) => {
    void (async () => {
      try {
        await safetyService.updateSafetySettings(user.id, {
          autoShareLocation: settings.autoShareLocation,
          meetupCheckins: settings.meetupCheckins,
          sosAlertEnabled: settings.sosAlertEnabled,
          requireVerifiedMatch: settings.requireVerifiedMatch,
          emergencyContacts: (user.emergencyContacts || []).map(contact => ({
            ...contact,
            userId: user.id,
            phoneNumber: contact.phoneNumber || '',
            email: contact.email || '',
            createdAt: contact.createdAt || new Date().toISOString(),
            updatedAt: contact.updatedAt || new Date().toISOString(),
          })),
        });
      } catch (err) {
        console.error('Error updating safety settings:', err);
        setError(err instanceof Error ? err.message : 'Failed to update safety settings');
      }
    })();
  };

  const wrappedEditContact = (contact: EmergencyContact) => {
    void (async () => {
      try {
        if (!contact.id) {
          throw new Error('Contact ID is required');
        }
        // Convert user EmergencyContact to safety EmergencyContact
        const safetyContact = {
          ...contact,
          userId: user.id,
          createdAt: contact.createdAt || new Date().toISOString(),
          updatedAt: contact.updatedAt || new Date().toISOString(),
        };
        await safetyService.updateEmergencyContact(user.id, contact.id, safetyContact);
      } catch (err) {
        console.error('Error updating contact:', err);
        setError(err instanceof Error ? err.message : 'Failed to update contact');
      }
    })();
  };

  const wrappedDeleteContact = (contactId: string) => {
    void (async () => {
      try {
        await safetyService.deleteEmergencyContact(user.id, contactId);
      } catch (err) {
        console.error('Error deleting contact:', err);
        setError(err instanceof Error ? err.message : 'Failed to delete contact');
      }
    })();
  };

  const wrappedCompleteCheck = (checkId: string): Promise<void> => {
    return (async () => {
      try {
        await resolveSafetyCheck(checkId, 'safe');
      } catch (err) {
        console.error('Error completing safety check:', err);
        setError(err instanceof Error ? err.message : 'Failed to complete safety check');
      }
    })();
  };

  // Convert safety checks to the correct type
  const typedSafetyChecks: SafetyCheck[] = safetyChecks.map(check => ({
    id: check.id,
    userId: check.userId,
    type: check.type || 'custom',
    status:
      check.status === 'completed' ? 'completed' : check.status === 'missed' ? 'missed' : 'pending',
    scheduledFor: check.scheduledFor,
    location: check.location,
    description: check.description,
    createdAt: check.createdAt,
    updatedAt: check.updatedAt,
    completedAt: check.completedAt,
  }));

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <h1 className="text-3xl font-bold text-gray-900">Safety Center</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your safety settings and emergency contacts
          </p>
          {activeAlerts.length > 0 && (
            <Alert
              type="warning"
              title="Active Safety Alerts"
              message={`You have ${activeAlerts.length} active safety alert(s)`}
              className="mt-4"
            />
          )}
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
              <SafetyCenter userId={user.id} onSettingsChange={wrappedSettingsChange} />
            </Tab.Panel>
            <Tab.Panel>
              <EmergencyContactList
                contacts={[]}
                onEdit={wrappedEditContact}
                onDelete={wrappedDeleteContact}
              />
            </Tab.Panel>
            <Tab.Panel>
              <SafetyCheckList checks={typedSafetyChecks} onComplete={wrappedCompleteCheck} />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </Layout>
  );
}
