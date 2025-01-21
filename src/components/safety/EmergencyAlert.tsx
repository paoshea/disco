import React, { useState, useMemo } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { emergencyService } from '@/services/api/emergency.service';
import type { EmergencyAlertProps, SafetyAlertNew } from '@/types/safety';
import type { MapMarker } from '@/types/map';
import { BaseMapView } from '@/components/map/BaseMapView';
import { Button } from '@/components/ui/Button';
import { toast } from '@/hooks/use-toast';

export function EmergencyAlert({
  userId,
  onAlertTriggered,
}: EmergencyAlertProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { position, error } = useGeolocation();

  const markers = useMemo<MapMarker[]>(() => {
    if (!position) return [];
    
    return [{
      id: 'current-location',
      position: {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      },
      icon: {
        url: '/images/current-location-marker.png',
        scaledSize: new google.maps.Size(32, 32),
        anchor: new google.maps.Point(16, 16),
      },
      title: 'Your Location',
    }];
  }, [position]);

  const handleEmergencyAlert = async () => {
    if (!position) {
      toast({
        title: "Location Required",
        description: "Please enable location services to use this feature",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const alert: SafetyAlertNew = {
        userId,
        location: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date().toISOString(),
        },
        type: 'emergency',
        status: 'active',
      };

      const response = await emergencyService.createAlert(alert);
      
      toast({
        title: "Emergency Alert Sent",
        description: "Emergency contacts have been notified of your location",
        variant: "success"
      });

      if (onAlertTriggered) {
        onAlertTriggered(response);
      }
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      toast({
        title: "Error",
        description: "Failed to send emergency alert. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="h-64 w-full rounded-lg overflow-hidden">
        <BaseMapView
          center={position ? {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          } : undefined}
          zoom={15}
          markers={markers}
        />
      </div>

      <Button
        onClick={handleEmergencyAlert}
        disabled={isLoading || !position}
        className="w-full bg-red-600 hover:bg-red-700 text-white"
      >
        {isLoading ? 'Sending Alert...' : 'Send Emergency Alert'}
      </Button>

      {error && (
        <p className="text-sm text-red-600">
          Error: {error.message}
        </p>
      )}
    </div>
  );
}
