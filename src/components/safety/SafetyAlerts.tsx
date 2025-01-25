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
      {alerts.map((alert) => {
        const alertLocation = alert.location && typeof alert.location === 'object'
          ? {
              latitude: Number((alert.location as any).latitude),
              longitude: Number((alert.location as any).longitude),
              accuracy: Number((alert.location as any).accuracy),
              timestamp: new Date()
            }
          : null;

        const safetyAlert: SafetyAlertNew = {
          ...alert,
          status: alert.dismissed ? 'dismissed' : alert.resolved ? 'resolved' : 'active',
          location: alertLocation || {
            latitude: 0,
            longitude: 0,
            accuracy: undefined,
            timestamp: new Date()
          }
        };

        return (
          <SafetyAlertNotification
            key={alert.id}
            alert={safetyAlert}
            onDismiss={() => dismissAlert(alert.id)}
          />
        );
      })}
    </div>
  );
};
