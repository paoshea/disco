import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchPreview } from '@/types/match';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { MapPin } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface MatchCardProps {
  match: MatchPreview;
  onAccept: (matchId: string) => void;
  onDecline: (matchId: string) => void;
  onMatchClick?: (matchId: string) => void;
  isProcessing: boolean;
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onAccept,
  onDecline,
  onMatchClick,
  isProcessing,
}) => {
  const handleMatchAction = (action: 'accept' | 'decline') => {
    if (action === 'accept') {
      onAccept(match.id);
    } else if (action === 'decline') {
      onDecline(match.id);
    }
  };

  return (
    <AnimatePresence initial={false} mode="wait">
      <motion.div
        key={match.id}
        className="relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {match.image && (
          <div className="aspect-w-3 aspect-h-4">
            <Image
              src={match.image}
              alt={match.name}
              layout="fill"
              objectFit="cover"
            />
          </div>
        )}
        <div className="p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{match.name}</h3>
              {match.distance !== null && (
                <p className="text-sm text-gray-500">
                  {Math.round(match.distance)}km away
                </p>
              )}
            </div>
            <div className="text-sm text-gray-500">
              {match.lastActive &&
                `Active ${formatDistanceToNow(new Date(match.lastActive))} ago`}
            </div>
          </div>

          {match.interests && match.interests.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {match.interests.map((interest, index) => (
                <Badge key={index} variant="secondary">
                  {interest}
                </Badge>
              ))}
            </div>
          )}

          <div className="mt-4 flex justify-between space-x-2">
            <Button
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                handleMatchAction('decline');
              }}
              disabled={isProcessing}
            >
              Pass
            </Button>
            <Button
              variant="secondary"
              onClick={(e) => {
                e.stopPropagation();
                handleMatchAction('accept');
              }}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Connect'
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
