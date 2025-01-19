export type PrivacyMode = 'public' | 'private' | 'friends';

export interface PrivacySettings {
  mode: PrivacyMode;
  enabled: boolean;
}

export interface PrivacyZone {
  id: string;
  userId: string;
  name: string;
  radius: number;
  latitude: number;
  longitude: number;
  createdAt: Date;
  updatedAt: Date;
}
