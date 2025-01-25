
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
        const validAlert: SafetyAlertNew = {
          id: alert.id,
          userId: alert.userId,
          type: alert.type,
          status: alert.status || 'active',
          location: {
            latitude: alert.location?.latitude || 0,
            longitude: alert.location?.longitude || 0,
            accuracy: alert.location?.accuracy,
            timestamp: new Date(),
          },
          message: alert.message,
          description: alert.description,
          createdAt: alert.createdAt,
          updatedAt: alert.updatedAt,
          resolvedAt: alert.resolvedAt,
        };

        return (
          <SafetyAlertNotification
            key={validAlert.id}
            alert={validAlert}
            onDismiss={() => dismissAlert(validAlert.id)}
          />
        );
      })}
    </div>
  );
};
