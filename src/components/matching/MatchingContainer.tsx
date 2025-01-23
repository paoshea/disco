import React, { useState, useEffect } from 'react';
import { Match, MatchPreview } from '@/types/match';
import { MatchList } from './MatchList';
import { MatchMapView } from './MatchMapView';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/router';
import { MatchService } from '@/services/match/match.service';
import { calculateDistance } from '@/utils/location';

interface MatchingContainerProps {
  userId: string;
}

type ViewMode = 'list' | 'map';

export function MatchingContainer({ userId }: MatchingContainerProps) {
  const router = useRouter();
  const [matches, setMatches] = useState<MatchPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortBy, setSortBy] = useState<'distance' | 'score'>('score');
  const { toast } = useToast();
  const matchService = MatchService.getInstance();

  const sortMatches = (matches: MatchPreview[]): MatchPreview[] => {
    return [...matches].sort((a: MatchPreview, b: MatchPreview) => {
      if (sortBy === 'distance') {
        const distanceA = a.distance ?? Infinity;
        const distanceB = b.distance ?? Infinity;
        return distanceA - distanceB;
      }
      return b.score.total - a.score.total;
    });
  };

  useEffect(() => {
    const loadMatches = async () => {
      if (!userId) return;
      
      setLoading(true);
      try {
        const matches = await matchService.findMatches(userId);
        const previews = matches.map(match => {
          if (!match.user || !match.matchedUser) {
            throw new Error('Match missing user data');
          }

          const distance = match.location?.latitude && match.location?.longitude && 
            match.user.location?.latitude && match.user.location?.longitude
            ? calculateDistance(
                match.location.latitude,
                match.location.longitude,
                match.user.location.latitude,
                match.user.location.longitude
              )
            : 0;
          
          return {
            id: match.id,
            userId: match.userId,
            matchedUserId: match.matchedUserId,
            status: match.status,
            preview: true as const,
            name: match.user.name || 'Unknown User',
            image: match.user.image || '',
            interests: match.user.preferences?.activityTypes || [],
            distance,
            lastActive: match.user.lastLogin || match.createdAt,
            score: match.score,
            createdAt: match.createdAt,
            updatedAt: match.updatedAt,
            reportReason: null
          };
        });
        setMatches(sortMatches(previews));
        setError(null);
      } catch (error) {
        console.error('Failed to load matches:', error);
        setError('Failed to load matches. Please try again.');
        toast({
          title: 'Error',
          description: 'Failed to load matches. Please try again.',
          variant: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, [userId, toast]);

  const handleMatchClick = (matchId: string) => {
    router.push(`/matches/${matchId}`);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  const handleSortChange = (sort: 'distance' | 'score') => {
    setSortBy(sort);
    setMatches(sortMatches(matches));
  };

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4 flex justify-between items-center">
        <div className="space-x-2">
          <button
            onClick={() => handleViewModeChange('list')}
            className={`px-4 py-2 rounded ${
              viewMode === 'list' ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            List View
          </button>
          <button
            onClick={() => handleViewModeChange('map')}
            className={`px-4 py-2 rounded ${
              viewMode === 'map' ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            Map View
          </button>
        </div>
        <div className="space-x-2">
          <button
            onClick={() => handleSortChange('score')}
            className={`px-4 py-2 rounded ${
              sortBy === 'score' ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            Sort by Score
          </button>
          <button
            onClick={() => handleSortChange('distance')}
            className={`px-4 py-2 rounded ${
              sortBy === 'distance' ? 'bg-primary text-white' : 'bg-gray-200'
            }`}
          >
            Sort by Distance
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <MatchList
          matches={matches}
          loading={loading}
          onMatchClick={handleMatchClick}
        />
      ) : (
        <MatchMapView
          matches={matches}
          loading={loading}
          onMatchClick={handleMatchClick}
        />
      )}
    </div>
  );
}
