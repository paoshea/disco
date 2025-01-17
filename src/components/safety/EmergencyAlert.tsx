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
  const { position, error: locationError } = useGeolocation({
    watchPosition: true,
    enableHighAccuracy: true,
  });

  useEffect(() => {
    // Start getting location immediately when component mounts
    navigator.geolocation.getCurrentPosition(() => {});
  }, []);

  const handleTrigger = async () => {
    try {
      setIsTriggering(true);
      await onTrigger({
        type: 'sos',
        message,
        location: position?.coords
          ? {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy || 0,
            }
          : undefined,
        status: 'pending',
        contactedEmergencyServices: false,
        notifiedContacts: [],
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
            Unable to get your location. Your emergency contacts will still be notified, but we won't be
            able to share your location with them.
          </p>
        </div>
      )}

      {position?.coords && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <MapView
            center={{
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }}
            zoom={15}
            markers={[
              {
                position: {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                },
                title: 'Your Location',
              },
            ]}
          />
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Message (Optional)
          </label>
          <textarea
            id="message"
            rows={3}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            placeholder="Add any details that might help emergency contacts or responders..."
            disabled={isTriggering}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isTriggering}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleTrigger}
            disabled={isTriggering}
            loading={isTriggering}
          >
            {isTriggering ? 'Sending Alert...' : 'Send Emergency Alert'}
          </Button>
        </div>
      </div>
    </div>
  );
};
