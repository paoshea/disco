export interface User {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away' | 'busy';
  emergencyContacts: EmergencyContact[];
  lastSeen?: string;
  createdAt: string;
  updatedAt: string;
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
  createdAt?: string;
  updatedAt?: string;
}
