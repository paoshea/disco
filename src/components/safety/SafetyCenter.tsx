import React, { useCallback, useState } from 'react';
import type { SafetyCenterProps } from '@/types/safety';
import type { SafetyAlertNew, SafetySettingsNew } from '@/types/safety';
import { EmergencyAlert } from './EmergencyAlert';
import { SafetyFeatures } from './SafetyFeatures';
import { SafetyAlertNotification } from './SafetyAlertNotification';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useSafetyAlerts } from '@/contexts/SafetyAlertContext';

export const SafetyCenter: React.FC<SafetyCenterProps> = ({
  userId,
  onSettingsChange,
}) => {
  const { alerts, isLoading, error, dismissAlert, addAlert } =
    useSafetyAlerts();

  const [settings, setSettings] = useState<SafetySettingsNew>({
    autoShareLocation: false,
    meetupCheckins: true,
    sosAlertEnabled: true,
    requireVerifiedMatch: false,
    emergencyContacts: [],
  });

  const handleAlertTriggered = useCallback(
    async (alert: SafetyAlertNew) => {
      if (alert.type === 'sos') {
        try {
          await addAlert({
            ...alert,
            description: alert.description || 'Emergency alert triggered',
            status: 'active',
          });
        } catch (err) {
          console.error('Failed to add emergency alert:', err);
          // You might want to show this error to the user through a toast or other UI element
        }
      }
    },
    [addAlert]
  );

  const handleSettingsChange = useCallback(
    (newSettings: Partial<SafetySettingsNew>) => {
      setSettings(prev => {
        const updated = { ...prev, ...newSettings };
        onSettingsChange?.(updated);
        return updated;
      });
    },
    [onSettingsChange]
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-4 text-2xl font-bold text-gray-900">
          Emergency Alert
        </h2>
        <EmergencyAlert
          userId={userId}
          onAlertTriggered={alert => {
            void handleAlertTriggered(alert);
          }}
        />
      </section>

      {alerts.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Active Alerts
          </h2>
          <div className="space-y-4">
            {alerts.map(alert => (
              <SafetyAlertNotification
                key={alert.id}
                alert={alert}
                onDismiss={async () => {
                  try {
                    await dismissAlert(alert.id);
                  } catch (err) {
                    console.error('Failed to dismiss alert:', err);
                  }
                }}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Safety Features
        </h2>
        <SafetyFeatures
          user={{
            id: userId,
            firstName: '',
            lastName: '',
            email: '',
            emailVerified: false,
            name: '',
            lastActive: new Date(),
            verificationStatus: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            preferences: {
              maxDistance: 50,
              ageRange: { min: 18, max: 99 },
              interests: [],
              gender: [],
              lookingFor: [],
              relationshipType: [],
              notifications: {
                matches: true,
                messages: true,
                events: true,
                safety: true,
              },
              privacy: {
                showOnlineStatus: true,
                showLastSeen: true,
                showLocation: true,
                showAge: true,
              },
              safety: {
                requireVerifiedMatch: false,
                meetupCheckins: true,
                emergencyContactAlerts: true,
              },
            },
          }}
          settings={settings}
          onSettingsChange={handleSettingsChange}
        />
      </section>
    </div>
  );
};
