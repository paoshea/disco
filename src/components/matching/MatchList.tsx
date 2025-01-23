import React from 'react';
import { MatchCard } from './MatchCard';
import { MatchPreview } from '@/types/match';
import { MatchService } from '@/services/match/match.service';

interface MatchListProps {
  matches: MatchPreview[];
  loading: boolean;
  onMatchClick: (matchId: string) => void;
}

export function MatchList({ matches, loading, onMatchClick }: MatchListProps) {
  const matchService = MatchService.getInstance();

  const handleAcceptMatch = async (matchId: string) => {
    try {
      await matchService.acceptMatch(matchId);
    } catch (error) {
      console.error('Failed to accept match:', error);
    }
  };

  const handleDeclineMatch = async (matchId: string) => {
    try {
      await matchService.rejectMatch(matchId);
    } catch (error) {
      console.error('Failed to reject match:', error);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-64 bg-gray-200 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No matches found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          onAccept={handleAcceptMatch}
          onDecline={handleDeclineMatch}
          onMatchClick={onMatchClick}
          isProcessing={false}
        />
      ))}
    </div>
  );
}
