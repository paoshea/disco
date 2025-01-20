import { db } from '@/lib/prisma';
import type { Location as PrismaLocation } from '@prisma/client';
import type { Location, LocationPrivacyMode } from '@/types/location';
import type { ServiceResponse } from '@/types/api';

export class LocationService {
  private static instance: LocationService;
  private prisma: typeof db.location;

  private constructor() {
    this.prisma = db.location;
  }

  public static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  private mapPrismaLocationToLocation(location: PrismaLocation): Location {
    return {
      id: location.id,
      userId: location.userId,
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy ?? undefined,
      privacyMode: location.privacyMode as LocationPrivacyMode,
      sharingEnabled: location.sharingEnabled,
      timestamp: location.timestamp
    };
  }

  async updateLocation(
    userId: string,
    data: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      privacyMode: LocationPrivacyMode;
      sharingEnabled?: boolean;
    }
  ): Promise<ServiceResponse<Location>> {
    try {
      if (!data.latitude || !data.longitude) {
        throw new Error('Latitude and longitude are required');
      }

      // Delete old locations for this user (keep only the latest)
      await this.prisma.deleteMany({
        where: {
          userId,
          timestamp: {
            lt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Older than 24 hours
          },
        },
      });

      const locationData = {
        userId,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy ?? null,
        privacyMode: data.privacyMode,
        sharingEnabled: data.sharingEnabled ?? true,
        timestamp: new Date(),
      };

      const prismaLocation = await this.prisma.create({
        data: locationData,
      });

      return {
        success: true,
        data: this.mapPrismaLocationToLocation(prismaLocation)
      };
    } catch (error) {
      console.error('Error updating location:', error);
      return {
        success: false,
        error: 'Failed to update location'
      };
    }
  }

  async getLocationState(userId: string): Promise<ServiceResponse<Location>> {
    try {
      const prismaLocation = await this.prisma.findFirst({
        where: { userId },
        orderBy: { timestamp: 'desc' },
      });

      if (!prismaLocation) {
        return {
          success: false,
          error: 'No location found',
        };
      }

      return {
        success: true,
        data: this.mapPrismaLocationToLocation(prismaLocation),
      };
    } catch (error) {
      console.error('Error getting location state:', error);
      return {
        success: false,
        error: 'Failed to get location state'
      };
    }
  }

  async updateLocationState(
    userId: string,
    data: {
      privacyMode: LocationPrivacyMode;
      sharingEnabled: boolean;
    }
  ): Promise<ServiceResponse<Location>> {
    try {
      const currentLocation = await this.prisma.findFirst({
        where: { userId },
        orderBy: { timestamp: 'desc' },
      });

      if (!currentLocation) {
        return {
          success: false,
          error: 'No location found',
        };
      }

      const prismaLocation = await this.prisma.update({
        where: { id: currentLocation.id },
        data: {
          privacyMode: data.privacyMode,
          sharingEnabled: data.sharingEnabled,
        },
      });

      return {
        success: true,
        data: this.mapPrismaLocationToLocation(prismaLocation),
      };
    } catch (error) {
      console.error('Error updating location state:', error);
      return {
        success: false,
        error: 'Failed to update location state'
      };
    }
  }

  async getLatestLocation(userId: string): Promise<Location | null> {
    try {
      const prismaLocation = await this.prisma.findFirst({
        where: { userId },
        orderBy: { timestamp: 'desc' },
      });

      return prismaLocation ? this.mapPrismaLocationToLocation(prismaLocation) : null;
    } catch (error) {
      console.error('Error getting latest location:', error);
      throw error;
    }
  }

  async getLocation(userId: string): Promise<Location | null> {
    const prismaLocation = await this.prisma.findFirst({
      where: {
        userId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    return prismaLocation ? this.mapPrismaLocationToLocation(prismaLocation) : null;
  }

  async toggleLocationSharing(userId: string): Promise<Location | null> {
    const currentLocation = await this.getLocation(userId);
    if (!currentLocation) {
      return null;
    }

    const prismaLocation = await this.prisma.update({
      where: {
        id: currentLocation.id,
      },
      data: {
        sharingEnabled: !currentLocation.sharingEnabled,
      },
    });

    return this.mapPrismaLocationToLocation(prismaLocation);
  }

  async updatePrivacyMode(
    userId: string,
    privacyMode: LocationPrivacyMode
  ): Promise<Location | null> {
    const currentLocation = await this.getLocation(userId);
    if (!currentLocation) {
      return null;
    }

    const prismaLocation = await this.prisma.update({
      where: {
        id: currentLocation.id,
      },
      data: {
        privacyMode,
      },
    });

    return this.mapPrismaLocationToLocation(prismaLocation);
  }
}

export const locationService = LocationService.getInstance();
