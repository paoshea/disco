import React from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { MatchPreview } from '@/types/match';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatDistanceToNow } from 'date-fns';
import { MapPin } from 'lucide-react';

interface MatchCardProps {
  match: MatchPreview;
  onAccept: (matchId: string) => Promise<void>;
  onDecline: (matchId: string) => Promise<void>;
  onClick?: () => void;
  isProcessing?: boolean;
  exitDirection?: 'left' | 'right';
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onAccept,
  onDecline,
  onClick,
  isProcessing = false,
  exitDirection,
}) => {
  const handleMatchAction = async (action: 'accept' | 'decline') => {
    try {
      if (action === 'accept') {
        await onAccept(match.id);
      } else if (action === 'decline') {
        await onDecline(match.id);
      }
    } catch (error) {
      console.error('Error handling match action:', error);
    }
  };

  const cardVariants = {
    enter: (direction: 'left' | 'right') => ({
      x: direction === 'right' ? 1000 : -1000,
      opacity: 0,
      scale: 0.5,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      scale: 1,
    },
    exit: (direction: 'left' | 'right') => ({
      zIndex: 0,
      x: direction === 'right' ? 1000 : -1000,
      opacity: 0,
      scale: 0.5,
    }),
  };

  return (
    <AnimatePresence initial={false} mode="wait" custom={exitDirection}>
      <motion.div
        key={match.id}
        className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
        initial="enter"
        animate="center"
        exit="exit"
        variants={cardVariants}
        custom={exitDirection}
        transition={{
          x: { type: 'spring', stiffness: 300, damping: 30 },
          opacity: { duration: 0.2 },
        }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={1}
        onDragEnd={(e, { offset, velocity }) => {
          const swipe = swipePower(offset.x, velocity.x);

          if (swipe < -swipeConfidenceThreshold) {
            void handleMatchAction('decline');
          } else if (swipe > swipeConfidenceThreshold) {
            void handleMatchAction('accept');
          }
        }}
      >
        <div className="relative h-64" onClick={onClick}>
          {match.profileImage ? (
            <Image
              src={match.profileImage}
              alt={match.name}
              layout="fill"
              objectFit="cover"
              className="rounded-t-lg"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No photo</span>
            </div>
          )}
          <motion.div
            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-xl font-semibold text-white mb-1">
              {match.name}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <MapPin className="h-4 w-4" />
              <span>
                {match.distance !== null
                  ? `${match.distance}km away`
                  : 'Distance unknown'}
              </span>
            </div>
            <p className="text-white/80 text-sm">
              Active{' '}
              {formatDistanceToNow(new Date(match.lastActive), {
                addSuffix: true,
              })}
            </p>
          </motion.div>
        </div>

        <motion.div
          className="p-4 space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex flex-wrap gap-2">
            {match.commonInterests.map(interest => (
              <Badge key={interest} variant="secondary">
                {interest}
              </Badge>
            ))}
          </div>

          <div className="flex justify-between gap-4">
            <Button
              variant="outline"
              onClick={() => {
                void handleMatchAction('decline');
              }}
              disabled={isProcessing}
            >
              Decline
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                void handleMatchAction('accept');
              }}
              disabled={isProcessing}
            >
              Accept
            </Button>
          </div>
        </motion.div>

        {isProcessing && (
          <motion.div
            className="absolute inset-0 bg-black/50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
