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
    email: boolean;
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
    blockUnverifiedUsers: boolean;
  };
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
}

export interface PreferencesUpdateResponse {
  success: boolean;
  data?: UserPreferences;
  error?: string;
}

export interface PreferencesServiceInterface {
  getUserPreferences(userId: string): Promise<UserPreferences>;
  updatePreferences(userId: string, preferences: Partial<UserPreferences>): Promise<PreferencesUpdateResponse>;
  resetPreferences(userId: string): Promise<PreferencesUpdateResponse>;
}
