import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { eventService } from '@/services/event/event.service';
import type { Event } from '@/types/event';
import { useAuth } from '@/hooks/useAuth';
import {
  MapPinIcon,
  CalendarIcon,
  UserGroupIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { useCallback } from 'react';

interface EventCardProps {
  event: Event;
  onEventJoined?: (event: Event) => void;
  onEventLeft?: (event: Event) => void;
  showActions?: boolean;
}

export function EventCard({
  event,
  onEventJoined,
  onEventLeft,
  showActions = true,
}: EventCardProps) {
  const { user } = useAuth();
  const isUpcoming = new Date(event.startTime) > new Date();
  const isParticipating =
    event.participants?.some(p => p.userId === user?.id) ?? false;

  const handleJoinEvent = useCallback(async () => {
    if (!user?.id) {
      toast.error('Please sign in to join events');
      return;
    }

    try {
      const { data, success, error } = await eventService.joinEvent(
        event.id,
        user.id
      );
      if (success && data) {
        toast.success('Successfully joined event!');
        onEventJoined?.(data);
      } else {
        toast.error(error || 'Failed to join event');
      }
    } catch (err) {
      console.error('Error joining event:', err);
      toast.error('Failed to join event');
    }
  }, [event.id, user?.id, onEventJoined]);

  const handleLeaveEvent = useCallback(async () => {
    if (!user?.id) {
      toast.error('Please sign in to leave events');
      return;
    }

    try {
      const { data, success, error } = await eventService.leaveEvent(
        event.id,
        user.id
      );
      if (success && data) {
        toast.success('Successfully left event');
        onEventLeft?.(data);
      } else {
        toast.error(error || 'Failed to leave event');
      }
    } catch (err) {
      console.error('Error leaving event:', err);
      toast.error('Failed to leave event');
    }
  }, [event.id, user?.id, onEventLeft]);

  // Create non-async click handlers
  const onJoinClick = () => {
    void handleJoinEvent();
  };

  const onLeaveClick = () => {
    void handleLeaveEvent();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{event.title}</h3>
          <p className="text-gray-600">{event.description}</p>
        </div>
        {event.eventType === 'social' && (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Social
          </span>
        )}
        {event.eventType === 'virtual' && (
          <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Virtual
          </span>
        )}
        {event.eventType === 'hybrid' && (
          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
            Hybrid
          </span>
        )}
      </div>

      <div className="flex items-center space-x-4 text-sm text-gray-500">
        <div className="flex items-center">
          <MapPinIcon className="h-4 w-4 mr-1" />
          <span>
            {event.location.latitude?.toFixed(6)},{' '}
            {event.location.longitude?.toFixed(6)}
          </span>
        </div>
        <div className="flex items-center">
          <CalendarIcon className="h-4 w-4 mr-1" />
          <span>
            {format(new Date(event.startTime), 'MMM d, h:mm a')}
            {event.endTime && ` - ${format(new Date(event.endTime), 'h:mm a')}`}
          </span>
        </div>
      </div>

      <div className="flex items-center space-x-4 text-sm text-gray-500">
        <div className="flex items-center">
          <UserGroupIcon className="h-4 w-4 mr-1" />
          <span>
            {event.participants?.length ?? 0}
            {event.maxParticipants && `/${event.maxParticipants}`} participants
          </span>
        </div>
        {event.tags.length > 0 && (
          <div className="flex items-center">
            <TagIcon className="h-4 w-4 mr-1" />
            <span>{event.tags.join(', ')}</span>
          </div>
        )}
      </div>

      {showActions && isUpcoming && (
        <div className="flex justify-end space-x-2">
          {isParticipating ? (
            <button
              onClick={onLeaveClick}
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Leave Event
            </button>
          ) : (
            <button
              onClick={onJoinClick}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Join Event
            </button>
          )}
        </div>
      )}
    </div>
  );
}
