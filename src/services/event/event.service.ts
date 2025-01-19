import { db } from '@/lib/prisma';
import type { Event, User } from '@prisma/client';
import type { EventWithParticipants } from '@/types/event';
import type { ServiceResponse } from '@/types/service';

export type EventServiceResponse<T> = ServiceResponse<T>;

export class EventService {
  private static instance: EventService;

  // Private constructor to enforce singleton pattern
  private constructor() {}

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  async findNearbyEvents(
    latitude: number,
    longitude: number,
    radiusInMeters = 5000
  ): Promise<EventServiceResponse<EventWithParticipants[]>> {
    try {
      // Calculate bounding box for initial filtering
      const metersPerDegree = 111320; // approximate meters per degree at equator
      const latitudeDelta = radiusInMeters / metersPerDegree;
      const longitudeDelta =
        radiusInMeters / (metersPerDegree * Math.cos(latitude * (Math.PI / 180)));

      const minLat = latitude - latitudeDelta;
      const maxLat = latitude + latitudeDelta;
      const minLon = longitude - longitudeDelta;
      const maxLon = longitude + longitudeDelta;

      const events = await db.event.findMany({
        where: {
          location: {
            latitude: {
              gte: minLat,
              lte: maxLat,
            },
            longitude: {
              gte: minLon,
              lte: maxLon,
            },
          },
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        data: events.map(event => ({
          ...event,
          currentParticipants: event.participants.length,
        })),
      };
    } catch (error) {
      console.error('Error finding nearby events:', error);
      return {
        success: false,
        error: 'Failed to find nearby events',
      };
    }
  }

  async createEvent(
    eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>,
    creator: User
  ): Promise<EventServiceResponse<EventWithParticipants>> {
    try {
      const event = await db.event.create({
        data: {
          ...eventData,
          creatorId: creator.id,
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        data: event,
      };
    } catch (error) {
      console.error('Error creating event:', error);
      return {
        success: false,
        error: 'Failed to create event',
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
            },
          },
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        data: event,
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
  ): Promise<EventServiceResponse<EventWithParticipants>> {
    try {
      const event = await db.event.update({
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
          creator: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          participants: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  image: true,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        data: event,
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
