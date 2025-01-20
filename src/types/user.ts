import type { EmergencyContact } from './safety';

// Core user fields that are always required
export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  avatar?: string;
}

// Full user type with all optional fields
export interface User extends BaseUser {
  bio?: string;
  interests?: string[];
  phoneNumber?: string;
  emergencyContacts?: EmergencyContact[];
  notifications?: {
    matches: boolean;
    messages: boolean;
    events: boolean;
    safety: boolean;
  };
  preferences?: UserPreferences;
  location: {
    latitude: number;
    longitude: number;
    lastUpdated: Date;
  };
  verificationStatus: 'verified' | 'unverified';
  stats?: {
    responseRate: number;
    meetupSuccessRate: number;
    matchRate: number;
    lastActive: Date;
  };
  age?: number;
  name: string;
  lastActive: string;
  activityPreferences?: {
    type: string;
    timeWindow: 'anytime' | 'now' | '15min' | '30min' | '1hour' | 'today';
  };
  privacySettings?: {
    mode: 'standard' | 'strict';
    bluetoothEnabled: boolean;
  };
}

export interface UserSettings {
  discoveryRadius: number;
  ageRange: {
    min: number;
    max: number;
  };
  privacy: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    showLocation: boolean;
    showAge: boolean;
  };
  notifications: {
    matches: boolean;
    messages: boolean;
    meetupReminders: boolean;
    safetyAlerts: boolean;
  };
  safety: {
    requireVerifiedMatch: boolean;
    meetupCheckins: boolean;
    emergencyContactAlerts: boolean;
  };
}

export type UserPreferences = {
  ageRange: {
    min: number;
    max: number;
  };
  maxDistance: number;
  interests: string[];
  gender: string[];
  lookingFor: string[];
  relationshipType: string[];
  notifications: {
    matches: boolean;
    messages: boolean;
    events: boolean;
    safety: boolean;
  };
  privacy: {
    showOnlineStatus: boolean;
    showLastSeen: boolean;
    showLocation: boolean;
    showAge: boolean;
  };
  safety: {
    requireVerifiedMatch: boolean;
    meetupCheckins: boolean;
    emergencyContactAlerts: boolean;
  };
};
