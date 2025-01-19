import { PrismaClient } from '@prisma/client';
import type { Event, Location } from '@/types/event';

const prisma = new PrismaClient();

interface EventServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface EventQueryParams {
  radius: number;
  types?: string[];
  startTime?: string;
  endTime?: string;
}

class EventService {
  private static instance: EventService;
  private constructor() {}

  static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  private mapPrismaEventToEvent(prismaEvent: any): Event {
    return {
      ...prismaEvent,
      location: prismaEvent.location || {
        address: '',
        latitude: 0,
        longitude: 0,
      },
      isFree: prismaEvent.price === 0 || prismaEvent.price === null,
      currentParticipants: prismaEvent.participants?.length || 0,
      organizerId: prismaEvent.creatorId,
      organizer: prismaEvent.creator,
      participants:
        prismaEvent.participants?.map((p: any) => ({
          userId: p.userId,
          eventId: p.eventId,
          joinedAt: p.joinedAt.toISOString(),
          status: p.status || 'confirmed',
          user: p.user,
        })) || [],
      category: prismaEvent.category || 'other',
      eventType: prismaEvent.eventType || 'social',
      tags: prismaEvent.tags || [],
      safetyGuidelines: prismaEvent.safetyGuidelines || [],
      status: prismaEvent.status || 'scheduled',
      createdAt: prismaEvent.createdAt.toISOString(),
      updatedAt: prismaEvent.updatedAt.toISOString(),
    };
  }

  async getNearbyEvents(
    params: EventQueryParams
  ): Promise<EventServiceResponse<Event[]>> {
    try {
      const events = await prisma.event.findMany({
        where: {
          startTime: {
            gte: params.startTime ? new Date(params.startTime) : new Date(),
            lte: params.endTime ? new Date(params.endTime) : undefined,
          },
          type: params.types?.length ? { in: params.types } : undefined,
        },
        include: {
          creator: true,
          participants: {
            include: {
              user: true,
            },
          },
        },
      });

      return {
        success: true,
        data: events.map(event => this.mapPrismaEventToEvent(event)),
      };
    } catch (error) {
      console.error('Error getting nearby events:', error);
      return {
        success: false,
        error: 'Failed to get nearby events',
      };
    }
  }

  async joinEvent(
    eventId: string,
    userId: string
  ): Promise<EventServiceResponse<Event>> {
    try {
      const event = await prisma.event.update({
        where: { id: eventId },
        data: {
          participants: {
            create: {
              userId,
              joinedAt: new Date(),
            },
          },
        },
        include: {
          creator: true,
          participants: {
            include: {
              user: true,
            },
          },
        },
      });

      return {
        success: true,
        data: this.mapPrismaEventToEvent(event),
      };
    } catch (error) {
      console.error('Error joining event:', error);
      return {
        success: false,
        error: 'Failed to join event',
      };
    }
  }

  async leaveEvent(
    eventId: string,
    userId: string
  ): Promise<EventServiceResponse<Event>> {
    try {
      const event = await prisma.event.update({
        where: { id: eventId },
        data: {
          participants: {
            delete: {
              eventId_userId: {
                eventId,
                userId,
              },
            },
          },
        },
        include: {
          creator: true,
          participants: {
            include: {
              user: true,
            },
          },
        },
      });

      return {
        success: true,
        data: this.mapPrismaEventToEvent(event),
      };
    } catch (error) {
      console.error('Error leaving event:', error);
      return {
        success: false,
        error: 'Failed to leave event',
      };
    }
  }
}

export const eventService = EventService.getInstance();
