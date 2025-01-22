import type { User } from './user';

export interface UserPreferences {
  interests: string[];
  gender: string[];
  lookingFor: string[];
  relationshipType: string[];
  maxDistance: number;
  ageRange: {
    min: number;
    max: number;
  };
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
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
}

export interface PreferencesUpdateResponse<T = UserPreferences> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface PreferencesServiceInterface {
  getUserPreferences(userId: string): Promise<UserPreferences>;
  updatePreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<PreferencesUpdateResponse>;
  resetPreferences(userId: string): Promise<PreferencesUpdateResponse>;
}
