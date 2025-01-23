import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Match } from '@/types/match';
import { MatchList } from './MatchList';
import { MatchMapView } from './MatchMapView';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/router';
import { matchingService } from '@/services/matching/match.service';

interface MatchingContainerProps {
  userId: string;
}

export function MatchingContainer({ userId }: MatchingContainerProps) {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'distance' | 'score'>('score');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const { toast } = useToast();

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const matchService = matchingService.getInstance();
      const matches = await matchService.findMatches(userId); 
      setMatches(matches);
    } catch (err) {
      setError('Failed to load matches');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchClick = (matchId: string) => {
    router.push(`/matches/${matchId}`);
  };

  const sortedMatches = [...matches].sort((a, b) => {
    if (sortBy === 'distance') {
      return a.distance - b.distance;
    }
    return b.matchScore.total - a.matchScore.total;
  });

  if (error) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-red-800">Error</h3>
        <p className="mt-1 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto" />
        <p className="mt-2 text-gray-500">Loading matches...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Matches</h1>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'distance' | 'score')}
          className="rounded-md border-gray-300"
        >
          <option value="score">Sort by Match Score</option>
          <option value="distance">Sort by Distance</option>
        </select>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setViewMode('list')}
            className={`rounded-md px-4 py-2 ${
              viewMode === 'list'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`rounded-md px-4 py-2 ${
              viewMode === 'map'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Map View
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <MatchList
          matches={sortedMatches}
          onMatchClick={handleMatchClick}
        />
      ) : (
        <MatchMapView matches={sortedMatches} />
      )}
    </div>
  );
}
