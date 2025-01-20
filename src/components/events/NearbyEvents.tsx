import { useEffect, useState, useCallback } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { eventService } from '@/services/event/event.service';
import type { EventWithParticipants } from '@/types/event';
import { EventCard } from './EventCard';
import { toast } from 'react-hot-toast';

type DistanceUnit = 'km' | 'm';

interface NearbyEventsProps {
  radius: number;
  unit?: DistanceUnit;
  onEventJoined?: (event: EventWithParticipants) => void;
  onEventLeft?: (event: EventWithParticipants) => void;
}

interface EventWithDistance extends EventWithParticipants {
  distance: number;
}

export function NearbyEvents({
  radius = 500,
  unit = 'm',
  onEventJoined,
  onEventLeft,
}: NearbyEventsProps) {
  const [events, setEvents] = useState<EventWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const { position } = useGeolocation();

  const fetchNearbyEvents = useCallback(async () => {
    if (!position) return;

    try {
      const { data, success, error } = await eventService.getNearbyEvents(
        position.coords.latitude,
        position.coords.longitude,
        radius,
        unit
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
  }, [position, radius, unit]);

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
    <div className="space-y-4">
      {events.map(event => (
        <div key={event.id} className="relative">
          <EventCard
            event={event}
            onEventJoined={onEventJoined}
            onEventLeft={onEventLeft}
          />
          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-sm">
            {event.distance.toFixed(1)} {unit}
          </div>
        </div>
      ))}
    </div>
  );
}
