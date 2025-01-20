import { db } from '@/lib/prisma';
import type { EventWithParticipants } from '@/types/event';
import type { ServiceResponse } from '@/types/service';
import type { ParticipantUser, ParticipantStatus } from '@/types/participant';

export interface EventCreateInput {
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  latitude: number;
  longitude: number;
  type: 'social' | 'virtual' | 'hybrid';
  maxParticipants?: number;
  tags?: string[];
  creatorId: string;
}

interface DbEvent {
  id: string;
  title: string;
  description: string | null;
  type: 'social' | 'virtual' | 'hybrid';
  creatorId: string;
  latitude: number;
  longitude: number;
  startTime: Date;
  endTime: Date | null;
  maxParticipants: number | null;
  participants: DbParticipant[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  creator: DbUser;
}

interface DbParticipant {
  id: string;
  userId: string;
  eventId: string;
  createdAt: Date;
  updatedAt: Date;
  user: DbUser;
}

interface DbUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface EventUpdateInput {
  title?: string;
  description?: string;
  startTime?: Date;
  endTime?: Date;
  latitude?: number;
  longitude?: number;
  address?: string;
  type?: 'social' | 'virtual' | 'hybrid';
  maxParticipants?: number;
  tags?: string[];
}

// Distance unit type for clarity
export type DistanceUnit = 'km' | 'm';

export class EventService {
  private static instance: EventService;

  // Private constructor to enforce singleton pattern
  private constructor() {
    // Intentionally empty - initialization is handled through getInstance()
  }

  public static getInstance(): EventService {
    if (!EventService.instance) {
      EventService.instance = new EventService();
    }
    return EventService.instance;
  }

  private mapDbEventToEvent(dbEvent: DbEvent): EventWithParticipants {
    const participants = dbEvent.participants.map(p => ({
      id: p.id,
      userId: p.userId,
      eventId: p.eventId,
      status: 'accepted' as ParticipantStatus,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      user: {
        id: p.user.id,
        email: p.user.email,
        name: p.user.firstName && p.user.lastName 
          ? `${p.user.firstName} ${p.user.lastName}`
          : null,
      },
    }));

    return {
      id: dbEvent.id,
      title: dbEvent.title,
      description: dbEvent.description || null,
      type: dbEvent.type,
      eventType: dbEvent.type,
      creatorId: dbEvent.creatorId,
      location: {
        latitude: dbEvent.latitude,
        longitude: dbEvent.longitude,
      },
      startTime: dbEvent.startTime,
      endTime: dbEvent.endTime || undefined,
      maxParticipants: dbEvent.maxParticipants,
      currentParticipants: participants.length,
      participants,
      tags: dbEvent.tags,
      createdAt: dbEvent.createdAt,
      updatedAt: dbEvent.updatedAt,
      creator: {
        id: dbEvent.creator.id,
        name: dbEvent.creator.firstName && dbEvent.creator.lastName 
          ? `${dbEvent.creator.firstName} ${dbEvent.creator.lastName}`
          : null,
      },
    };
  }

  async createEvent(
    data: EventCreateInput
  ): Promise<ServiceResponse<EventWithParticipants>> {
    try {
      const event = await db.event.create({
        data: {
          title: data.title,
          description: data.description || null,
          type: data.type,
          latitude: data.latitude,
          longitude: data.longitude,
          startTime: data.startTime,
          endTime: data.endTime || null,
          maxParticipants: data.maxParticipants || null,
          tags: data.tags || [],
          creatorId: data.creatorId,
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
        data: this.mapDbEventToEvent(event as unknown as DbEvent),
      };
    } catch (error) {
      console.error('Error creating event:', error);
      return {
        success: false,
        error: 'Failed to create event',
      };
    }
  }

  async getEventById(
    id: string
  ): Promise<ServiceResponse<EventWithParticipants>> {
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
        data: this.mapDbEventToEvent(event as unknown as DbEvent),
      };
    } catch (error) {
      console.error('Error getting event:', error);
      return {
        success: false,
        error: 'Failed to get event',
      };
    }
  }

