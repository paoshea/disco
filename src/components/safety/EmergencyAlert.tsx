import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { BaseMapView, type MapMarker } from '@/components/map/BaseMapView';
import { useGeolocation } from '@/hooks/useGeolocation';
import { safetyService } from '@/services/api/safety.service';
import type { EmergencyAlertProps, SafetyAlertNew } from '@/types/safety';
import type { Location } from '@/types/location';
import { createToast } from '@/hooks/use-toast';

export function EmergencyAlert({
  userId,
  onAlertTriggered,
}: EmergencyAlertProps) {
  const [isTriggering, setIsTriggering] = useState(false);
  const { position, error: locationError } = useGeolocation({
    enableHighAccuracy: true,
    watchPosition: true,
  });

  useEffect(() => {
    return () => {
      setIsTriggering(false);
    };
  }, []);

  const handleTriggerAlert = async () => {
    if (isTriggering || !position?.coords) return;

    setIsTriggering(true);
    try {
      const location: Location = {
        id: crypto.randomUUID(),
        userId,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp),
        privacyMode: 'precise',
        sharingEnabled: true,
      };

      const alert: SafetyAlertNew = {
        id: crypto.randomUUID(),
        userId,
        type: 'sos',
        status: 'active',
        location,
        message: 'Emergency SOS Alert',
        description: 'User triggered emergency alert',
        contacts: [],
        evidence: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await safetyService.createAlert({
        type: alert.type,
        description: alert.description,
        location: {
          id: location.id,
          userId: location.userId,
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: location.timestamp,
          privacyMode: location.privacyMode,
          sharingEnabled: location.sharingEnabled,
        },
      });

      onAlertTriggered?.(alert);

      createToast.success({
        title: 'Emergency Alert Triggered',
        description: 'Emergency contacts have been notified.',
      });
    } catch (error) {
      console.error('Error triggering alert:', error);
      createToast.error({
        title: 'Alert Failed',
        description:
          'Failed to trigger emergency alert. Please try again or contact emergency services directly.',
      });
    } finally {
      setIsTriggering(false);
    }
  };

  const markers: MapMarker[] = position?.coords
    ? [
        {
          id: 'user-location',
          position: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          title: 'Your Location',
          icon: {
            url: '/images/markers/user-location.svg',
            scaledSize: new google.maps.Size(40, 40),
            anchor: new google.maps.Point(20, 20),
          },
        },
      ]
    : [];

  return (
    <div className="space-y-4">
      <div className="h-64 relative">
        <BaseMapView
          center={{
            lat: position?.coords.latitude ?? 0,
            lng: position?.coords.longitude ?? 0,
          }}
          zoom={15}
          markers={markers}
          onMarkerClick={marker => {
            console.log('Marker clicked:', marker);
          }}
          onMarkerMouseEnter={marker => {
            console.log('Marker mouse enter:', marker);
          }}
          onMarkerMouseLeave={() => {
            console.log('Marker mouse leave');
          }}
        />
        {locationError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="text-white text-center p-4">
              Unable to access location. Please enable location services to use
              this feature.
            </p>
          </div>
        )}
      </div>

      <Button
        variant="danger"
        className="w-full"
        onClick={() => {
          void handleTriggerAlert();
        }}
        disabled={isTriggering || !position?.coords}
      >
        {isTriggering ? 'Triggering Alert...' : 'Trigger Emergency Alert'}
      </Button>

      <p className="text-sm text-muted-foreground">
        This will notify your emergency contacts and share your current location
        with them. Only use this in case of a real emergency.
      </p>
    </div>
  );
}
