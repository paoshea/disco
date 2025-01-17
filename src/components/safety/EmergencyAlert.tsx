import React, { useState, useEffect } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { EmergencyAlert as EmergencyAlertType } from '@/types/safety';
import { Button } from '@/components/ui/Button';
import { MapView } from '@/components/map/MapView';

interface EmergencyAlertProps {
  onTrigger: (alert: Partial<EmergencyAlertType>) => Promise<void>;
  onCancel: () => void;
}

export const EmergencyAlert: React.FC<EmergencyAlertProps> = ({ onTrigger, onCancel }) => {
  const [isTriggering, setIsTriggering] = useState(false);
  const [message, setMessage] = useState('');
  const { location, error: locationError } = useGeolocation();

  useEffect(() => {
    // Start getting location immediately when component mounts
    navigator.geolocation.getCurrentPosition(() => {});
  }, []);

  const handleTrigger = async () => {
    try {
      setIsTriggering(true);
      await onTrigger({
        type: 'emergency',
        message,
        location: location
          ? {
              latitude: location.latitude,
              longitude: location.longitude,
              accuracy: location.accuracy || 0,
            }
          : undefined,
        status: 'active',
      });
    } catch (error) {
      console.error('Error triggering alert:', error);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-800">Emergency Alert</h3>
        <p className="mt-1 text-sm text-red-600">
          This will immediately notify your emergency contacts and our safety team. If you're in
          immediate danger, please contact emergency services directly.
        </p>
      </div>

      {locationError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-700">
            Unable to get your location. Your emergency contacts will still be notified, but we
            won't be able to share your location with them.
          </p>
        </div>
      )}

      {location && (
        <div className="h-48 rounded-lg overflow-hidden">
          <MapView
            center={{ lat: location.latitude, lng: location.longitude }}
            zoom={15}
            markers={[
              {
                position: { lat: location.latitude, lng: location.longitude },
                title: 'Your Location',
              },
            ]}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Additional Information (Optional)
        </label>
        <textarea
          className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
          placeholder="Add any details about your situation..."
          value={message}
          onChange={e => setMessage(e.target.value)}
        />
      </div>

      <div className="flex flex-col space-y-3">
        <Button
          type="button"
          variant="danger"
          size="lg"
          loading={isTriggering}
          onClick={handleTrigger}
        >
          Trigger Emergency Alert
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isTriggering}>
          Cancel
        </Button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-500">
          Emergency Services:{' '}
          <a href="tel:911" className="text-primary-600 font-semibold">
            911
          </a>
        </p>
      </div>
    </div>
  );
};
