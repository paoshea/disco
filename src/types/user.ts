export interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  bio: string;
  interests: string[];
  profileImage?: string;
  dateOfBirth: string;
  phoneNumber: string;
  emergencyContacts: EmergencyContact[];
  verificationStatus: {
    email: boolean;
    phone: boolean;
    identity: boolean;
  };
  location?: {
    latitude: number;
    longitude: number;
    lastUpdate: string;
  };
  createdAt: string;
  updatedAt: string;
  onboardingCompleted: boolean;
  onboardingStep: number;
}

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
}

export interface UserSettings {
  discoveryRadius: number;
  ageRange: {
    min: number;
    max: number;
  };
  notifications: {
    matches: boolean;
    messages: boolean;
    nearbyUsers: boolean;
    safetyAlerts: boolean;
  };
  privacy: {
    showLocation: boolean;
    showAge: boolean;
    showLastActive: boolean;
    showVerificationStatus: boolean;
  };
  safety: {
    autoShareLocation: boolean;
    meetupCheckins: boolean;
    sosAlertEnabled: boolean;
    requireVerifiedMatch: boolean;
  };
}
