import React from 'react';
import type { SafetyAlertNew, SafetyAlertType } from '@/types/safety';
import type { Location } from '@/types/location';
import { useSafetyAlerts } from '@/contexts/SafetyAlertContext';
import { SafetyAlertNotification } from './SafetyAlertNotification';

export const SafetyAlerts: React.FC = () => {
  const { alerts, dismissAlert } = useSafetyAlerts();

  if (!alerts.length) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-4">
      {alerts.map(alert => {
        const locationData = alert.location as unknown as Location;

        const alertLocation: Location = {
          id: alert.id,
          userId: alert.userId,
          latitude: locationData?.latitude ?? 0,
          longitude: locationData?.longitude ?? 0,
          accuracy: locationData?.accuracy,
          timestamp: new Date(locationData?.timestamp instanceof Date ? locationData.timestamp : Date.now()),
          privacyMode: 'precise',
          sharingEnabled: true,
        };

        const safetyAlert: SafetyAlertNew = {
          ...alert,
          type: alert.type as SafetyAlertType,
          status: alert.status === 'dismissed' 
            ? 'dismissed'
            : alert.resolvedAt 
              ? 'resolved'
              : 'active',
          location: alertLocation,
          description: alert.description || undefined,
          message: alert.message || undefined,
          resolvedAt: alert.resolvedAt
            ? new Date(alert.resolvedAt).toISOString()
            : undefined,
          createdAt: new Date(alert.createdAt).toISOString(),
          updatedAt: new Date(alert.updatedAt).toISOString(),
        };

        return (
          <SafetyAlertNotification
            key={alert.id}
            alert={safetyAlert}
            onDismiss={async () => {
              try {
                await dismissAlert(alert.id);
              } catch (error) {
                console.error('Failed to dismiss alert:', error);
              }
            }}
          />
        );
      })}
    </div>
  );
};
