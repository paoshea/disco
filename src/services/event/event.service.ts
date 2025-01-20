import { db } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import type {
  Event,
  EventWithParticipants,
  EventParticipant,
} from '@/types/event';
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

// Distance unit type for clarity
export type DistanceUnit = 'km' | 'm';

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
    const participants = (dbEvent.participants || []).map(
      (p: any) =>
        ({
          id: p.id,
          userId: p.userId,
          eventId: p.eventId,
          status: p.status || 'pending',
          createdAt: new Date(p.createdAt),
          updatedAt: new Date(p.updatedAt),
          user: p.user
            ? {
                id: p.user.id,
                email: p.user.email,
                name:
                  p.user.name ||
                  `${p.user.firstName} ${p.user.lastName}`.trim() ||
                  null,
              }
            : undefined,
        }) as EventParticipant
    );

    return {
      id: dbEvent.id,
      title: dbEvent.title,
      description: dbEvent.description || null,
      type: dbEvent.type || 'social',
      eventType: dbEvent.eventType || 'social',
      creatorId: dbEvent.creatorId,
      location: {
        latitude: dbEvent.latitude,
        longitude: dbEvent.longitude,
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
        name:
          dbEvent.creator.name ||
          `${dbEvent.creator.firstName} ${dbEvent.creator.lastName}`.trim() ||
          null,
      },
    };
  }

  async createEvent(
    data: EventCreateInput
  ): Promise<EventServiceResponse<EventWithParticipants>> {
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
        data: this.mapDbEventToEvent(event),
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
  ): Promise<EventServiceResponse<EventWithParticipants>> {
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
        data: this.mapDbEventToEvent(event),
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
  ): Promise<EventServiceResponse<EventWithParticipants>> {
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
        data: this.mapDbEventToEvent(event),
      };
    } catch (error) {
      console.error('Error updating event:', error);
      return {
        success: false,
        error: 'Failed to update event',
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
              status: 'joined',
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
        data: this.mapDbEventToEvent(event),
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
        data: this.mapDbEventToEvent(event),
      };
    } catch (error) {
      console.error('Error leaving event:', error);
      return {
        success: false,
        error: 'Failed to leave event',
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
              user: true,
            },
          },
        },
      });

      return {
        success: true,
        data: events.map(event => this.mapDbEventToEvent(event)),
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
    limit: number = 10
  ): Promise<EventServiceResponse<(EventWithParticipants & { distance: number })[]>> {
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
                gte: longitude - radiusInDegrees / Math.cos(this.toRad(latitude)),
                lte: longitude + radiusInDegrees / Math.cos(this.toRad(latitude)),
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
          ...this.mapDbEventToEvent(event),
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

export const eventService = EventService.getInstance();
