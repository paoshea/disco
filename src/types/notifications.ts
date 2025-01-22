export type NotificationType =
  | 'match_request'
  | 'message'
  | 'event_invitation'
  | 'event_reminder'
  | 'system_update';

export interface NotificationPreferences {
  userId: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  categories: {
    matches: boolean;
    messages: boolean;
    events: boolean;
    system: boolean;
  };
  quiet_hours?: {
    enabled: boolean;
    start: string; // HH:mm format
    end: string; // HH:mm format
  };
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  actionUrl?: string;
  data?: Record<string, any>;
}

export interface NotificationAction {
  action: string;
  title: string;
  icon?: string;
}
