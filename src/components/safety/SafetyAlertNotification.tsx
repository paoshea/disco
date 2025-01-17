import React, { useEffect, useState } from 'react';
import { XMarkIcon, ExclamationTriangleIcon, MapPinIcon } from '@heroicons/react/24/outline';
import type { SafetyAlert } from '@/types/safety';
import { Button } from '@/components/ui/Button';
import { BaseMapView } from '@/components/map/BaseMapView';

interface SafetyAlertNotificationProps {
  alert: SafetyAlert;
  onDismiss: () => Promise<void>;
}

export const SafetyAlertNotification: React.FC<SafetyAlertNotificationProps> = ({
  alert,
  onDismiss,
}) => {
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDismiss = async () => {
    try {
      setIsLoading(true);
      await onDismiss();
    } catch (err) {
      console.error('Error dismissing alert:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while dismissing the alert');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative rounded-lg bg-white p-4 shadow-lg ring-1 ring-black ring-opacity-5">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-6 w-6 text-red-400" aria-hidden="true" />
        </div>
        <div className="ml-3 w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">{alert.title}</p>
          <p className="mt-1 text-sm text-gray-500">{alert.description}</p>
          {alert.location && (
            <div className="mt-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setShowMap(!showMap)}
                className="inline-flex items-center"
              >
                <MapPinIcon className="mr-1.5 h-4 w-4" />
                {showMap ? 'Hide Location' : 'View Location'}
              </Button>
              {showMap && (
                <div className="mt-2 h-48 w-full overflow-hidden rounded">
                  <BaseMapView
                    center={[alert.location.latitude, alert.location.longitude]}
                    zoom={15}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="ml-4 flex flex-shrink-0">
          <Button
            type="button"
            variant="ghost"
            onClick={handleDismiss}
            disabled={isLoading}
            className="inline-flex rounded-md text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Dismiss</span>
            <XMarkIcon className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
