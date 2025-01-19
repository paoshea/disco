import React, { useState } from 'react';
import { EventCard } from './EventCard';
import type { Event, EventType } from '@/types/event';

interface EventListProps {
  events: Event[];
  onEventJoined?: (event: Event) => void;
  onEventLeft?: (event: Event) => void;
  filterType?: EventType | 'all';
  showActions?: boolean;
}

export function EventList({
  events,
  onEventJoined,
  onEventLeft,
  filterType = 'all',
  showActions = true,
}: EventListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'participants'>('date');

  const filteredEvents = events.filter(event =>
    filterType === 'all' ? true : event.eventType === filterType
  );

  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    }
    return b.currentParticipants - a.currentParticipants;
  });

  if (sortedEvents.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No events found. Try adjusting your filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end space-x-2">
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as 'date' | 'participants')}
          className="px-3 py-2 border rounded-md text-sm"
        >
          <option value="date">Sort by Date</option>
          <option value="participants">Sort by Participants</option>
        </select>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedEvents.map(event => (
          <EventCard
            key={event.id}
            event={event}
            onEventJoined={onEventJoined}
            onEventLeft={onEventLeft}
            showActions={showActions}
          />
        ))}
      </div>
    </div>
  );
}
