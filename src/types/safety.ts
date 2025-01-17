export type IncidentType = 
  | 'harassment'
  | 'inappropriate'
  | 'impersonation'
  | 'scam'
  | 'emergency'
  | 'safety_check'
  | 'other';

export type IncidentStatus = 
  | 'pending'
  | 'resolved'
  | 'dismissed';

export interface SafetyReport {
  id: string;
  reporterId: string;
  reportedId: string;
  meetingId?: string;
  type: IncidentType;
  description: string;
  evidence: string[];
  status: IncidentStatus;
  resolution?: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface Evidence {
  id: string;
  reportId: string;
  type: string;
  url: string;
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
  type: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  status: IncidentStatus;
  message?: string;
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
  createdAt: string;
  updatedAt: string;
}
