import { db } from '@/lib/prisma';
import type { Prisma } from '@prisma/client';

type Location = Prisma.LocationGetPayload<{}>;

type ServiceResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export class LocationService {
  private static instance: LocationService;
  private prisma: typeof db.location;

  private constructor() {
    this.prisma = db.location;
  }

  static getInstance(): LocationService {
    if (!LocationService.instance) {
      LocationService.instance = new LocationService();
    }
    return LocationService.instance;
  }

  async updateLocation(
    userId: string,
    latitude: number,
    longitude: number,
    accuracy?: number,
    privacyMode: string = 'precise'
  ): Promise<Location> {
    try {
      if (!latitude || !longitude) {
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
        latitude,
        longitude,
        accuracy,
        privacyMode,
        sharingEnabled: true,
        timestamp: new Date(),
      };

      const data = await this.prisma.create({
        data: locationData,
      });

      return data;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  async updateLocation(
    userId: string,
    data: {
      latitude: number;
      longitude: number;
      accuracy?: number;
      privacyMode: string;
      sharingEnabled?: boolean;
    }
  ): Promise<ServiceResponse<Location>> {
    try {
      const location = await db.location.create({
        data: {
          userId,
          ...data,
          sharingEnabled: data.sharingEnabled ?? true,
        },
      });

      return {
        success: true,
        data: location,
      };
    } catch (error) {
      console.error('Error updating location:', error);
      return {
        success: false,
        error: 'Failed to update location',
      };
    }
  }

  async getLocationState(userId: string): Promise<ServiceResponse<Location>> {
    try {
      const location = await db.location.findFirst({
        where: { userId },
        orderBy: { timestamp: 'desc' },
      });

      if (!location) {
        return {
          success: false,
          error: 'No location found',
        };
      }

      return {
        success: true,
        data: location,
      };
    } catch (error) {
      console.error('Error getting location state:', error);
      return {
        success: false,
        error: 'Failed to get location state',
      };
    }
  }

  async updateLocationState(
    userId: string,
    data: {
      privacyMode: string;
      sharingEnabled: boolean;
    }
  ): Promise<ServiceResponse<Location>> {
    try {
      const currentLocation = await db.location.findFirst({
        where: { userId },
        orderBy: { timestamp: 'desc' },
      });

      if (!currentLocation) {
        return {
          success: false,
          error: 'No location found to update',
        };
      }

      const location = await db.location.create({
        data: {
          userId,
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          accuracy: currentLocation.accuracy,
          ...data,
        },
      });

      return {
        success: true,
        data: location,
      };
    } catch (error) {
      console.error('Error updating location state:', error);
      return {
        success: false,
        error: 'Failed to update location state',
      };
    }
  }

  async getLatestLocation(userId: string): Promise<Location | null> {
    try {
      const location = await this.prisma.findFirst({
        where: { userId },
        orderBy: { timestamp: 'desc' },
      });

      return location;
    } catch (error) {
      console.error('Error getting latest location:', error);
      throw error;
    }
  }

  static async getLocation(userId: string): Promise<Location | null> {
    return await db.location.findFirst({
      where: {
        userId,
      },
      orderBy: {
        timestamp: 'desc',
      },
    });
  }

  static async toggleLocationSharing(userId: string): Promise<Location | null> {
    const currentLocation = await LocationService.getLocation(userId);
    if (!currentLocation) {
      return null;
    }

    return await db.location.update({
      where: {
        id: currentLocation.id,
      },
      data: {
        sharingEnabled: !currentLocation.sharingEnabled,
      },
    });
  }

  static async updatePrivacyMode(
    userId: string,
    privacyMode: string
  ): Promise<Location | null> {
    const currentLocation = await LocationService.getLocation(userId);
    if (!currentLocation) {
      return null;
    }

    return await db.location.update({
      where: {
        id: currentLocation.id,
      },
      data: {
        privacyMode,
      },
    });
  }
}

export const locationService = LocationService.getInstance();
