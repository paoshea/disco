import React, { useState, useEffect, useCallback } from 'react';
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

      const now = new Date();
      await safetyService.createSafetyAlert(userId, {
        type: 'emergency',
        description: 'User triggered emergency alert',
        priority: 'high',
        message: 'Emergency SOS Alert',
        resolved: false,
        dismissed: false,
        updatedAt: now,
        dismissedAt: null,
        resolvedAt: null,
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
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
  }, [userId, position, onAlertTriggered, isTriggering]);

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
      <Button
        variant="danger"
        size="lg"
        className="w-full"
        onClick={() => void handleTriggerAlert()}
        disabled={isTriggering || !position?.coords}
      >
        {isTriggering ? 'Triggering Alert...' : 'Trigger Emergency Alert'}
      </Button>

      {locationError && (
        <div className="text-red-500 text-sm">
          Error getting location: {locationError.message}
        </div>
      )}

      <div className="h-[300px] rounded-lg overflow-hidden">
        <BaseMapView
          markers={markers}
          center={
            position?.coords
              ? {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude,
                }
              : undefined
          }
          zoom={15}
        />
      </div>
    </div>
  );
}
