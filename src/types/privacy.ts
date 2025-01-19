import type { Location } from './location';

export type PrivacyMode = 'precise' | 'approximate' | 'zone';

export interface PrivacySettings {
  mode: PrivacyMode;
  autoDisableDiscovery: boolean;
  progressiveDisclosure: boolean;
  locationSharing: boolean;
  privacyZones: PrivacyZone[];
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

export interface LocationPrivacyOptions {
  sharingEnabled: boolean;
  privacyMode: PrivacyMode;
  autoDisable: boolean;
  progressiveDisclosure: boolean;
}

export interface PrivacyStats {
  activePrivacyZones: number;
  totalLocationsShared: number;
  averagePrivacyScore: number;
  lastLocationUpdate: Date | null;
}
