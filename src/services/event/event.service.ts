import { db } from '@/lib/prisma';
import type { Event, EventWithParticipants } from '@/types/event';
import type { User } from '@/types/user';

// Initialize Prisma client model
const eventDb = db.$extends.model.event;

interface EventServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class EventService {
  private static instance: EventService;

  private constructor() {}

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  async getNearbyEvents(
    latitude: number,
    longitude: number,
    radiusInMeters: number = 500
  ): Promise<EventServiceResponse<EventWithParticipants[]>> {
    try {
      // Calculate bounding box for spatial query
      const latitudeDelta = radiusInMeters / 111000; // 111km per degree
      const minLat = latitude - latitudeDelta;
      const maxLat = latitude + latitudeDelta;

      const longitudeDelta =
        radiusInMeters / (111000 * Math.cos((latitude * Math.PI) / 180));
      const minLon = longitude - longitudeDelta;
      const maxLon = longitude + longitudeDelta;

      const events = await eventDb.findMany({
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
            },
          },
          participants: {
            select: {
              userId: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      // Add currentParticipants count
      return {
        success: true,
        data: events.map((event: EventWithParticipants) => ({
          ...event,
          currentParticipants: event.participants.length,
        })),
      };
    } catch (error) {
      console.error('Error fetching nearby events:', error);
      return {
        success: false,
        error: 'Failed to get nearby events',
      };
    }
  }

  async createEvent(
    eventData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'>,
    creator: User
  ): Promise<EventServiceResponse<EventWithParticipants>> {
    try {
      const event = await eventDb.create({
        data: {
          ...eventData,
          creatorId: creator.id,
          currentParticipants: 0,
          participants: {
            create: {
              userId: creator.id,
              status: 'confirmed',
            },
          },
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
          participants: {
            select: {
              userId: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        data: {
          ...event,
          currentParticipants: event.participants.length,
        },
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
      const event = await eventDb.update({
        where: { id: eventId },
        data: {
          participants: {
            create: {
              userId,
              status: 'confirmed',
            },
          },
        },
        include: {
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
          participants: {
            select: {
              userId: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        data: {
          ...event,
          currentParticipants: event.participants.length,
        },
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
      const event = await eventDb.update({
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
            },
          },
          participants: {
            select: {
              userId: true,
              user: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      });

      return {
        success: true,
        data: {
          ...event,
          currentParticipants: event.participants.length,
        },
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

// Export singleton instance
export const eventService = EventService.getInstance();
