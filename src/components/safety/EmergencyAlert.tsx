import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  BaseMapView,
  type MapMarker,
  type BaseMapViewProps,
} from '@/components/map/BaseMapView';
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

  const handleTriggerAlert = useCallback(async () => {
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

      const response = await safetyService.createAlert({
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
  }, [userId, position, isTriggering, onAlertTriggered]);

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

  const handleMarkerClick = useCallback((marker: MapMarker) => {
    // Handle marker click if needed
  }, []);

  const handleMarkerMouseEnter = useCallback((marker: MapMarker) => {
    // Handle marker mouse enter if needed
  }, []);

  const handleMarkerMouseLeave = useCallback(() => {
    // Handle marker mouse leave if needed
  }, []);

  return (
    <div className="space-y-4">
      <div className="h-64 relative">
        <BaseMapView
          center={
            position?.coords
              ? {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                }
              : { lat: 0, lng: 0 }
          }
          zoom={15}
          markers={markers}
          onMarkerClick={handleMarkerClick}
          onMarkerMouseEnter={handleMarkerMouseEnter}
          onMarkerMouseLeave={handleMarkerMouseLeave}
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
        onClick={handleTriggerAlert}
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
