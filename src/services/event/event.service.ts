import { db } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { Event, EventWithParticipants, EventParticipant } from '@/types/event';
import type { ParticipantStatus } from '@/types/participant';
import type { ServiceResponse } from '@/types/service';

interface EventCreateInput {
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  latitude?: number;
  longitude?: number;
  address?: string;
  type?: string;
  maxParticipants?: number;
  tags?: string[];
  creatorId: string;
}

interface EventUpdateInput {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  latitude?: number;
  longitude?: number;
  address?: string;
  type?: string;
  maxParticipants?: number;
  tags?: string[];
}

export type EventServiceResponse<T> = ServiceResponse<T>;

export class EventService {
  private static instance: EventService;

  private constructor() {}

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  private mapDbEventToEvent(dbEvent: any): EventWithParticipants {
    const participants = (dbEvent.participants || []).map((p: any) => ({
      id: p.id,
      userId: p.userId,
      eventId: p.eventId,
      status: p.status || 'pending',
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
      user: p.user ? {
        id: p.user.id,
        email: p.user.email,
        name: p.user.name || `${p.user.firstName} ${p.user.lastName}`.trim() || null
      } : undefined
    } as EventParticipant));

    return {
      id: dbEvent.id,
      title: dbEvent.title,
      description: dbEvent.description || null,
      type: dbEvent.type || 'social',
      eventType: dbEvent.eventType || 'social',
      creatorId: dbEvent.creatorId,
      location: {
        latitude: dbEvent.latitude,
        longitude: dbEvent.longitude
      },
      startTime: new Date(dbEvent.startTime),
      endTime: dbEvent.endTime ? new Date(dbEvent.endTime) : undefined,
      maxParticipants: dbEvent.maxParticipants || null,
      currentParticipants: participants.length,
      participants,
      tags: dbEvent.tags || [],
      createdAt: new Date(dbEvent.createdAt),
      updatedAt: new Date(dbEvent.updatedAt),
      creator: {
        id: dbEvent.creator.id,
        name: dbEvent.creator.name || `${dbEvent.creator.firstName} ${dbEvent.creator.lastName}`.trim() || null
      }
    };
  };

  async createEvent(data: EventCreateInput): Promise<EventServiceResponse<EventWithParticipants>> {
    try {
      const event = await db.event.create({
        data,
        include: {
          creator: true,
          participants: {
            include: {
              user: true
            }
          }
        }
      });

      return {
        success: true,
        data: this.mapDbEventToEvent(event)
      };
    } catch (error) {
      console.error('Error creating event:', error);
      return {
        success: false,
        error: 'Failed to create event'
      };
    }
  }

  async getEventById(id: string): Promise<EventServiceResponse<EventWithParticipants>> {
    try {
      const event = await db.event.findUnique({
        where: { id },
        include: {
          creator: true,
          participants: {
            include: {
              user: true
            }
          }
        }
      });

      if (!event) {
        return {
          success: false,
          error: 'Event not found'
        };
      }

      return {
        success: true,
        data: this.mapDbEventToEvent(event)
      };
    } catch (error) {
      console.error('Error getting event:', error);
      return {
        success: false,
        error: 'Failed to get event'
      };
    }
  }

  async updateEvent(
    id: string,
    data: EventUpdateInput
  ): Promise<EventServiceResponse<EventWithParticipants>> {
    try {
      const event = await db.event.update({
        where: { id },
        data,
        include: {
          creator: true,
          participants: {
            include: {
              user: true
            }
          }
        }
      });

      return {
        success: true,
        data: this.mapDbEventToEvent(event)
      };
    } catch (error) {
      console.error('Error updating event:', error);
      return {
        success: false,
        error: 'Failed to update event'
      };
    }
  }

  async joinEvent(
    eventId: string,
    userId: string
  ): Promise<EventServiceResponse<EventWithParticipants>> {
    try {
      const event = await db.event.update({
        where: { id: eventId },
        data: {
          participants: {
            create: {
              userId,
              joinedAt: new Date()
            }
          }
        },
        include: {
          creator: true,
          participants: {
            include: {
              user: true
            }
          }
        }
      });

      return {
        success: true,
        data: this.mapDbEventToEvent(event)
      };
    } catch (error) {
      console.error('Error joining event:', error);
      return {
        success: false,
        error: 'Failed to join event'
      };
    }
  }

  async leaveEvent(
    eventId: string,
    userId: string
  ): Promise<EventServiceResponse<EventWithParticipants>> {
    try {
      const event = await db.event.update({
        where: { id: eventId },
        data: {
          participants: {
            delete: {
              eventId_userId: {
                eventId,
                userId
              }
            }
          }
        },
        include: {
          creator: true,
          participants: {
            include: {
              user: true
            }
          }
        }
      });

      return {
        success: true,
        data: this.mapDbEventToEvent(event)
      };
    } catch (error) {
      console.error('Error leaving event:', error);
      return {
        success: false,
        error: 'Failed to leave event'
      };
    }
  }

  async getEvents(): Promise<EventServiceResponse<EventWithParticipants[]>> {
    try {
      const events = await db.event.findMany({
        include: {
          creator: true,
          participants: {
            include: {
              user: true
            }
          }
        }
      });

      return {
        success: true,
        data: events.map(event => this.mapDbEventToEvent(event))
      };
    } catch (error) {
      console.error('Error getting events:', error);
      return {
        success: false,
        error: 'Failed to get events'
      };
    }
  }
}

export const eventService = EventService.getInstance();
