import type { EmergencyContact } from './safety';
import type { AppLocationPrivacyMode } from './location';
import type { MatchPreferences } from './match';
import type { UserRole } from '@prisma/client';

// Core user fields that are always required
export interface BaseUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  name: string | null;
  image: string | null;
  emailVerified: boolean | null;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  role: UserRole;
  streakCount: number;
  password: string | null;
}

// Full user type with all optional fields
export interface NotificationPreferences {
  push: boolean;
  email: boolean;
  inApp: boolean;
  matches: boolean;
  messages: boolean;
  events: boolean;
  safety: boolean;
}

export interface UserPreferences {
  maxDistance: number;
  ageRange: {
    min: number;
    max: number;
  };
  gender: string[];
  lookingFor: string[];
  relationshipType: string[];
  activityTypes: string[];
  availability: string[];
  verifiedOnly: boolean;
  withPhoto: boolean;
  notifications: NotificationPreferences;
  privacy: {
    location: AppLocationPrivacyMode;
    profile: 'public' | 'private';
  };
  safety: {
    blockedUsers: string[];
    reportedUsers: string[];
  };
  language: string;
  timezone: string;
}

export interface User extends BaseUser {
  bio?: string;
  phoneNumber?: string;
  emergencyContacts?: {
    id: string;
    name: string;
    phoneNumber: string;
    relationship: string;
    notifyOn?: {
      sosAlert: boolean;
      meetupStart: boolean;
      meetupEnd: boolean;
      lowBattery: boolean;
      enterPrivacyZone: boolean;
      exitPrivacyZone: boolean;
    };
  }[];
  notificationPrefs?: NotificationPreferences;
  preferences?: UserPreferences;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    privacyMode: AppLocationPrivacyMode;
    timestamp: Date;
  };
  stats?: {
    responseRate: number;
    meetupSuccessRate: number;
    reportCount: number;
    lastActive: Date;
  };
  safetyEnabled: boolean;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  privacyMode: AppLocationPrivacyMode;
  timestamp: Date;
}

export interface UserSettings {
  theme: string;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    matches: boolean;
    messages: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    locationSharing: boolean;
    activityVisibility: 'public' | 'private' | 'friends';
  };
  safety: {
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
    blockUnverifiedUsers: boolean;
  };
}

export interface UserProfile extends Omit<User, 'email' | 'emailVerified' | 'role'> {
  preview: true;
}
