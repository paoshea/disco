import type { Event } from './event';
import type { User } from './user';

export type ParticipantStatus = 'pending' | 'accepted' | 'declined';

export interface Participant {
  id: string;
  userId: string;
  eventId: string;
  status: ParticipantStatus;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  event?: Event;
}
