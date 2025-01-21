export interface MatchPreview {
  id: string;
  name: string;
  profileImage?: string;
  distance: number | null;
  commonInterests: string[];
  lastActive: string;
}

export interface MatchScore {
  total: number;
  criteria: Record<keyof WeightedCriteria, number>;
  commonInterests: string[];
  distance: number | null;
}

export interface Match extends MatchPreview {
  bio: string;
  age: number;
  location: {
    latitude: number;
    longitude: number;
  };
  interests: string[];
  connectionStatus: 'pending' | 'accepted' | 'declined';
  verificationStatus: 'verified' | 'unverified';
  activityPreferences?: {
    type: string;
    timeWindow: 'anytime' | 'now' | '15min' | '30min' | '1hour' | 'today';
  };
  privacySettings?: {
    mode: 'standard' | 'strict';
    bluetoothEnabled: boolean;
  };
  matchScore: MatchScore;
}

export type MatchStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface MatchPreferences {
  maxDistance: number;
  minAge: number;
  maxAge: number;
  interests: string[];
  verifiedOnly: boolean;
  withPhoto: boolean;
  activityType?: string;
  timeWindow?: 'anytime' | 'now' | '15min' | '30min' | '1hour' | 'today';
  privacyMode?: 'standard' | 'strict';
  useBluetoothProximity?: boolean;
}
