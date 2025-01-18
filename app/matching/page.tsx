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
                radius: 50, // Default radius in kilometers
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
  }, [position]);

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
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Find Matches</h1>
        <div className="flex space-x-2">
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
  );
}
