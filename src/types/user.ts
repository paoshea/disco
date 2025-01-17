export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  phoneNumber?: string;
  avatar?: string;
  bio?: string;
  interests: string[];
  status: 'online' | 'offline' | 'away' | 'busy';
  emergencyContacts: EmergencyContact[];
  verificationStatus: 'unverified' | 'pending' | 'verified' | 'rejected';
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
}

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

export type UserPreferences = {
  ageRange: {
    min: number;
    max: number;
  };
  maxDistance: number;
  interests: string[];
  eventTypes: string[];
  notifications: {
    matches: boolean;
    messages: boolean;
    events: boolean;
    safety: boolean;
  };
};

export interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email: string;
  notifyOn: {
    sosAlert: boolean;
    meetupStart: boolean;
    meetupEnd: boolean;
  };
  createdAt?: string;
  updatedAt?: string;
}
