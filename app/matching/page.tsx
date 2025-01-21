'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MatchingContainer } from '@/components/matching/MatchingContainer';
import { locationService } from '@/services/location/location.service';
import { Switch } from '@/components/ui/Switch';
import { Label } from '@/components/ui/label';
import { createToast } from '@/hooks/use-toast';

export default function MatchingPage() {
  const router = useRouter();
  const { status, data: session } = useSession();
  const [backgroundTracking, setBackgroundTracking] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session?.user?.id) {
      void router.push('/login');
      return;
    }
  }, [session?.user?.id, router, status]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const startLocationTracking = async () => {
      try {
        await locationService.startTracking(
          session.user.id,
          {},
          backgroundTracking
        );
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
      if (session?.user?.id) {
        void locationService.stopTracking(session.user.id);
      }
    };
  }, [session?.user?.id, backgroundTracking]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse">
          <div className="h-12 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!session?.user?.id) {
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

      <MatchingContainer userId={session.user.id} />
    </div>
  );
}
