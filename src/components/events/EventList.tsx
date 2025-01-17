import React, { useEffect, useState, useCallback } from 'react';
import { Event, EventFilters } from '@/types/event';
import { EventCard } from './EventCard';
import { eventService } from '@/services/api/event.service';
import { useAuth } from '@/hooks/useAuth';

interface EventListProps {
  filters?: EventFilters;
}

export const EventList: React.FC<EventListProps> = ({ filters }) => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await eventService.getEvents(filters);
      setEvents(data);
      setError(null);
    } catch (err) {
      setError('Failed to load events');
      console.error('Error fetching events:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void fetchEvents();
  }, [fetchEvents]);

  const handleJoinEvent = useCallback(
    async (eventId: string) => {
      if (!user?.id) return;

      try {
        const updatedEvent = await eventService.joinEvent(eventId, user.id);
        setEvents(events => events.map(event => (event.id === eventId ? updatedEvent : event)));
      } catch (error) {
        console.error('Failed to join event:', error);
      }
    },
    [user?.id]
  );

  const handleLeaveEvent = useCallback(
    async (eventId: string) => {
      if (!user?.id) return;

      try {
        const updatedEvent = await eventService.leaveEvent(eventId, user.id);
        setEvents(events => events.map(event => (event.id === eventId ? updatedEvent : event)));
      } catch (error) {
        console.error('Failed to leave event:', error);
      }
    },
    [user?.id]
  );

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

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900">No events found</h3>
        <p className="mt-2 text-sm text-gray-500">
          {filters ? 'Try adjusting your filters' : 'Check back later for new events'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map(event => (
        <EventCard
          key={event.id}
          event={event}
          onJoin={handleJoinEvent}
          onLeave={handleLeaveEvent}
        />
      ))}
    </div>
  );
};
