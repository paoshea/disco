import { useEffect, useState } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { eventService } from '@/services/event/event.service';
import type { Event } from '@/types/event';
import { EventList } from './EventList';
import { toast } from 'react-hot-toast';

interface NearbyEventsProps {
  radius?: number; // in meters
  onEventJoined?: (event: Event) => void;
  onEventLeft?: (event: Event) => void;
}

export function NearbyEvents({
  radius = 500,
  onEventJoined,
  onEventLeft,
}: NearbyEventsProps) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { position } = useGeolocation();

  useEffect(() => {
    async function fetchNearbyEvents() {
      if (!position) return;

      try {
        const { data, success, error } = await eventService.getNearbyEvents(
          position.coords.latitude,
          position.coords.longitude,
          radius
        );

        if (success && data) {
          setEvents(data);
        } else if (error) {
          toast.error(error);
        }
      } catch (err) {
        console.error('Error fetching nearby events:', err);
        toast.error('Failed to fetch nearby events');
      } finally {
        setLoading(false);
      }
    }

    fetchNearbyEvents();
  }, [position, radius]);

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

  if (!position) {
    return <div>Please enable location services to see nearby events.</div>;
  }

  if (events.length === 0) {
    return <div>No events found nearby.</div>;
  }

  return (
    <EventList
      events={events}
      onEventJoined={handleEventJoined}
      onEventLeft={handleEventLeft}
    />
  );
}
