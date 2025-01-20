import type { Coordinates } from './location';
import type { ParticipantStatus as ParticipantStatusType } from './participant';
import { z } from 'zod';

// Simplified participant type for events
export interface EventParticipant {
  id: string;
  userId: string;
  eventId: string;
  status: ParticipantStatusType;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    email: string;
    name: string | null;
  };
}

// Base event types
export interface Event {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  eventType: 'social' | 'virtual' | 'hybrid';
  creatorId: string;
  creator: {
    id: string;
    name: string | null;
  };
  location: Coordinates;
  startTime: Date;
  endTime?: Date;
  maxParticipants: number | null;
  currentParticipants: number;
  participants?: EventParticipant[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EventWithParticipants extends Event {
  participants: EventParticipant[];
}

// Event category and type enums
export type EventCategory =
  | 'social'
  | 'sports'
  | 'education'
  | 'entertainment'
  | 'food'
  | 'music'
  | 'arts'
  | 'tech'
  | 'outdoors'
  | 'games'
  | 'other';

export type EventType = 'social' | 'virtual' | 'hybrid';

// Event status
export type EventStatus = 'scheduled' | 'cancelled' | 'completed';

// Participant status
export type ParticipantStatus = 'confirmed' | 'waitlisted' | 'cancelled';

// Location type
export interface Location {
  address: string;
  latitude: number;
  longitude: number;
  placeId?: string;
}

// Validation schemas
export const actionSchema = z.object({
  action: z.enum(['join', 'leave']),
});

export const createEventSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  type: z.string(),
  eventType: z.enum(['social', 'virtual', 'hybrid']),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  startTime: z.date(),
  endTime: z.date().optional(),
  maxParticipants: z.number().optional(),
  tags: z.array(z.string()).optional(),
});

export const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  startTime: z.date(),
  endTime: z.date(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;

// Event search params
export interface EventSearchParams {
  location?: {
    latitude: number;
    longitude: number;
  };
  radius?: number;
  type?: string;
  startTime?: string;
  endTime?: string;
}

// Event filters
export interface EventFilters {
  page?: number;
  limit?: number;
  search?: string;
  sort?: {
    field: string;
    order: 'asc' | 'desc';
  };
  filter?: {
    category?: EventCategory[];
    eventType?: EventType[];
    startDate?: string;
    endDate?: string;
    location?: string;
    radius?: number;
    isFree?: boolean;
    maxPrice?: number;
    status?: EventStatus[];
    hasAvailableSpots?: boolean;
  };
}
