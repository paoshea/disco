import type { User } from '@/types/user';

export type EventCategory =
  | 'social'
  | 'sports'
  | 'music'
  | 'food'
  | 'arts'
  | 'tech'
  | 'outdoors'
  | 'games'
  | 'other';

export type EventType = 'social' | 'virtual' | 'hybrid';

export type EventStatus = 'scheduled' | 'cancelled' | 'completed';

export type ParticipantStatus = 'confirmed' | 'waitlisted' | 'cancelled';

export interface Location {
  address: string;
  latitude?: number;
  longitude?: number;
  placeId?: string;
}

export interface EventParticipant {
  userId: string;
  eventId: string;
  joinedAt: string;
  status: ParticipantStatus;
  checkedIn: boolean;
  checkedInAt?: string;
  user: User;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: Location;
  coverImage?: string;
  isFree: boolean;
  price?: number;
  maxParticipants?: number;
  currentParticipants: number;
  participants: EventParticipant[];
  organizerId: string;
  organizer: User;
  category: EventCategory;
  eventType: EventType;
  tags: string[];
  safetyGuidelines: string[];
  meetupInstructions?: string;
  virtualMeetingLink?: string;
  status: EventStatus;
  createdAt: string;
  updatedAt: string;
}

export interface EventFilters {
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'popularity' | 'distance';
  filters?: {
    eventType?: EventType;
    startDate?: string;
    endDate?: string;
    categories?: EventCategory[];
    isFree?: boolean;
    maxPrice?: number;
    location?: string;
    radius?: number;
    hasAvailableSpots?: boolean;
    organizerId?: string;
    participantId?: string;
    status?: EventStatus[];
  };
}

export interface CreateEventInput {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: Location;
  coverImage?: string;
  isFree: boolean;
  price?: number;
  maxParticipants?: number;
  category: EventCategory;
  eventType: EventType;
  tags: string[];
  safetyGuidelines: string[];
  meetupInstructions?: string;
  virtualMeetingLink?: string;
}
