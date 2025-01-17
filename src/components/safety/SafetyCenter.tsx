import React from 'react';
import type { SafetyCenterProps } from '@/types/safety';
import type { SafetyAlert, SafetyAlertNew } from '@/types/safety';
import { EmergencyAlert } from './EmergencyAlert';
import { SafetyFeatures } from './SafetyFeatures';
import { SafetyAlertNotification } from './SafetyAlertNotification';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useSafetyAlert } from '@/contexts/SafetyAlertContext';

const convertToSafetyAlert = (alert: SafetyAlertNew): SafetyAlert => ({
  id: alert.id,
  userId: alert.userId,
  type:
    alert.type === 'location'
      ? 'location-share'
      : alert.type === 'meetup'
        ? 'check-in'
        : (alert.type as 'sos' | 'custom'),
  status: alert.status === 'active' ? 'pending' : alert.status,
  location: alert.location,
  message: alert.description,
  contactedEmergencyServices: false,
  notifiedContacts: [],
  createdAt: alert.createdAt,
  updatedAt: alert.updatedAt,
  resolvedAt: alert.resolvedAt,
});

export const SafetyCenter: React.FC<SafetyCenterProps> = ({ userId, onSettingsChange }) => {
  const { alerts, isLoading, error, dismissAlert, addAlert } = useSafetyAlert();

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
        <EmergencyAlert
          userId={userId}
          onAlertTriggered={alert => {
            if (alert.type === 'sos') {
              addAlert({
                ...alert,
                description: alert.description || 'Emergency alert triggered',
              });
            }
          }}
        />
      </section>

      {alerts.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Active Alerts</h2>
          <div className="space-y-4">
            {alerts.map(alert => (
              <SafetyAlertNotification
                key={alert.id}
                alert={alert}
                onDismiss={() => dismissAlert(alert.id)}
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
          onSettingsChange={onSettingsChange || (() => {})}
        />
      </section>
    </div>
  );
};
