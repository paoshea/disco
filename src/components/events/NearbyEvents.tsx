import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { eventService } from '@/services/event/event.service';
import type { Event } from '@/types/event';
import { EventList } from './EventList';

interface NearbyEventsProps {
  radius: number;
  onEventJoined?: (event: Event) => void;
  onEventLeft?: (event: Event) => void;
}

export function NearbyEvents({
  radius,
  onEventJoined,
  onEventLeft,
}: NearbyEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchNearbyEvents();
  }, [radius]);

  const fetchNearbyEvents = async () => {
    try {
      const { data, success, error } = await eventService.getNearbyEvents({
        radius,
      });
      if (success && data) {
        setEvents(data);
      } else {
        throw new Error(error || 'Failed to fetch nearby events');
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'Failed to fetch nearby events'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEventJoined = async (updatedEvent: Event) => {
    setEvents(prevEvents =>
      prevEvents.map(e => (e.id === updatedEvent.id ? updatedEvent : e))
    );
    onEventJoined?.(updatedEvent);
  };

  const handleEventLeft = async (updatedEvent: Event) => {
    setEvents(prevEvents =>
      prevEvents.map(e => (e.id === updatedEvent.id ? updatedEvent : e))
    );
    onEventLeft?.(updatedEvent);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No nearby events found</p>
      </div>
    );
  }

  return (
    <EventList
      events={events}
      onEventJoined={handleEventJoined}
      onEventLeft={handleEventLeft}
    />
  );
}
