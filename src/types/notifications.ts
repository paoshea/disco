import { z } from 'zod';

export const NotificationCategorySchema = z.object({
  matches: z.boolean(),
  messages: z.boolean(),
  events: z.boolean(),
  system: z.boolean(),
  safety: z.boolean(),
});

export const QuietHoursSchema = z.object({
  enabled: z.boolean(),
  start: z.string(),
  end: z.string(),
});

export const NotificationPreferencesSchema = z.object({
  userId: z.string(),
  pushEnabled: z.boolean(),
  emailEnabled: z.boolean(),
  categories: NotificationCategorySchema,
  quiet_hours: QuietHoursSchema,
});

export const NotificationSchema = z.object({
  id: z.string(),
  userId: z.string(),
  type: z.string(),
  title: z.string(),
  message: z.string(),
  read: z.boolean(),
  actionUrl: z.string().optional(),
  data: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const PushSubscriptionDataSchema = z.object({
  endpoint: z.string(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
  userId: z.string(),
});

export type NotificationCategories = z.infer<typeof NotificationCategorySchema>;
export type QuietHours = z.infer<typeof QuietHoursSchema>;
export type NotificationPreferences = z.infer<
  typeof NotificationPreferencesSchema
>;
export type Notification = z.infer<typeof NotificationSchema>;
export type PushSubscriptionData = z.infer<typeof PushSubscriptionDataSchema>;

export type NotificationType =
  | 'match_request'
  | 'message'
  | 'event_invitation'
  | 'event_reminder'
  | 'system_update'
  | 'safety'
  | 'like';

export interface NotificationQueueItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  scheduledFor: Date;
  processed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
