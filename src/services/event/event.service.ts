import { db } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type { EventWithParticipants } from '@/types/prisma';
import type { ServiceResponse } from '@/types/service';

interface EventCreateInput {
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  latitude: number;
  longitude: number;
  type: string;
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

  async createEvent(data: EventCreateInput): Promise<EventServiceResponse<EventWithParticipants>> {
    try {
      const event = await db.event.create({
        data,
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

  async getEvent(id: string): Promise<EventServiceResponse<EventWithParticipants>> {
    try {
      const event = await db.event.findUnique({
        where: { id },
        include: {
          creator: true,
          participants: {
            include: {
              user: true,
            },
          },
        },
      });

      if (!event) {
        return {
          success: false,
          error: 'Event not found',
        };
      }

      return {
        success: true,
        data: event,
      };
    } catch (error) {
      console.error('Error getting event:', error);
      return {
        success: false,
        error: 'Failed to get event',
      };
    }
  }

  async updateEvent(id: string, data: EventUpdateInput): Promise<EventServiceResponse<EventWithParticipants>> {
    try {
      const event = await db.event.update({
        where: { id },
        data,
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
        data: event,
      };
    } catch (error) {
      console.error('Error updating event:', error);
      return {
        success: false,
        error: 'Failed to update event',
      };
    }
  }

  async deleteEvent(id: string): Promise<EventServiceResponse<void>> {
    try {
      await db.event.delete({
        where: { id },
      });

      return {
        success: true,
      };
    } catch (error) {
      console.error('Error deleting event:', error);
      return {
        success: false,
        error: 'Failed to delete event',
      };
    }
  }

  async getNearbyEvents(
    latitude: number,
    longitude: number,
    radiusInKm: number = 5
  ): Promise<EventServiceResponse<EventWithParticipants[]>> {
    try {
      const radiusInDegrees = radiusInKm / 111.32; // rough approximation: 1 degree = 111.32 km

      const events = await db.event.findMany({
        where: {
          AND: [
            {
              latitude: {
                gte: latitude - radiusInDegrees,
                lte: latitude + radiusInDegrees,
              },
            },
            {
              longitude: {
                gte: longitude - radiusInDegrees,
                lte: longitude + radiusInDegrees,
              },
            },
          ],
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
        data: events,
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
