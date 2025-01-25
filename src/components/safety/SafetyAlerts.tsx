import React from 'react';
import type { SafetyAlertNew } from '@/types/safety';
import { useSafetyAlerts } from '@/contexts/SafetyAlertContext';
import { SafetyAlertNotification } from './SafetyAlertNotification';

export const SafetyAlerts: React.FC = () => {
  const { alerts, dismissAlert } = useSafetyAlerts();

  if (!alerts.length) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-4">
      {alerts.map((alert: SafetyAlertNew) => {
        const alertLocation = alert.location && typeof alert.location === 'object' && 'timestamp' in alert.location
          ? {
              ...alert.location,
              timestamp:
                typeof alert.location.timestamp === 'string'
                  ? alert.location.timestamp
                  : alert.location.timestamp instanceof Date
                  ? alert.location.timestamp.toISOString()
                  : new Date().toISOString(),
            }
          : null;

        return (
          <SafetyAlertNotification
            key={alert.id}
            alert={{
              ...alert,
              location: alertLocation,
            }}
            onDismiss={() => dismissAlert(alert.id)}
          />
        );
      })}
    </div>
  );
};
