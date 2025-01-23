export type LocationPermissionStatus = 'granted' | 'denied' | 'prompt';

// This needs to match what Prisma expects
export type LocationPrivacyMode = 'precise' | 'approximate' | 'zone';

// This is what our app uses internally
export type AppLocationPrivacyMode = 'standard' | 'strict';

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
  accuracy?: number;
  timestamp: Date;
  privacyMode: LocationPrivacyMode;
  sharingEnabled: boolean;
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

export function convertToAppPrivacyMode(mode: LocationPrivacyMode): AppLocationPrivacyMode {
  switch (mode) {
    case 'precise':
    case 'approximate':
      return 'standard';
    case 'zone':
      return 'strict';
    default:
      return 'standard';
  }
}

export function convertToPrismaPrivacyMode(mode: AppLocationPrivacyMode): LocationPrivacyMode {
  switch (mode) {
    case 'standard':
      return 'precise';
    case 'strict':
      return 'zone';
  }
}
