import type { User } from '@/types/user';
import { z } from 'zod';

// Base event types
export interface Event {
  id: string;
  title: string;
  description: string;
  type: string;
  eventType: 'social' | 'virtual' | 'hybrid';
  creatorId: string;
  location: {
    address: string;
    latitude: number;
    longitude: number;
    placeId?: string;
  };
  startTime: string;
  endTime?: string;
  maxParticipants: number | null;
  currentParticipants: number;
  participants: Array<{
    userId: string;
    user: {
      id: string;
      name: string | null;
    };
  }>;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface EventWithParticipants extends Event {
  participants: Array<{
    userId: string;
    user: {
      id: string;
      name: string | null;
    };
  }>;
  creator: {
    id: string;
    name: string | null;
  };
}

export interface EventParticipant {
  userId: string;
  eventId: string;
  joinedAt: Date;
  status: string;
  user: {
    id: string;
    name: string | null;
  };
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
  description: z.string(),
  type: z.string(),
  eventType: z.enum(['social', 'virtual', 'hybrid']),
  location: z.object({
    address: z.string(),
    latitude: z.number(),
    longitude: z.number(),
    placeId: z.string().optional(),
  }),
  startTime: z.string().datetime(),
  endTime: z.string().datetime().optional(),
  maxParticipants: z.number().optional(),
  tags: z.array(z.string()).optional(),
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
