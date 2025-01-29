export type NotificationType = 'achievement' | 'role_upgrade' | 'milestone' | 'block_expiration';

export interface ProgressNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata: string | null;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}
