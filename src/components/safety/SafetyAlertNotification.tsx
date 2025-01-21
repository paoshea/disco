import React, { useState } from 'react';
import {
  XMarkIcon,
  ExclamationTriangleIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import type { SafetyAlertNew } from '@/types/safety';
import { Button } from '@/components/ui/Button';
import { BaseMapView } from '@/components/map/BaseMapView';

interface SafetyAlertNotificationProps {
  alert: SafetyAlertNew;
  onDismiss: () => Promise<void>;
}

export const SafetyAlertNotification: React.FC<
  SafetyAlertNotificationProps
> = ({ alert, onDismiss }) => {
  const [showMap, setShowMap] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDismiss = async () => {
    try {
      setIsLoading(true);
      await onDismiss();
    } catch (err) {
      console.error('Error dismissing alert:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while dismissing the alert'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const getAlertTitle = () => {
    switch (alert.type) {
      case 'sos':
        return 'Emergency Alert';
      case 'location':
        return 'Location Alert';
      case 'meetup':
        return 'Meetup Alert';
      case 'custom':
        return 'Custom Alert';
      default:
        return 'Safety Alert';
    }
  };

  const getAlertDescription = () => {
    if (alert.description) {
      return alert.description;
    }
    switch (alert.type) {
      case 'sos':
        return 'Emergency assistance needed!';
      case 'location':
        return 'Location check requested';
      case 'meetup':
        return 'Meetup safety check';
      case 'custom':
        return 'Safety alert';
      default:
        return 'Safety alert';
    }
  };

  const getAlertIcon = () => {
    switch (alert.type) {
      case 'sos':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />;
      case 'location':
      case 'meetup':
        return <MapPinIcon className="h-6 w-6 text-blue-500" />;
      default:
        return <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />;
    }
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow-lg">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">{getAlertIcon()}</div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-gray-900">
            {getAlertTitle()}
          </h3>
          <p className="mt-1 text-sm text-gray-500">{getAlertDescription()}</p>
          {alert.location && (
            <div className="mt-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowMap(!showMap)}
              >
                {showMap ? 'Hide Map' : 'View Location'}
              </Button>
              {showMap && (
                <div className="mt-2 h-48 w-full rounded-md overflow-hidden">
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
                          lat: alert.location?.latitude || 0,
                          lng: alert.location?.longitude || 0,
                        },
                        icon: {
                          url: '/images/alert-marker.svg',
                          scaledSize: new google.maps.Size(32, 32),
                          anchor: new google.maps.Point(16, 32),
                        } as google.maps.Icon,
                        title: getAlertTitle(),
                      },
                    ]}
                    onMarkerClick={() => console.log('Marker clicked')}
                    onMarkerMouseEnter={() => console.log('Marker mouse enter')}
                    onMarkerMouseLeave={() => console.log('Marker mouse leave')}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex-shrink-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void handleDismiss();
            }}
            disabled={isLoading}
          >
            <XMarkIcon className="h-5 w-5" />
          </Button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
};
