import React, { useEffect, useState } from 'react';
import { Match } from '@/types/match';
import { MatchCard } from './MatchCard';
import { matchService } from '@/services/api/match.service';

export const MatchList: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingMatchIds, setProcessingMatchIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const data = await matchService.getMatches();
        setMatches(data);
        setError(null);
      } catch (err) {
        setError('Failed to load matches');
        console.error('Error fetching matches:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

  const handleAcceptMatch = async (matchId: string): Promise<void> => {
    if (processingMatchIds.has(matchId)) return;
    
    setProcessingMatchIds(prev => new Set(prev).add(matchId));
    
    try {
      await matchService.acceptMatch(matchId);
      setMatches(prevMatches =>
        prevMatches.map(match =>
          match.id === matchId ? { ...match, connectionStatus: 'accepted' } : match
        )
      );
    } catch (error) {
      console.error('Failed to accept match:', error);
      setError('Failed to accept match. Please try again.');
    } finally {
      setProcessingMatchIds(prev => {
        const next = new Set(prev);
        next.delete(matchId);
        return next;
      });
    }
  };

  const handleDeclineMatch = async (matchId: string): Promise<void> => {
    if (processingMatchIds.has(matchId)) return;
    
    setProcessingMatchIds(prev => new Set(prev).add(matchId));
    
    try {
      await matchService.declineMatch(matchId);
      setMatches(prevMatches =>
        prevMatches.map(match =>
          match.id === matchId ? { ...match, connectionStatus: 'declined' } : match
        )
      );
    } catch (error) {
      console.error('Failed to decline match:', error);
      setError('Failed to decline match. Please try again.');
    } finally {
      setProcessingMatchIds(prev => {
        const next = new Set(prev);
        next.delete(matchId);
        return next;
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900">No matches yet</h3>
        <p className="mt-2 text-sm text-gray-500">Keep exploring to find your perfect match!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map(match => (
        <MatchCard
          key={match.id}
          match={match}
          onAccept={handleAcceptMatch}
          onDecline={handleDeclineMatch}
        />
      ))}
    </div>
  );
};
