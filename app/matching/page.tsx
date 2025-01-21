'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MatchingContainer } from '@/components/matching/MatchingContainer';
import { locationService } from '@/services/location/location.service';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/label';
import { createToast } from '@/hooks/use-toast';

export default function MatchingPage() {
  const router = useRouter();
  const { isLoading, user } = useAuth();
  const [backgroundTracking, setBackgroundTracking] = useState(false);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      void router.push('/signin?callbackUrl=/matching');
      return;
    }
  }, [user, router, isLoading]);

  useEffect(() => {
    if (!user) return;

    const startLocationTracking = async () => {
      try {
        await locationService.startTracking(user.id, {}, backgroundTracking);
        createToast.success({
          title: 'Location tracking started',
          description: backgroundTracking
            ? 'Your location will be tracked in the background'
            : 'Your location will be tracked while you use the app',
        });
      } catch (error) {
        console.error('Failed to start location tracking:', error);
        createToast.error({
          title: 'Location tracking failed',
          description: 'Please check your location permissions and try again',
        });
      }
    };

    void startLocationTracking();

    return () => {
      if (user) {
        void locationService.stopTracking(user.id);
      }
    };
  }, [user, backgroundTracking]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse">
          <div className="h-12 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center space-x-4">
          <Switch
            id="background-tracking"
            checked={backgroundTracking}
            onChange={setBackgroundTracking}
          />
          <Label htmlFor="background-tracking">
            Enable background location tracking
          </Label>
        </div>
      </div>

      <MatchingContainer userId={user.id} />
    </div>
  );
}
