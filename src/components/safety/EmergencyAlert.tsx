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
        },
        type: 'emergency',
        status: 'active',
      };

      const response = await emergencyService.createAlert(alert);
      if (response.success) {
        toast({
          title: "Emergency Alert Sent",
          description: "Help is on the way. Stay safe.",
          variant: "default"
        });
        onAlertTriggered(response.data);
      } else {
        throw new Error(response.error || 'Failed to send emergency alert');
      }
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      toast({
        title: "Error",
        description: "Failed to send emergency alert. Please try again or call emergency services directly.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700">
          Error accessing location. Please enable location services to use this feature.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleEmergencyAlert}
        disabled={isLoading || !position}
        className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-lg"
      >
        {isLoading ? 'Sending Alert...' : 'Send Emergency Alert'}
      </Button>

      {position && (
        <div className="h-64 w-full rounded-lg overflow-hidden">
          <BaseMapView
            center={{
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            }}
            zoom={15}
            markers={markers}
          />
        </div>
      )}

      <p className="text-sm text-gray-500 mt-2">
        Your current location will be shared with emergency responders when you send an alert.
      </p>
    </div>
  );
}
