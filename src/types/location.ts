export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
  timestamp?: number;
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

export interface Coordinates {
  lat: number;
  lng: number;
}

export type LocationPermissionStatus = 'granted' | 'denied' | 'prompt';

export interface LocationState {
  location: Location | null;
  error: string | null;
  loading: boolean;
  permissionStatus: LocationPermissionStatus;
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
