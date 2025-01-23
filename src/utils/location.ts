import { prisma } from '@/lib/prisma';
import type {
  LocationPrivacyMode,
  AppLocationPrivacyMode,
} from '@/types/location';

export interface LocationData {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  privacyMode: LocationPrivacyMode;
  sharingEnabled: boolean;
  timestamp: Date;
}

interface PrivacyZoneData {
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  userId: string;
}

const EARTH_RADIUS_KM = 6371; // Earth's radius in kilometers

// Initialize Prisma clients
const locationDb = prisma.location;
const privacyZoneDb = prisma.privacyZone;

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_KM * c;
}

export function convertLocationPrivacyMode(mode: string): LocationPrivacyMode {
  switch (mode.toLowerCase()) {
    case 'precise':
      return 'precise';
    case 'approximate':
      return 'approximate';
    case 'zone':
      return 'zone';
    default:
      return 'precise';
  }
}

export function convertToPrismaPrivacyMode(
  mode: AppLocationPrivacyMode
): LocationPrivacyMode {
  switch (mode) {
    case 'standard':
      return 'precise';
    case 'strict':
      return 'approximate';
    default:
      return 'precise';
  }
}

export async function createLocation(data: LocationData) {
  return await prisma.location.create({
    data,
    include: {
      user: true,
    },
  });
}

export async function createPrivacyZone(data: PrivacyZoneData) {
  return await prisma.privacyZone.create({
    data,
    include: {
      user: true,
    },
  });
}

export async function getPrivacyZones(
  userId: string
): Promise<PrivacyZoneData[]> {
  return await privacyZoneDb.findMany({
    where: { userId },
  });
}

export function isLocationInPrivacyZone(
  loc: LocationData,
  zone: PrivacyZoneData
): boolean {
  const distance = calculateDistance(
    loc.latitude,
    loc.longitude,
    zone.latitude,
    zone.longitude
  );
  return distance <= zone.radius;
}

export async function getNearbyLocations(
  userId: string,
  latitude: number,
  longitude: number,
  radiusKm = 5
): Promise<LocationData[]> {
  // First get all locations from the last 24 hours
  const recentLocations = await locationDb.findMany({
    where: {
      userId: { not: userId }, // Exclude the requesting user
      timestamp: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
    },
  });

  // Then filter by distance and map to LocationData
  return recentLocations
    .map(loc => ({
      ...loc,
      accuracy: loc.accuracy ?? undefined,
      privacyMode: convertLocationPrivacyMode(loc.privacyMode),
    }))
    .filter(
      loc =>
        calculateDistance(latitude, longitude, loc.latitude, loc.longitude) <=
        radiusKm
    );
}

export async function deletePrivacyZone(
  userId: string,
  zoneId: string
): Promise<PrivacyZoneData> {
  return await privacyZoneDb.delete({
    where: {
      id: zoneId,
      userId, // Ensure the zone belongs to the user
    },
  });
}

export const locationUtils = {
  calculateDistance,
  createLocation,
  createPrivacyZone,
  getPrivacyZones,
  isLocationInPrivacyZone,
  getNearbyLocations,
  deletePrivacyZone,
  convertLocationPrivacyMode,
  convertToPrismaPrivacyMode,
};
