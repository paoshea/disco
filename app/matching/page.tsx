'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Match } from '@/types/match';
import { matchService } from '@/services/api/match.service';
import { MatchList } from '@/components/matching/MatchList';
import { MatchMapView } from '@/components/matching/MatchMapView';
import { useGeolocation } from '@/hooks/useGeolocation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function MatchingPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [radius, setRadius] = useState<number>(0.5); // Default 0.5 km (approx 500m)
  const [timeWindow, setTimeWindow] = useState<'anytime' | 'now' | '15min' | '30min' | '1hour' | 'today'>('anytime');
  const [activityType, setActivityType] = useState<string>('any');
  const [privacyMode, setPrivacyMode] = useState<'standard' | 'strict'>('standard');
  const { position } = useGeolocation();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await matchService.getMatches(
          position?.coords
            ? {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                radius: radius, // In kilometers
                timeWindow,
                activityType,
                privacyMode,
                useBluetoothProximity: true, // Enable enhanced indoor proximity
              }
            : undefined
        );
        setMatches(response);
      } catch (err) {
        console.error('Error fetching matches:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred while fetching matches. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    void fetchMatches();
  }, [position, radius, timeWindow, activityType, privacyMode]);

  const handleMatchClick = (matchId: string) => {
    router.push(`/profile/${matchId}`);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <ErrorMessage message={error} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Find Matches</h1>
        
        {/* Matching Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white p-4 rounded-lg shadow-sm">
          {/* Radius Control */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Radius
            </label>
            <select
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value={0.1}>100m</option>
              <option value={0.3}>300m</option>
              <option value={0.5}>500m</option>
              <option value={1}>1km</option>
              <option value={1.6}>1 mile</option>
            </select>
          </div>

          {/* Time Window */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Window
            </label>
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value as 'anytime' | 'now' | '15min' | '30min' | '1hour' | 'today')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="anytime">Anytime</option>
              <option value="now">Right Now</option>
              <option value="15min">Next 15 minutes</option>
              <option value="30min">Next 30 minutes</option>
              <option value="1hour">Next hour</option>
              <option value="today">Today</option>
            </select>
          </div>

          {/* Activity Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Activity
            </label>
            <select
              value={activityType}
              onChange={(e) => setActivityType(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="any">Any Activity</option>
              <option value="coffee">Coffee</option>
              <option value="lunch">Lunch</option>
              <option value="networking">Professional Networking</option>
              <option value="workout">Workout</option>
              <option value="study">Study Session</option>
            </select>
          </div>

          {/* Privacy Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Privacy Mode
            </label>
            <select
              value={privacyMode}
              onChange={(e) => setPrivacyMode(e.target.value as 'standard' | 'strict')}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value="standard">Standard Privacy</option>
              <option value="strict">Enhanced Privacy</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="mt-4 flex justify-end space-x-2">
          <button
            className={`rounded px-4 py-2 ${
              viewMode === 'list'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
          <button
            className={`rounded px-4 py-2 ${
              viewMode === 'map'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
            onClick={() => setViewMode('map')}
          >
            Map View
          </button>
        </div>

        {viewMode === 'list' ? (
          <MatchList matches={matches} onMatchClick={handleMatchClick} />
        ) : (
          <MatchMapView
            matches={matches}
            onMarkerClick={handleMatchClick}
            center={
              position?.coords
                ? {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                  }
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
}
