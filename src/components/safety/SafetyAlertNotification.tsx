import React, { useEffect, useState } from 'react';
import { useSafetyAlerts } from '@/contexts/SafetyAlertContext';
import { EmergencyAlert } from '@/types/safety';
import { XMarkIcon, ExclamationTriangleIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/Button';
import { BaseMapView } from '@/components/map/BaseMapView';

interface SafetyAlertNotificationProps {
  alert: EmergencyAlert;
  onDismiss: () => void;
  onAction?: (action: string) => void;
}

export const SafetyAlertNotification: React.FC = () => {
  const { activeAlerts, resolveAlert } = useSafetyAlerts();
  const [showMap, setShowMap] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        if (Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      } catch (err) {
        console.error('Error requesting notification permission:', err);
      }
    };

    void requestNotificationPermission();
  }, []);

  const handleResolve = async (alertId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await resolveAlert(alertId);
    } catch (err) {
      console.error('Error resolving alert:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while resolving the alert. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveWrapper = (alertId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    void handleResolve(alertId);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderAlertContent = (alert: EmergencyAlert) => (
    <div className="flex items-start space-x-4">
      <div className="flex-shrink-0">
        <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900">Emergency Alert: {alert.type}</p>
        {alert.message && <p className="mt-1 text-sm text-gray-500">{alert.message}</p>}
        <p className="mt-1 text-xs text-gray-400">Triggered at {formatTime(alert.createdAt)}</p>
        {alert.location && (
          <button
            onClick={() => setShowMap(alert.id)}
            className="mt-2 flex items-center text-sm text-primary-600 hover:text-primary-700"
          >
            <MapPinIcon className="h-4 w-4 mr-1" />
            View Location
          </button>
        )}
      </div>
      <div className="flex-shrink-0">
        <Button variant="secondary" size="sm" onClick={handleResolveWrapper(alert.id)}>
          {isLoading ? 'Processing...' : 'Resolve'}
        </Button>
      </div>
    </div>
  );

  if (activeAlerts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 space-y-4 z-50">
      {activeAlerts.map(alert => (
        <div
          key={alert.id}
          className={`max-w-sm w-full bg-white shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 ${
            showMap === alert.id ? 'h-96' : ''
          }`}
        >
          <div className="p-4">
            {showMap === alert.id && alert.location ? (
              <div className="h-64 mb-4">
                <BaseMapView
                  center={{
                    lat: alert.location.latitude,
                    lng: alert.location.longitude,
                  }}
                  zoom={15}
                  markers={[
                    {
                      id: alert.id,
                      position: {
                        lat: alert.location.latitude,
                        lng: alert.location.longitude,
                      },
                      title: 'Alert Location',
                      icon: {
                        url: '/images/alert-marker.png',
                        scaledSize: { width: 32, height: 32 },
                      },
                    },
                  ]}
                />
                <button
                  onClick={() => setShowMap(null)}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-500"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              renderAlertContent(alert)
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
