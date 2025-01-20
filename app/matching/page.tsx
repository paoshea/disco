'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { MatchingContainer } from '@/components/matching/MatchingContainer';
import { LocationService } from '@/services/location/location.service';

export default function MatchingPage() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) {
      void router.push('/login');
      return;
    }

    // Initialize location service
    const locationService = LocationService.getInstance();
    locationService.startTracking(user.id).catch(console.error);

    return () => {
      locationService.stopTracking(user.id);
    };
  }, [user?.id, router]);

  if (!user) return null;

  return <MatchingContainer />;
}
