
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
      {alerts.map(alert => (
        <SafetyAlertNotification
          key={alert.id}
          alert={{
            ...alert,
            status: alert.status || 'active'
          }}
          onDismiss={() => dismissAlert(alert.id)}
        />
      ))}
    </div>
  );
};
