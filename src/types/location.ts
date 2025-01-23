export type LocationPermissionStatus = 'granted' | 'denied' | 'prompt';

// This needs to match what Prisma expects
export type LocationPrivacyMode = 'precise' | 'approximate' | 'zone';

// This is what our app uses internally
export const AppLocationPrivacyMode = {
  PUBLIC: 'public',
  FRIENDS: 'friends',
  PRIVATE: 'private'
} as const;

export type AppLocationPrivacyMode = typeof AppLocationPrivacyMode[keyof typeof AppLocationPrivacyMode];

export interface Coordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface Location {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: Date;
  privacyMode: AppLocationPrivacyMode;
}

export interface LocationWithAddress extends Location {
  address?: Address;
}

export interface Address {
  street?: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  formatted?: string;
}

export interface PrivacyZone {
  id: string;
  userId: string;
  name: string;
  radius: number;
  latitude: number;
  longitude: number;
  enabled: boolean;
}

export interface LocationState {
  location: Location | null;
  error: string | null;
  loading: boolean;
}

export interface LocationError {
  code: number;
  message: string;
}

export interface LocationUpdateEvent {
  type: 'location_update';
  payload: Location;
}

export interface LocationPreferences {
  privacyMode: AppLocationPrivacyMode;
  sharingEnabled: boolean;
  backgroundTracking: boolean;
  updateInterval: number;
  minAccuracy: number;
}

export interface LocationTrackingOptions {
  enableHighAccuracy?: boolean;
  maximumAge?: number;
  timeout?: number;
  backgroundTracking?: boolean;
}

export interface NearbyLocation {
  latitude: number;
  longitude: number;
  distance: number;
  accuracy?: number;
  privacyMode: AppLocationPrivacyMode;
  timestamp: Date;
  userId: string;
}

export function convertToAppPrivacyMode(
  mode: LocationPrivacyMode
): AppLocationPrivacyMode {
  switch (mode) {
    case 'precise':
    case 'approximate':
      return 'public';
    case 'zone':
      return 'private';
    default:
      return 'public';
  }
}

export function convertToPrismaPrivacyMode(
  mode: AppLocationPrivacyMode
): LocationPrivacyMode {
  switch (mode) {
    case 'public':
      return 'precise';
    case 'private':
      return 'zone';
  }
}
