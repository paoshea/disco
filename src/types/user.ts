import type { EmergencyContact } from './safety';
import type { AppLocationPrivacyMode } from './location';
import type { MatchPreferences } from './match';
import type { UserRole } from '@prisma/client';

// Core user fields that are always required
export interface BaseUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  image: string | null;
  emailVerified: boolean | null;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
  verificationStatus: VerificationStatus;
  role: UserRole;
  streakCount: number;
  password: string | null;
}

// Full user type with all optional fields
export type VerificationStatus = 'unverified' | 'pending' | 'verified';

export interface NotificationPreferences {
  matches: boolean;
  messages: boolean;
  events: boolean;
  safety: boolean;
  push: boolean;
  email: boolean;
  inApp: boolean;
  marketing: boolean;
  friendRequests: boolean;
  comments: boolean;
  likes: boolean;
  visits: boolean;
}

export interface PrivacyPreferences {
  location: AppLocationPrivacyMode;
  profile: 'public' | 'private';
  showOnlineStatus: boolean;
  showLastSeen: boolean;
  showLocation: boolean;
  showAge: boolean;
}

export interface SafetyPreferences {
  blockedUsers: string[];
  reportedUsers: string[];
  requireVerifiedMatch: boolean;
  meetupCheckins: boolean;
  emergencyContactAlerts: boolean;
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
  privacy: PrivacyPreferences;
  safety: SafetyPreferences;
  language: string;
  timezone: string;
}

export interface User extends BaseUser {
  bio?: string;
  phoneNumber?: string;
  emergencyContacts?: EmergencyContact[];
  notificationPrefs: NotificationPreferences;
  preferences: UserPreferences;
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

export interface UserProfile
  extends Omit<User, 'email' | 'emailVerified' | 'role'> {
  preview: true;
}
