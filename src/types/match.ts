import { User, UserPreferences } from './user';
import { AppLocationPrivacyMode } from './location';

export interface MatchLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  privacyMode: AppLocationPrivacyMode;
  timestamp: Date;
}

export interface MatchScore {
  total: number;
  distance: number;
  interests: number;
  availability: number;
  activityTypes: number;
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
  timeWindow: 'anytime' | 'today' | 'thisWeek' | 'thisMonth';
  useBluetoothProximity: boolean;
}

export interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  score: MatchScore;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  matchedUser?: User;
  location?: MatchLocation;
  preferences?: MatchPreferences;
}

export interface MatchPreview {
  id: string;
  userId: string;
  matchedUserId: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  score: MatchScore;
  createdAt: Date;
  updatedAt: Date;
  preview: true;
  // User preview fields
  name: string;
  image: string | null;
  distance: number | null;
  lastActive: Date;
  interests: string[];
  location?: MatchLocation;
  preferences?: MatchPreferences;
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
