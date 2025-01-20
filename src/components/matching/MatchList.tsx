import React, { useState } from 'react';
import { Match } from '@/types/match';
import { MatchCard } from './MatchCard';
import { Loader2 } from 'lucide-react';
import { matchService } from '@/services/api/match.service';

export interface MatchListProps {
  matches: Match[];
  onMatchClick: (matchId: string) => void;
  loading?: boolean;
}

export const MatchList: React.FC<MatchListProps> = ({
  matches,
  onMatchClick,
  loading = false,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [processingMatchIds, setProcessingMatchIds] = useState<Set<string>>(
    new Set()
  );

  const handleAcceptMatch = async (matchId: string): Promise<void> => {
    if (processingMatchIds.has(matchId)) return;

    setProcessingMatchIds(prev => new Set(prev).add(matchId));

    try {
      await matchService.acceptMatchRequest(matchId);
      setError(null);
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

  const handleRejectMatch = async (matchId: string): Promise<void> => {
    if (processingMatchIds.has(matchId)) return;

    setProcessingMatchIds(prev => new Set(prev).add(matchId));

    try {
      await matchService.declineMatchRequest(matchId);
      setError(null);
    } catch (error) {
      console.error('Failed to reject match:', error);
      setError('Failed to reject match. Please try again.');
    } finally {
      setProcessingMatchIds(prev => {
        const next = new Set(prev);
        next.delete(matchId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-center py-4" role="alert">
        {error}
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-gray-500 text-center py-8">
        No matches found. Keep exploring!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {matches.map(match => (
        <MatchCard
          key={match.id}
          match={match}
          onAccept={() => handleAcceptMatch(match.id)}
          onDecline={() => handleRejectMatch(match.id)}
          onClick={() => onMatchClick(match.id)}
          isProcessing={processingMatchIds.has(match.id)}
        />
      ))}
    </div>
  );
};
