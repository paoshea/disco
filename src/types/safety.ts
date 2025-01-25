import type { Location } from './location';
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

export type VerificationStatus =
  | 'unverified'
  | 'pending'
  | 'verified'
  | 'rejected';

export type SafetyAlertType =
  | 'sos'
  | 'meetup'
  | 'location'
  | 'custom'
  | 'emergency';
export type SafetyAlertStatus = 'pending' | 'active' | 'resolved' | 'dismissed';
export type SafetyCheckStatus = 'pending' | 'safe' | 'unsafe' | 'missed';

export interface EmergencyContactNotifyOn {
  sosAlert: boolean;
  meetupStart: boolean;
  meetupEnd: boolean;
  lowBattery: boolean;
  enterPrivacyZone: boolean;
  exitPrivacyZone: boolean;
}

export interface EmergencyContactFormData {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email?: string;
  notifyOn: EmergencyContactNotifyOn;
}

export interface EmergencyContact {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContactInput {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  email?: string;
}

// Old emergency contact type kept for reference
export interface EmergencyContactLegacy {
  id: string;
  userId: string;
  name: string;
  relationship: string;
  phoneNumber: string;
  email?: string;
  notifyOn: {
    sosAlert: boolean;
    meetupStart: boolean;
    meetupEnd: boolean;
    lowBattery: boolean;
    enterPrivacyZone: boolean;
    exitPrivacyZone: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface SafetyAlert {
  id: string;
  userId: string;
  type: SafetyAlertType;
  status: SafetyAlertStatus;
  location?: Location;
  message?: string;
  contactedEmergencyServices: boolean;
  notifiedContacts: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SafetyCheckInput {
  type: 'meetup' | 'location' | 'custom';
  description: string;
  scheduledFor: string;
  location?: Location;
}

export interface SafetyCheck {
  id: string;
  userId: string;
  status: SafetyCheckStatus;
  scheduledTime: string;
  location?: Location;
  notes?: string;
  notifiedContacts: string[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface SafetyReport {
  id: string;
  reporterId: string;
  reportedUserId: string;
  type: 'harassment' | 'inappropriate' | 'spam' | 'scam' | 'other';
  description: string;
  evidence?: Array<{
    type: string;
    url: string;
  }>;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface SafetyReportFormProps {
  reportedUserId: string;
  onSubmit: (report: Partial<SafetyReportNew>) => Promise<void>;
  onCancel: () => void;
}

export interface SafetyFeature {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  requiresPermission?: boolean;
  permissions?: string[];
}

export interface SafetySettings {
  sosAlertEnabled: boolean;
  emergencyContacts: string[];
}

export interface SafetyReportOld {
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

export interface SafetyAlertOld {
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

export interface SafetyCheckOld {
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

export interface SafetySettingsOld {
  emergencyContacts: EmergencyContactLegacy[];
  autoShareLocation: boolean;
  meetupCheckins: boolean;
  sosAlertEnabled: boolean;
  requireVerifiedMatch: boolean;
  blockList: UserBlock[];
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  lastSafetyCheck?: string;
}

export interface SafetySettingsNew {
  autoShareLocation: boolean;
  meetupCheckins: boolean;
  sosAlertEnabled: boolean;
  requireVerifiedMatch: boolean;
  emergencyContacts: EmergencyContact[];
}

export interface EmergencyContactNew {
  id: string;
  name: string;
  phone: string;
  email?: string;
  relationship: string;
  isVerified: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SafetyAlertNew {
  id: string;
  userId: string;
  user?: User;
  type: SafetyAlertType;
  status: 'active' | 'resolved' | 'dismissed';
  location: {
    latitude: number;
    longitude: number;
    accuracy?: number;
    timestamp: Date;
  };
  message?: string;
  contacts?: string[];
  description?: string;
  evidence?: SafetyEvidence[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface SafetyEvidence {
  id: string;
  alertId: string;
  type: 'image' | 'video' | 'audio' | 'text';
  url: string;
  description?: string;
  createdAt: string;
}

export interface SafetyCheckNew {
  id: string;
  userId: string;
  type: 'meetup' | 'location' | 'custom';
  status: 'pending' | 'completed' | 'missed';
  scheduledFor: string;
  completedAt?: string;
  location?: Location;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SafetyReportNew {
  id: string;
  reporterId: string;
  reportedUserId: string;
  type: 'harassment' | 'inappropriate' | 'spam' | 'scam' | 'other';
  description: string;
  evidence?: SafetyEvidence[];
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface SafetyAlertContextType {
  alerts: SafetyAlertNew[];
  loading: boolean;
  error: string | null;
  addAlert: (alert: Partial<SafetyAlertNew>) => Promise<void>;
  dismissAlert: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
}

export interface SafetyCenterProps {
  userId: string;
  safetySettings: SafetySettings;
  onSettingsChange?: (settings: Partial<SafetySettingsNew>) => void;
}

export interface SafetyCheckListProps {
  checks: SafetyCheckNew[];
  onCheckComplete?: (checkId: string) => void;
}

export interface SafetyFeaturesProps {
  user: User;
  settings: SafetySettingsNew;
  onSettingsChange: (settings: Partial<SafetySettingsNew>) => void;
}

export interface EmergencyAlertProps {
  userId: string;
  onAlertTriggered?: (alert: SafetyAlertNew) => void;
}

export interface SafetyReportFormProps {
  reportedUserId: string;
  onSubmit: (report: Partial<SafetyReportNew>) => Promise<void>;
  onCancel: () => void;
}
export type SafetyAlertType = 'emergency' | 'help' | 'location';

export interface SafetyAlertNew {
  id?: string;
  type: SafetyAlertType;
  message: string | null;
  description: string | null;
  priority: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    timestamp: string;
  };
  dismissed: boolean;
  resolved: boolean;
  updatedAt?: Date;
  dismissedAt?: Date | null;
  resolvedAt?: Date | null;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
}

export interface SafetySettings {
  emergencyContacts: EmergencyContact[];
  autoShareLocation?: boolean;
  meetupCheckins?: boolean;
  sosAlertEnabled: boolean;
  requireVerifiedMatch?: boolean;
}
