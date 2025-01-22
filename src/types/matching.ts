export interface Match {
  id: string;
  userId: string;
  name: string;
  matchScore: number;
  commonInterests: string[];
  lastActive: string;
  status: MatchStatus;
  bio?: string;
  recentActivities?: string[];
}

export type MatchStatus = 'pending' | 'accepted' | 'declined' | 'blocked';

export interface MatchRequest {
  id: string;
  matchId: string;
  userId: string;
  status: MatchStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchPreferences {
  userId: string;
  activityTypes: string[];
  maxDistance: number;
  ageRange: [number, number];
  availability: string[];
  experienceLevel: string;
  updatedAt: Date;
}
