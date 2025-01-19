import React, { useState } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { emergencyService } from '@/services/api/emergency.service';
import type { EmergencyAlertProps, SafetyAlertNew } from '@/types/safety';
import { BaseMapView } from '@/components/map/BaseMapView';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({
  userId,
  onAlertTriggered,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { position, error: locationError } = useGeolocation();

  const handleTriggerAlert = async () => {
    if (!position?.coords) {
      setError('Location is required to send an emergency alert');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const alert = await emergencyService.sendAlert({
        location: {
          id: crypto.randomUUID(),
          userId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(),
          privacyMode: 'precise',
          sharingEnabled: true,
        },
        timestamp: new Date().toISOString(),
      });

      // Convert EmergencyAlert to SafetyAlertNew
      const safetyAlert: SafetyAlertNew = {
        ...alert,
        type: 'sos',
        status: 'active',
        location: {
          id: crypto.randomUUID(),
          userId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(),
          privacyMode: 'precise',
          sharingEnabled: true,
        },
        updatedAt: new Date().toISOString(),
      };

      if (onAlertTriggered) {
        onAlertTriggered(safetyAlert);
      }
    } catch (err) {
      console.error('Error triggering emergency alert:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while sending the emergency alert'
      );
    } finally {
      setLoading(false);
    }
  };

  if (locationError) {
    return (
      <ErrorMessage
        message="Unable to access location. Please enable location services to use emergency alerts."
        className="mb-4"
      />
    );
  }

  return (
    <div className="space-y-4">
      {position?.coords && (
        <div className="h-64 rounded-lg overflow-hidden">
          <BaseMapView
            center={{
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }}
            zoom={15}
            markers={[
              {
                id: 'current-location',
                position: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                },
                icon: {
                  url: '/images/current-location-marker.png',
                  scaledSize: { width: 32, height: 32 },
                },
                title: 'Your Location',
              },
            ]}
          />
        </div>
      )}

      {error && <ErrorMessage message={error} className="mb-4" />}

      <Button
        onClick={() => {
          void handleTriggerAlert();
        }}
        disabled={loading || !position?.coords}
        variant="danger"
        className="w-full py-3 text-lg font-semibold"
      >
        {loading ? (
          <LoadingSpinner className="w-6 h-6" />
        ) : (
          'Send Emergency Alert'
        )}
      </Button>

      <p className="text-sm text-gray-500 text-center">
        This will alert your emergency contacts and share your current location
        with them.
      </p>
    </div>
  );
};
