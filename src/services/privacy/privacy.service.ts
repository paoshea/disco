import { prisma } from '@/lib/prisma';
import type { PrivacyZone, PrivacySettings } from '@/types/privacy';

export const privacyService = {
  async getPrivacyZones(userId: string): Promise<PrivacyZone[]> {
    return prisma.privacyZone.findMany({
      where: { userId },
    });
  },

  async createPrivacyZone(userId: string, zone: Omit<PrivacyZone, 'id'>): Promise<PrivacyZone> {
    return prisma.privacyZone.create({
      data: {
        ...zone,
        userId,
      },
    });
  },

  async updatePrivacyZone(id: string, zone: Partial<PrivacyZone>): Promise<PrivacyZone> {
    return prisma.privacyZone.update({
      where: { id },
      data: zone,
    });
  },

  async deletePrivacyZone(id: string): Promise<void> {
    await prisma.privacyZone.delete({
      where: { id },
    });
  },

  async checkZoneOverlap(
    userId: string,
    center: { latitude: number; longitude: number },
    radius: number,
    excludeId?: string
  ): Promise<boolean> {
    const zones = await this.getPrivacyZones(userId);
    return zones.some(
      (zone) =>
        zone.id !== excludeId &&
        this._calculateDistance(center, zone.center) < radius + zone.radius
    );
  },

  _calculateDistance(
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
};
