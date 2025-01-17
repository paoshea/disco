import { User } from './user';

export interface Event {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  coverImage?: string;
  isFree: boolean;
  price?: number;
  maxParticipants?: number;
  participants: User[];
  organizer: User;
  status: 'scheduled' | 'cancelled' | 'completed';
  category: EventCategory;
  tags: string[];
  safetyGuidelines: string[];
  meetupInstructions?: string;
  virtualMeetingLink?: string;
  createdAt: string;
  updatedAt: string;
}

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

export interface EventFilters {
  categories?: EventCategory[];
  startDate?: string;
  endDate?: string;
  isFree?: boolean;
  maxPrice?: number;
  location?: string;
  radius?: number;
  hasAvailableSpots?: boolean;
}

export interface EventParticipant extends User {
  joinedAt: string;
  status: 'confirmed' | 'waitlisted' | 'cancelled';
  checkedIn: boolean;
  checkedInAt?: string;
}
