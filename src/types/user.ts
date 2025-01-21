import type { EmergencyContact } from './safety';
import type { LocationPrivacyMode } from './location';

// Core user fields that are always required
export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string;
  name: string;
  lastActive: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected';
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
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    privacyMode: LocationPrivacyMode;
    timestamp: Date;
  };
  stats?: {
    responseRate: number;
    meetupSuccessRate: number;
    matchRate: number;
    lastActive: Date;
  };
  age?: number;
  activityPreferences?: {
    type: string;
    timeWindow: 'anytime' | 'now' | '15min' | '30min' | '1hour' | 'today';
  };
  privacySettings?: {
    mode: 'standard' | 'strict';
    bluetoothEnabled: boolean;
  };
}

export interface UserPreferences {
  maxDistance: number;
  ageRange: {
    min: number;
    max: number;
  };
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
}

// Minimal user type for components that only need basic info
export type MinimalUser = Pick<User, 'id' | 'email' | 'firstName' | 'lastName'>;

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
