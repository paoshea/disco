'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MatchingContainer } from '@/components/matching/MatchingContainer';
import { locationService } from '@/services/location/location.service';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';

export default function MatchingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [backgroundTracking, setBackgroundTracking] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      void router.push('/login');
      return;
    }

    // Check if background sync is supported
    const checkBackgroundSupport = async () => {
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          if ('periodicSync' in registration) {
            const status = await navigator.permissions.query({
              name: 'periodic-background-sync' as PermissionName,
            });
            setBackgroundTracking(status.state === 'granted');
          }
        } catch (error) {
          console.error('Error checking background sync support:', error);
        }
      }
    };

    checkBackgroundSupport();

    // Initialize location service with background mode
    locationService.startTracking(user.id, {}, backgroundTracking).catch((error) => {
      console.error('Error starting location tracking:', error);
      toast({
        title: 'Location Tracking Error',
        description: 'Failed to start location tracking. Please check your permissions.',
        variant: 'destructive',
      });
    });

    return () => {
      locationService.stopTracking(user.id);
    };
  }, [user?.id, router, backgroundTracking]);

  const handleBackgroundTrackingChange = async (enabled: boolean) => {
    try {
      // Stop current tracking
      await locationService.stopTracking(user.id!);
      
      // Start tracking with new background mode
      await locationService.startTracking(user.id!, {}, enabled);
      
      setBackgroundTracking(enabled);
      
      toast({
        title: 'Background Tracking',
        description: enabled 
          ? 'Background location tracking enabled'
          : 'Background location tracking disabled',
      });
    } catch (error) {
      console.error('Error toggling background tracking:', error);
      toast({
        title: 'Error',
        description: 'Failed to toggle background tracking',
        variant: 'destructive',
      });
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center space-x-4">
          <Switch
            id="background-tracking"
            checked={backgroundTracking}
            onCheckedChange={handleBackgroundTrackingChange}
          />
          <Label htmlFor="background-tracking">
            Background Location Tracking
          </Label>
        </div>
      </div>
      <MatchingContainer />
    </div>
  );
}
