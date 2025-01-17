import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Event } from '@/types/event';
import { MapPinIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

interface EventCardProps {
  event: Event;
  onJoin: (eventId: string) => void;
  onLeave: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onJoin, onLeave }) => {
  const { user } = useAuth();
  const isUpcoming = new Date(event.startTime) > new Date();
  const isJoined = event.participants.some(p => p.userId === user?.id);

  const handleActionClick = () => {
    if (isJoined) {
      onLeave(event.id);
    } else {
      onJoin(event.id);
    }
  };

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-md">
      {event.coverImage && (
        <div className="relative h-48">
          <Image
            src={event.coverImage}
            alt={event.title}
            layout="fill"
            objectFit="cover"
            priority={false}
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
        <p className="mt-1 text-sm text-gray-500">{event.description}</p>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="mr-2 h-5 w-5 text-gray-400" />
            <span>{format(new Date(event.startTime), 'MMM d, yyyy h:mm a')}</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <MapPinIcon className="mr-2 h-5 w-5 text-gray-400" />
            <span>{event.location.address}</span>
          </div>

          <div className="flex items-center text-sm text-gray-500">
            <UserGroupIcon className="mr-2 h-5 w-5 text-gray-400" />
            <span>
              {event.currentParticipants}{' '}
              {event.maxParticipants
                ? `of ${event.maxParticipants} attending`
                : 'attending'}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm">
            {event.isFree ? (
              <span className="font-medium text-green-600">Free</span>
            ) : (
              <span className="font-medium text-gray-900">
                ${event.price?.toFixed(2)}
              </span>
            )}
          </div>
          <Button
            onClick={handleActionClick}
            variant={isJoined ? 'secondary' : 'primary'}
            disabled={!isUpcoming || Boolean(event.maxParticipants && event.currentParticipants >= event.maxParticipants)}
          >
            {isJoined ? 'Leave Event' : 'Join Event'}
          </Button>
        </div>
      </div>
    </div>
  );
};
