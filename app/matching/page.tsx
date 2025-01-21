'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MatchingContainer } from '@/components/matching/MatchingContainer';
import { locationService } from '@/services/location/location.service';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { ToastAction } from '@/components/ui/toast';

export default function MatchingPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [backgroundTracking, setBackgroundTracking] = useState(false);

  useEffect(() => {
    if (!isLoading && !user?.id) {
      void router.push('/login');
      return;
    }
  }, [user?.id, router, isLoading]);

  useEffect(() => {
    if (!user?.id) return;

    const startLocationTracking = async () => {
      try {
        await locationService.startTracking(user.id, {}, backgroundTracking);
        toast.success('Location tracking started', {
          description: backgroundTracking
            ? 'Your location will be tracked in the background'
            : 'Your location will be tracked while you use the app',
          action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
        });
      } catch (error) {
        console.error('Failed to start location tracking:', error);
        toast.error('Location tracking failed', {
          description: 'Please check your location permissions and try again',
          action: <ToastAction altText="Retry">Retry</ToastAction>,
        });
      }
    };

    void startLocationTracking();

    return () => {
      if (user?.id) {
        void locationService.stopTracking(user.id);
      }
    };
  }, [user?.id, backgroundTracking]);

  const handleBackgroundTrackingChange = async (enabled: boolean) => {
    setBackgroundTracking(enabled);
    if (!user?.id) return;

    try {
      if (enabled) {
        await locationService.startTracking(user.id, {}, true);
        toast.success('Background tracking enabled', {
          description: 'Your location will be tracked in the background',
          action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
        });
      } else {
        await locationService.stopTracking(user.id);
        toast.success('Background tracking disabled', {
          description: 'Your location will only be tracked while using the app',
          action: <ToastAction altText="Dismiss">Dismiss</ToastAction>,
        });
      }
    } catch (error) {
      console.error('Failed to toggle background tracking:', error);
      toast.error('Failed to update tracking settings', {
        description: 'Please try again',
        action: <ToastAction altText="Retry">Retry</ToastAction>,
      });
    }
  };

  if (isLoading || !user?.id) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex items-center space-x-2">
        <Switch
          id="background-tracking"
          checked={backgroundTracking}
          onChange={handleBackgroundTrackingChange}
        />
        <Label htmlFor="background-tracking">Enable background tracking</Label>
      </div>
      <MatchingContainer />
    </div>
  );
}
