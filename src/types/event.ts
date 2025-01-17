import { User } from './user';

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
  status: EventStatus;
  category: EventCategory;
  tags: string[];
  safetyGuidelines: string[];
  meetupInstructions?: string;
  virtualMeetingLink?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EventFilters {
  categories?: EventCategory[];
  startDate?: string;
  endDate?: string;
  isFree?: boolean;
  maxPrice?: number;
  location?: string;
  radius?: number;
  hasAvailableSpots?: boolean;
  organizerId?: string;
  participantId?: string;
  status?: EventStatus[];
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
  tags: string[];
  safetyGuidelines: string[];
  meetupInstructions?: string;
  virtualMeetingLink?: string;
}
