import React from 'react';
import type { SafetyAlertNew, SafetyAlertType } from '@/types/safety';
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
        const alertLocation =
          alert.location && typeof alert.location === 'object' && 'timestamp' in alert.location
            ? {
                latitude: Number((alert.location as any).latitude),
                longitude: Number((alert.location as any).longitude),
                accuracy: Number((alert.location as any).accuracy),
                timestamp: typeof (alert.location as any).timestamp === 'string'
                  ? new Date((alert.location as any).timestamp)
                  : new Date(),
              }
            : {
                latitude: 0,
                longitude: 0,
                accuracy: undefined,
                timestamp: new Date(),
              };

        const safetyAlert: SafetyAlertNew = {
          ...alert,
          type: alert.type as SafetyAlertType,
          status: alert.dismissed
            ? 'dismissed'
            : alert.resolved
            ? 'resolved'
            : 'active',
          location: alertLocation,
          description: alert.description || undefined,
          message: alert.message || undefined,
          resolvedAt: alert.resolvedAt ? new Date(alert.resolvedAt).toISOString() : undefined,
          createdAt: new Date(alert.createdAt).toISOString(),
          updatedAt: new Date(alert.updatedAt).toISOString()
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
