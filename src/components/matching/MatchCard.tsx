import React from 'react';
import Image from 'next/image';
import { MatchPreview } from '@/types/match';
import { Button } from '@/components/forms';

interface MatchCardProps {
  match: MatchPreview;
  onAccept: (matchId: string) => Promise<void>;
  onDecline: (matchId: string) => Promise<void>;
  onClick?: () => void;
  isProcessing?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onAccept,
  onDecline,
  onClick,
  isProcessing = false,
}) => {
  const handleAccept = async () => {
    try {
      await onAccept(match.id);
    } catch (error) {
      console.error('Error accepting match:', error);
    }
  };

  const handleDecline = async () => {
    try {
      await onDecline(match.id);
    } catch (error) {
      console.error('Error declining match:', error);
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
      onClick={onClick}
    >
      <div className="relative h-64">
        {match.profileImage ? (
          <Image
            src={match.profileImage}
            alt={match.name}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
        ) : (
          <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-4xl">No Image</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{match.name}</h3>
        <p className="mt-1 text-sm text-gray-500">{match.distance}km away</p>

        <div className="mt-2">
          <h4 className="text-sm font-medium text-gray-700">Common Interests</h4>
          <div className="flex flex-wrap gap-2 mt-1">
            {match.commonInterests.map(interest => (
              <span
                key={interest}
                className="px-2 py-1 text-sm bg-primary-100 text-primary-800 rounded-full"
              >
                {interest}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 space-x-2">
          <Button
            onClick={e => {
              e.stopPropagation();
              void handleDecline();
            }}
            variant="outline"
            size="sm"
            disabled={isProcessing}
          >
            Decline
          </Button>
          <Button
            onClick={e => {
              e.stopPropagation();
              void handleAccept();
            }}
            variant="primary"
            size="sm"
            disabled={isProcessing}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
};
