import type { UserPreferences } from './user';
import type { Location, AppLocationPrivacyMode } from './location';

export interface WeightedCriteria {
  distance: number;
  interests: number;
  verification: number;
  availability: number;
  preferences: number;
  age: number;
  photo: number;
}

export interface MatchScore {
  total: number;
  criteria: {
    distance: number;
    interests: number;
    verification: number;
    availability: number;
    preferences: number;
    age: number;
    photo: number;
  };
}

export interface MatchLocation {
  latitude: number;
  longitude: number;
  privacyMode: AppLocationPrivacyMode;
  timestamp: string;
}

export interface MatchPreferences {
  maxDistance: number;
  ageRange: {
    min: number;
    max: number;
  };
  activityTypes: string[];
  availability: string[];
  gender: string[];
  lookingFor: string[];
  relationshipType: string[];
  verifiedOnly: boolean;
  withPhoto: boolean;
  privacyMode: AppLocationPrivacyMode;
  timeWindow: 'anytime' | 'now' | '15min' | '30min' | '1hour' | 'today';
  useBluetoothProximity: boolean;
}

export interface Match {
  id: string;
  userId: string;
  name: string;
  image: string | null;
  bio: string;
  distance: number;
  matchScore: MatchScore;
  lastActive: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  interests: string[];
  location?: MatchLocation;
  preferences: MatchPreferences;
  connectionStatus: 'pending' | 'accepted' | 'rejected' | 'blocked';
  activityPreferences: {
    type: string;
    timeWindow: string;
    location: string;
    mode: AppLocationPrivacyMode;
    bluetoothEnabled: boolean;
  };
}

export interface MatchPreview extends Match {
  preview: true;
}

export type MatchStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

export interface MatchRequest {
  id: string;
  matchId: string;
  userId: string;
  status: MatchStatus;
  createdAt: Date;
  updatedAt: Date;
}