  async updateEvent(
    id: string,
    data: EventUpdateInput
  ): Promise<ServiceResponse<EventWithParticipants>> {
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
        data: this.mapDbEventToEvent(event as unknown as DbEvent),
      };
    } catch (error) {
      console.error('Error updating event:', error);
      return {
        success: false,
        error: 'Failed to update event',
      };
    }
  }

  async deleteEvent(id: string): Promise<ServiceResponse<void>> {
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
        error: `Failed to delete event: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  async joinEvent(
    eventId: string,
    userId: string
  ): Promise<ServiceResponse<EventWithParticipants>> {
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
        data: this.mapDbEventToEvent(event as unknown as DbEvent),
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
  ): Promise<ServiceResponse<EventWithParticipants>> {
    try {
      const event = await db.event.update({
        where: { id: eventId },
        data: {
          participants: {
            deleteMany: {
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
        data: this.mapDbEventToEvent(event as unknown as DbEvent),
      };
    } catch (error) {
      console.error('Error leaving event:', error);
      return {
        success: false,
        error: 'Failed to leave event',
      };
    }
  }

  async getEvents(): Promise<ServiceResponse<EventWithParticipants[]>> {
    try {
      const events = await db.event.findMany({
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
        data: events.map(event =>
          this.mapDbEventToEvent(event as unknown as DbEvent)
        ),
      };
    } catch (error) {
      console.error('Error getting events:', error);
      return {
        success: false,
        error: 'Failed to get events',
      };
    }
  }

  async getNearbyEvents(
    latitude: number,
    longitude: number,
    radius: number,
    unit: DistanceUnit = 'm',
    limit = 10
  ): Promise<
    ServiceResponse<(EventWithParticipants & { distance: number })[]>
  > {
    try {
      // Convert radius to kilometers for internal calculations
      const radiusInKm = unit === 'km' ? radius : radius / 1000;

      // Convert radius to degrees (approximate)
      // 1 degree of latitude = ~111.32 kilometers at the equator
      // This varies slightly with latitude due to Earth's ellipsoid shape
      const radiusInDegrees = radiusInKm / 111.32;

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
                // Adjust for longitude distance variation with latitude
                // cos(latitude) accounts for longitude degrees getting shorter at higher latitudes
                gte:
                  longitude - radiusInDegrees / Math.cos(this.toRad(latitude)),
                lte:
                  longitude + radiusInDegrees / Math.cos(this.toRad(latitude)),
              },
            },
            {
              startTime: {
                gte: new Date(), // Only future events
              },
            },
          ],
        },
        orderBy: [
          {
            startTime: 'asc',
          },
        ],
        take: limit,
        include: {
          creator: true,
          participants: {
            include: {
              user: true,
            },
          },
        },
      });

      // Calculate actual distances using Vincenty formula for more accuracy
      const eventsWithDistance = events.map(event => {
        const distanceInKm = this.calculateDistance(
          latitude,
          longitude,
          event.latitude,
          event.longitude
        );

        // Convert distance to requested unit
        const distance = unit === 'km' ? distanceInKm : distanceInKm * 1000;

        return {
          ...this.mapDbEventToEvent(event as unknown as DbEvent),
          distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
        };
      });

      // Filter and sort by actual distance
      const sortedEvents = eventsWithDistance
        .filter(event => event.distance <= radius)
        .sort((a, b) => a.distance - b.distance);

      return {
        success: true,
        data: sortedEvents,
      };
    } catch (error) {
      console.error('Error getting nearby events:', error);
      return {
        success: false,
        error: 'Failed to get nearby events',
      };
    }
  }

  /**
   * Calculates the distance between two points using the Haversine formula
   * @param lat1 Latitude of first point
   * @param lon1 Longitude of first point
   * @param lat2 Latitude of second point
   * @param lon2 Longitude of second point
   * @returns Distance in kilometers
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    // Haversine formula
    const R = 6371; // Earth's mean radius in kilometers
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);

    // Use spherical law of cosines for better accuracy
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Return distance in kilometers
    return R * c;
  }

  /**
   * Converts degrees to radians
   */
  private toRad(degrees: number): number {
    return (degrees * Math.PI) / 180;
  }
}

export type EventServiceResponse<T> = ServiceResponse<T>;

export const eventService = EventService.getInstance();
