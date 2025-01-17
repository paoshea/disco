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
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
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

export interface SafetyCheck {
  id: string;
  userId: string;
  meetingId?: string;
  scheduledTime: string;
  status: IncidentStatus;
  response?: 'safe' | 'unsafe';
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  notes?: string;
  notifiedContacts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SafetySettings {
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
