import { db } from '@/lib/prisma';
import type { ExtendedPrismaClient } from '@/lib/prisma';
import type { Location, PrivacyZone } from '@/types/location';

const EARTH_RADIUS_KM = 6371; // Earth's radius in kilometers

// Initialize Prisma clients
const locationDb: ExtendedPrismaClient['$extends']['model']['location'] = (
  db as ExtendedPrismaClient
).$extends.model.location;
const privacyZoneDb: ExtendedPrismaClient['$extends']['model']['privacyZone'] =
  (db as ExtendedPrismaClient).$extends.model.privacyZone;

export function degreesToRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = degreesToRadians(lat2 - lat1);
  const dLon = degreesToRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export async function getPrivacyZones(userId: string): Promise<PrivacyZone[]> {
  return (await privacyZoneDb.findMany({
    where: { userId },
  })) as PrivacyZone[];
}

export function isInPrivacyZone(
  lat: number,
  lon: number,
  zone: PrivacyZone
): boolean {
  const distance = calculateDistance(lat, lon, zone.latitude, zone.longitude);
  return distance <= zone.radius;
}

export async function getNearbyLocations(
  userId: string,
  latitude: number,
  longitude: number,
  radiusKm = 5
): Promise<Location[]> {
  // First get all locations from the last 24 hours
  const recentLocations = (await locationDb.findMany({
    where: {
      userId: { not: userId }, // Exclude the requesting user
      timestamp: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
  })) as Location[];

  // Then filter by distance
  return recentLocations.filter(
    loc =>
      calculateDistance(latitude, longitude, loc.latitude, loc.longitude) <=
      radiusKm
  );
}

export async function createPrivacyZone(
  userId: string,
  name: string,
  latitude: number,
  longitude: number,
  radius: number
): Promise<PrivacyZone> {
  return (await privacyZoneDb.create({
    data: {
      userId,
      name,
      latitude,
      longitude,
      radius,
    },
  })) as PrivacyZone;
}

export async function deletePrivacyZone(
  userId: string,
  zoneId: string
): Promise<PrivacyZone> {
  return (await privacyZoneDb.delete({
    where: {
      id: zoneId,
      userId, // Ensure the zone belongs to the user
    },
  })) as PrivacyZone;
}

export const locationUtils = {
  degreesToRadians,
  calculateDistance,
  getPrivacyZones,
  isInPrivacyZone,
  getNearbyLocations,
  createPrivacyZone,
  deletePrivacyZone,
};
