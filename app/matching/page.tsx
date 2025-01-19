'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { Match } from '@/types/match';
import { matchService } from '@/services/api/match.service';
import { MatchList } from '@/components/matching/MatchList';
import { MatchMapView } from '@/components/matching/MatchMapView';
import { useGeolocation } from '@/hooks/useGeolocation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';
import LocationPrivacy from '@/components/location/LocationPrivacy';
import { NearbyEvents } from '@/components/events/NearbyEvents';
import { useToast } from '@/hooks/useToast';
import type { Event } from '@/types/event';
import type { LocationPrivacyMode } from '@/types/location';

export default function MatchingPage() {
  const { data: session } = useSession();
  const toast = useToast();
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [radius, setRadius] = useState<number>(0.5); // Default 0.5 km (approx 500m)
  const [timeWindow, setTimeWindow] = useState<
    'anytime' | 'now' | '15min' | '30min' | '1hour' | 'today'
  >('anytime');
  const [activityType, setActivityType] = useState<string>('any');
  const [privacyMode, setPrivacyMode] = useState<LocationPrivacyMode>('precise');
  const { position } = useGeolocation();

  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const matches = await matchService.getMatches(
        position?.coords
          ? {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              radius,
              timeWindow,
              activityType: activityType === 'any' ? undefined : activityType,
              privacyMode: privacyMode === 'precise' ? 'standard' : 'strict',
            }
          : undefined
      );
      setMatches(matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      setError('Failed to fetch matches');
    } finally {
      setLoading(false);
    }
  }, [position, radius, timeWindow, activityType, privacyMode]);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }
    void fetchMatches();
  }, [session, router, fetchMatches]);

  const handleEventJoin = useCallback(
    (event: Event) => {
      toast.success(`Successfully joined ${event.title}`);
      void fetchMatches();
    },
    [fetchMatches, toast]
  );

  const handleEventLeave = useCallback(
    (event: Event) => {
      toast.success(`Successfully left ${event.title}`);
      void fetchMatches();
    },
    [fetchMatches, toast]
  );

  const handleRadiusChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRadius = parseFloat(event.target.value);
    setRadius(newRadius);
  }, []);

  const handleTimeWindowChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setTimeWindow(event.target.value as typeof timeWindow);
  }, []);

  const handleActivityTypeChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    setActivityType(event.target.value);
  }, []);

  if (!session) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <div className="flex flex-col space-y-4 p-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Nearby Matches</h1>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 rounded ${
                  viewMode === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-1 rounded ${
                  viewMode === 'map'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                Map
              </button>
            </div>
          </div>

          <LocationPrivacy
            onPrivacyChange={(mode: LocationPrivacyMode) => {
              setPrivacyMode(mode);
            }}
            onSharingChange={(enabled: boolean) => {
              // Handle sharing change if needed
            }}
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-bold">Nearby Events</h2>
        <NearbyEvents
          radius={radius}
          onEventJoined={handleEventJoin}
          onEventLeft={handleEventLeave}
        />
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Matches</h2>
          <div className="flex space-x-4">
            <select
              value={radius}
              onChange={handleRadiusChange}
              className="rounded-lg border-gray-300"
            >
              <option value={0.5}>Within 500m</option>
              <option value={1}>Within 1km</option>
              <option value={2}>Within 2km</option>
              <option value={5}>Within 5km</option>
            </select>

            <select
              value={timeWindow}
              onChange={handleTimeWindowChange}
              className="rounded-lg border-gray-300"
            >
              <option value="anytime">Any Time</option>
              <option value="now">Right Now</option>
              <option value="15min">Next 15 Minutes</option>
              <option value="30min">Next 30 Minutes</option>
              <option value="1hour">Next Hour</option>
              <option value="today">Today</option>
            </select>

            <select
              value={activityType}
              onChange={handleActivityTypeChange}
              className="rounded-lg border-gray-300"
            >
              <option value="any">Any Activity</option>
              <option value="social">Social</option>
              <option value="exercise">Exercise</option>
              <option value="study">Study</option>
              <option value="hobby">Hobby</option>
            </select>
          </div>
        </div>

        {viewMode === 'list' ? (
          <MatchList
            matches={matches}
            onMatchClick={(matchId) => {
              router.push(`/matches/${matchId}`);
            }}
          />
        ) : (
          <MatchMapView
            matches={matches}
            onMarkerClick={(matchId) => {
              router.push(`/matches/${matchId}`);
            }}
          />
        )}
      </div>
    </div>
  );
}
