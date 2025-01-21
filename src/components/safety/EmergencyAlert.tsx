import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BaseMapView } from '@/components/map/BaseMapView';
import { useGeolocation } from '@/hooks/useGeolocation';
import { safetyService } from '@/services/api/safety.service';
import type { EmergencyAlertProps, SafetyAlertNew } from '@/types/safety';
import { createToast } from '@/hooks/use-toast';
import type { MapMarker } from '@/types/map';
import type { Location, LocationState } from '@/types/location';

export function EmergencyAlert({ userId, onAlertTriggered }: EmergencyAlertProps) {
  const [isTriggering, setIsTriggering] = useState(false);
  const { location, error: locationError } = useGeolocation() as LocationState;

  const handleTriggerAlert = useCallback(async () => {
    if (isTriggering || !location) return;

    setIsTriggering(true);
    try {
      const alert: Partial<SafetyAlertNew> = {
        userId,
        type: 'sos',
        status: 'active',
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          timestamp: new Date()
        },
        message: 'Emergency SOS Alert',
        contacts: [],
        description: 'User triggered emergency alert',
        evidence: []
      };

      const response = await safetyService.createAlert(alert);
      onAlertTriggered?.(response);

      createToast.success({
        title: 'Emergency Alert Triggered',
        description: 'Emergency contacts have been notified.',
      });
    } catch (error) {
      console.error('Error triggering alert:', error);
      createToast.error({
        title: 'Alert Failed',
        description: 'Failed to trigger emergency alert. Please try again or contact emergency services directly.',
      });
    } finally {
      setIsTriggering(false);
    }
  }, [userId, location, isTriggering, onAlertTriggered]);

  const markers: MapMarker[] = location ? [{
    id: 'user-location',
    position: {
      lat: location.latitude,
      lng: location.longitude
    },
    title: 'Your Location',
    icon: {
      url: '/images/markers/user-location.svg',
      scaledSize: { width: 40, height: 40 },
      anchor: { x: 20, y: 20 }
    }
  }] : [];

  return (
    <div className="space-y-4">
      <div className="h-64 relative">
        <BaseMapView
          center={location ? { lat: location.latitude, lng: location.longitude } : undefined}
          zoom={15}
          markers={markers}
        />
        {locationError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <p className="text-white text-center p-4">
              Unable to access location. Please enable location services to use this feature.
            </p>
          </div>
        )}
      </div>

      <Button
        variant="danger"
        className="w-full"
        onClick={handleTriggerAlert}
        disabled={isTriggering || !location}
      >
        {isTriggering ? 'Triggering Alert...' : 'Trigger Emergency Alert'}
      </Button>

      <p className="text-sm text-muted-foreground">
        This will notify your emergency contacts and share your current location with them.
        Only use this in case of a real emergency.
      </p>
    </div>
  );
}
