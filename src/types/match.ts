export interface MatchPreview {
  id: string;
  name: string;
  profileImage?: string;
  distance: number;
  commonInterests: string[];
  lastActive: string;
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
}

export interface MatchPreferences {
  maxDistance: number;
  minAge: number;
  maxAge: number;
  interests: string[];
  verifiedOnly: boolean;
  withPhoto: boolean;
}
