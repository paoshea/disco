import React from 'react';
import type { SafetyCenterProps } from '@/types/safety';
import { EmergencyAlert } from './EmergencyAlert';
import { SafetyFeatures } from './SafetyFeatures';
import { SafetyAlertNotification } from './SafetyAlertNotification';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import { useSafetyAlert } from '@/contexts/SafetyAlertContext';

export const SafetyCenter: React.FC<SafetyCenterProps> = ({
  user,
  alerts,
  onTriggerAlert,
  onDismissAlert,
}) => {
  const { isLoading, error } = useSafetyAlert();

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
          user={user}
          onTriggerAlert={onTriggerAlert}
        />
      </section>

      {alerts.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-gray-900">
            Active Alerts
          </h2>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <SafetyAlertNotification
                key={alert.id}
                alert={alert}
                onDismiss={() => onDismissAlert(alert.id)}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Safety Features
        </h2>
        <SafetyFeatures user={user} />
      </section>
    </div>
  );
};
