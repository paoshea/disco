import { db } from '@/lib/prisma';
import type { ExtendedPrismaClient } from '@/lib/prisma';
import type { Location, LocationPrivacyMode } from '@/types/location';

export class LocationService {
  private static instance: LocationService;
  private prisma: ExtendedPrismaClient['$extends']['model']['location'];

  private constructor() {
    this.prisma = (db as ExtendedPrismaClient).$extends.model.location;
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
    privacyMode: LocationPrivacyMode = 'precise'
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

      return data as Location;
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }

  async getLatestLocation(userId: string): Promise<Location | null> {
    try {
      const location = await this.prisma.findFirst({
        where: { userId },
        orderBy: { timestamp: 'desc' },
      });

      return location as Location | null;
    } catch (error) {
      console.error('Error getting latest location:', error);
      throw error;
    }
  }
}

export const locationService = LocationService.getInstance();
