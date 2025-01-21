'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MatchingContainer } from '@/components/matching/MatchingContainer';
import { locationService } from '@/services/location/location.service';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

export default function MatchingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [backgroundTracking, setBackgroundTracking] = useState(false);

  useEffect(() => {
    if (!user?.id) {
      void router.push('/login');
      return;
    }

    // Start location tracking
    locationService.startTracking(user.id, {}, backgroundTracking).catch((error) => {
      console.error('Failed to start location tracking:', error);
      toast({
        title: 'Error',
        description: 'Failed to start location tracking',
        variant: 'destructive',
      });
    });

    return () => {
      if (user?.id) {
        locationService.stopTracking(user.id);
      }
    };
  }, [user?.id, router, backgroundTracking]);

  const handleBackgroundTrackingChange = async (checked: boolean) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to change tracking settings',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Stop current tracking
      await locationService.stopTracking(user.id);
      
      // Start tracking with new background mode
      await locationService.startTracking(user.id, {}, checked);
      
      setBackgroundTracking(checked);
      
      toast({
        title: 'Background Tracking',
        description: checked 
          ? 'Background location tracking enabled'
          : 'Background location tracking disabled',
        variant: 'default'
      });
    } catch (error) {
      console.error('Error updating tracking settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to update tracking settings',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center space-x-4">
        <div className="flex flex-col space-y-2">
          <Label htmlFor="background-tracking">Background Location</Label>
          <div className="flex items-center space-x-2">
            <Switch
              id="background-tracking"
              checked={backgroundTracking}
              onChange={handleBackgroundTrackingChange}
            />
            <span className="text-sm text-muted-foreground">
              Allow location updates when the app is in the background
            </span>
          </div>
        </div>
      </div>
      <MatchingContainer />
    </div>
  );
}
