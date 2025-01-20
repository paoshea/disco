import type { Event } from './event';

export type ParticipantStatus = 'pending' | 'accepted' | 'declined';

// Base user fields needed for participant context
export interface ParticipantUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
}

export interface Participant {
  id: string;
  userId: string;
  eventId: string;
  status: ParticipantStatus;
  createdAt: Date;
  updatedAt: Date;
  user?: ParticipantUser;
  event?: Event;
}
