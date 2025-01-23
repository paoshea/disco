import React, { useState } from 'react';
import { Match } from '@/types/match';
import { MatchCard } from './MatchCard';
import { Loader2 } from 'lucide-react';
import { matchService } from '@/services/api/match.service';

interface MatchListProps {
  matches: Match[];
  onMatchClick: (matchId: string) => void;
  loading?: boolean;
}

export function MatchList({ matches, onMatchClick, loading = false }: MatchListProps) {
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
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900">No matches found</h3>
        <p className="mt-1 text-sm text-gray-500">
          Try adjusting your preferences to see more matches
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
}
