export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  // Additional fields used in components
  name?: string; // Optional, can be computed from firstName + lastName
  avatar?: string;
  bio?: string;
  interests?: string[];
  phoneNumber?: string;
  emergencyContacts?: EmergencyContact[];
  notifications?: {
    matches: boolean;
    messages: boolean;
    events: boolean;
    safety: boolean;
  };
  preferences?: UserPreferences;
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
  gender: string[];
  lookingFor: string[];
  relationshipType: string[];
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
  sosAlert: boolean;
  meetupStart: boolean;
  meetupEnd: boolean;
  createdAt?: string;
  updatedAt?: string;
}
