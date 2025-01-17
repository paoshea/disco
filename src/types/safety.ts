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
  | 'reviewing'
  | 'resolved'
  | 'dismissed'
  | 'completed'
  | 'active';

export interface SafetyReport {
  id: string;
  reporterId: string;
  reportedId: string;
  meetingId?: string;
  type: IncidentType;
  description: string;
  evidence: Evidence[];
  status: IncidentStatus;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolution?: string;
  location?: string;
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
  userId: string;
  name: string;
  phone: string;
  email?: string;
  relation?: string;
  notifyOn: string[];
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
