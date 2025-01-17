import { User } from './user';

export type IncidentType =
  | 'harassment'
  | 'inappropriate'
  | 'impersonation'
  | 'scam'
  | 'emergency'
  | 'safety_check'
  | 'other';

export type IncidentStatus = 'pending' | 'resolved' | 'dismissed';

export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface SafetyReport {
  id: string;
  reporterId: string;
  reportedId: string;
  meetingId?: string;
  type: IncidentType;
  description: string;
  evidence: Evidence[];
  status: IncidentStatus;
  resolution?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface Evidence {
  id: string;
  reportId: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  url: string;
  thumbnail?: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface SafetyAlert {
  id: string;
  userId: string;
  type: 'emergency' | 'warning' | 'info';
  message: string;
  createdAt: Date;
  resolvedAt?: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface SafetyCheck {
  id: string;
  userId: string;
  type: 'meetup' | 'checkin' | 'custom';
  status: 'pending' | 'completed' | 'missed';
  scheduledFor: Date;
  completedAt?: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  isVerified: boolean;
  isPrimary: boolean;
}

export interface UserBlock {
  id: string;
  blockerId: string;
  blockedId: string;
  reason?: string;
  createdAt: string;
  expiresAt?: string;
}

export interface EmergencyAlert {
  id: string;
  userId: string;
  type: 'sos' | 'meetup' | 'safety_check';
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  status: IncidentStatus;
  message?: string;
  contactedEmergencyServices: boolean;
  notifiedContacts: string[];
  createdAt: string;
  resolvedAt?: string;
}

export interface SafetySettings {
  userId: string;
  autoCheckIn: boolean;
  checkInInterval: number; // in minutes
  emergencyServices: boolean;
  locationSharing: boolean;
  notifyContacts: boolean;
  safetyRadius: number; // in meters
  customSafetyPhrases: string[];
}

export interface SafetySettingsOld {
  emergencyContacts: EmergencyContact[];
  autoShareLocation: boolean;
  meetupCheckins: boolean;
  sosAlertEnabled: boolean;
  requireVerifiedMatch: boolean;
  blockList: UserBlock[];
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  lastSafetyCheck?: string;
}
