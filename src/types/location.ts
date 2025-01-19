export type LocationPermissionStatus = 'granted' | 'denied' | 'prompt';

export type LocationPrivacyMode = 'precise' | 'approximate' | 'zone';

export interface Coordinates {
  lat: number;
  lng: number;
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

export interface Address {
  street?: string;
  city: string;
  state: string;
  country: string;
  postalCode?: string;
  formatted?: string;
}

export interface LocationWithAddress extends Location {
  address?: Address;
}

export interface PrivacyZone {
  id: string;
  userId: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // in kilometers
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LocationState {
  location: Location | null;
  error: string | null;
  loading: boolean;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface LocationUpdateEvent {
  type: 'location_update';
  payload: Location;
}
