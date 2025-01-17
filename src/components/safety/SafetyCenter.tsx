import React, { useCallback } from 'react';
import type { SafetyCenterProps } from '@/types/safety';
import type { SafetyAlertNew } from '@/types/safety';
import { EmergencyAlert } from './EmergencyAlert';
import { SafetyFeatures } from './SafetyFeatures';
import { SafetyAlertNotification } from './SafetyAlertNotification';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useSafetyAlert } from '@/contexts/SafetyAlertContext';

export const SafetyCenter: React.FC<SafetyCenterProps> = ({ userId, onSettingsChange }) => {
  const { alerts, isLoading, error, dismissAlert, addAlert } = useSafetyAlert();

  const handleAlertTriggered = useCallback(
    async (alert: SafetyAlertNew) => {
      if (alert.type === 'sos') {
        try {
          await addAlert({
            ...alert,
            description: alert.description || 'Emergency alert triggered',
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
    (settings: Parameters<NonNullable<typeof onSettingsChange>>[0]) => {
      onSettingsChange?.(settings);
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
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Emergency Alert</h2>
        <EmergencyAlert userId={userId} onAlertTriggered={handleAlertTriggered} />
      </section>

      {alerts.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Active Alerts</h2>
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
        <h2 className="mb-4 text-xl font-semibold text-gray-900">Safety Features</h2>
        <SafetyFeatures
          user={{
            id: userId,
            name: '',
            firstName: '',
            lastName: '',
            email: '',
            emailVerified: false,
            interests: [],
            status: 'online',
            emergencyContacts: [],
            verificationStatus: 'unverified',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }}
          settings={{
            autoShareLocation: false,
            meetupCheckins: false,
            sosAlertEnabled: true,
            requireVerifiedMatch: false,
            emergencyContacts: [],
          }}
          onSettingsChange={handleSettingsChange}
        />
      </section>
    </div>
  );
};
