import React from 'react';
import Image from 'next/image';
import { format } from 'date-fns';
import { Event } from '@/types/event';
import { MapPinIcon, CalendarIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface EventCardProps {
  event: Event;
  onJoin: (eventId: string) => void;
  onLeave: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onJoin, onLeave }) => {
  const isUpcoming = new Date(event.startTime) > new Date();
  const isJoined = event.participants.some(p => p.id === 'currentUserId'); // Replace with actual user ID

  const handleActionClick = () => {
    if (isJoined) {
      onLeave(event.id);
    } else {
      onJoin(event.id);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {event.coverImage && (
        <div className="relative h-48">
          <Image
            src={event.coverImage}
            alt={event.title}
            layout="fill"
            objectFit="cover"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
        
        <div className="mt-2 space-y-2">
          <div className="flex items-center text-sm text-gray-500">
            <CalendarIcon className="h-5 w-5 mr-2 text-gray-400" />
            <span>
              {format(new Date(event.startTime), 'MMM d, yyyy h:mm a')}
            </span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <MapPinIcon className="h-5 w-5 mr-2 text-gray-400" />
            <span>{event.location}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500">
            <UserGroupIcon className="h-5 w-5 mr-2 text-gray-400" />
            <span>{event.participants.length} attending</span>
          </div>
        </div>

        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
          {event.description}
        </p>

        <div className="mt-4 flex items-center justify-between">
          <span className={`text-sm font-medium ${
            event.isFree ? 'text-green-600' : 'text-primary-600'
          }`}>
            {event.isFree ? 'Free' : `$${event.price}`}
          </span>

          <button
            onClick={handleActionClick}
            disabled={!isUpcoming}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              isJoined
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-primary-500 text-white hover:bg-primary-600'
            } ${!isUpcoming && 'opacity-50 cursor-not-allowed'}`}
          >
            {isJoined ? 'Leave Event' : 'Join Event'}
          </button>
        </div>

        {!isUpcoming && (
          <p className="mt-2 text-sm text-red-600">
            This event has already taken place
          </p>
        )}
      </div>
    </div>
  );
};
