import type { Event } from './event';

export type ParticipantStatus = 'pending' | 'accepted' | 'declined';

// Simplified user type for participants to avoid circular dependencies
export interface ParticipantUser {
  id: string;
  email: string;
  name: string | null;
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
