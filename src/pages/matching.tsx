import React, { useEffect, useState } from 'react';
import { Match } from '@/types/match';
import { matchService } from '@/services/api/match.service';
import { MatchList } from '@/components/matching/MatchList';
import { MatchMapView } from '@/components/matching/MatchMapView';
import { useGeolocation } from '@/hooks/useGeolocation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/ui/ErrorMessage';

export default function MatchingPage() {
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
    // Handle match click - navigate to profile or open chat
    console.log('Match clicked:', matchId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Matches</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg ${
              viewMode === 'list' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-4 py-2 rounded-lg ${
              viewMode === 'map' ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Map View
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <MatchList matches={matches} onMatchClick={handleMatchClick} />
      ) : (
        <div className="h-[calc(100vh-200px)] rounded-lg overflow-hidden">
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
        </div>
      )}
    </div>
  );
}
