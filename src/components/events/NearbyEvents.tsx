import { useEffect, useState, useCallback } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { eventService } from '@/services/event/event.service';
import type { Event } from '@/types/event';
import { EventCard } from './EventCard';
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

  const fetchNearbyEvents = useCallback(async () => {
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
  }, [position, radius]);

  useEffect(() => {
    void fetchNearbyEvents();
  }, [fetchNearbyEvents]);

  if (loading) {
    return <div>Loading nearby events...</div>;
  }

  if (!position) {
    return <div>Please enable location services to see nearby events.</div>;
  }

  if (events.length === 0) {
    return <div>No events found nearby.</div>;
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {events.map(event => (
        <EventCard
          key={event.id}
          event={event}
          onEventJoined={onEventJoined}
          onEventLeft={onEventLeft}
          showActions={true}
        />
      ))}
    </div>
  );
}
