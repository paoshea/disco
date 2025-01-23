import { prisma } from '@/lib/prisma';
import type { PrivacySettings } from '@/types/privacy';

interface PrivacyZone {
  id: string;
  userId: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  center: {
    latitude: number;
    longitude: number;
  };
}

export const privacyService = {
  async getPrivacyZones(userId: string): Promise<PrivacyZone[]> {
    const zones = await prisma.privacyZone.findMany({
      where: { userId },
    });

    return zones.map(zone => ({
      ...zone,
      center: {
        latitude: zone.latitude,
        longitude: zone.longitude,
      },
    }));
  },

  async createPrivacyZone(
    userId: string,
    name: string,
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<PrivacyZone> {
    const zone = await prisma.privacyZone.create({
      data: {
        userId,
        name,
        latitude,
        longitude,
        radius,
      },
    });

    return {
      ...zone,
      center: {
        latitude: zone.latitude,
        longitude: zone.longitude,
      },
    };
  },

  async updatePrivacyZone(
    id: string,
    updates: Partial<Omit<PrivacyZone, 'id' | 'userId' | 'center'>>
  ): Promise<PrivacyZone> {
    const zone = await prisma.privacyZone.update({
      where: { id },
      data: updates,
    });

    return {
      ...zone,
      center: {
        latitude: zone.latitude,
        longitude: zone.longitude,
      },
    };
  },

  async deletePrivacyZone(id: string): Promise<void> {
    await prisma.privacyZone.delete({
      where: { id },
    });
  },

  calculateDistance(
    point1: { latitude: number; longitude: number },
    point2: { latitude: number; longitude: number }
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  },

  isPointInPrivacyZone(
    point: { latitude: number; longitude: number },
    zones: PrivacyZone[]
  ): boolean {
    return zones.some(
      zone => this.calculateDistance(point, zone.center) < zone.radius
    );
  },
};
