import { prisma } from '@/lib/prisma';
import type {
  Notification,
  NotificationPreferences,
  PushSubscriptionData,
} from '@/types/notifications';
import { webpush } from '@/lib/webpush';
import { Prisma } from '@prisma/client';

class NotificationService {
  async getNotifications(userId: string): Promise<Notification[]> {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: [{ timestamp: 'desc' }],
    });

    return notifications.map(notification => ({
      id: notification.id,
      userId: notification.userId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      read: notification.read,
      actionUrl: notification.actionUrl || undefined,
      data: notification.data as Record<string, any> | undefined,
      createdAt: notification.timestamp,
      updatedAt: notification.updatedAt,
    }));
  }

  async getSettings(userId: string): Promise<NotificationPreferences> {
    const preferences = await prisma.notificationPreferences.findUnique({
      where: { userId },
    });

    if (!preferences) {
      // Return default preferences if none exist
      const defaultPrefs: NotificationPreferences = {
        userId,
        pushEnabled: true,
        emailEnabled: true,
        categories: {
          matches: true,
          messages: true,
          events: true,
          system: true,
          safety: true,
        },
        quiet_hours: {
          enabled: false,
          start: '22:00',
          end: '07:00',
        },
      };

      // Create default preferences in database
      await prisma.notificationPreferences.create({
        data: {
          userId,
          pushEnabled: defaultPrefs.pushEnabled,
          emailEnabled: defaultPrefs.emailEnabled,
          categories: defaultPrefs.categories as Prisma.InputJsonValue,
          quiet_hours: defaultPrefs.quiet_hours as Prisma.InputJsonValue,
        },
      });

      return defaultPrefs;
    }

    return {
      userId: preferences.userId,
      pushEnabled: preferences.pushEnabled,
      emailEnabled: preferences.emailEnabled,
      categories:
        preferences.categories as NotificationPreferences['categories'],
      quiet_hours:
        preferences.quiet_hours as NotificationPreferences['quiet_hours'],
    };
  }

  async updateSettings(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    const updatedPreferences = await prisma.notificationPreferences.upsert({
      where: { userId },
      create: {
        userId,
        pushEnabled: preferences.pushEnabled ?? true,
        emailEnabled: preferences.emailEnabled ?? true,
        categories: {
          matches: preferences.categories?.matches ?? true,
          messages: preferences.categories?.messages ?? true,
          events: preferences.categories?.events ?? true,
          system: preferences.categories?.system ?? true,
          safety: preferences.categories?.safety ?? true,
        } as Prisma.InputJsonValue,
        quiet_hours: {
          enabled: preferences.quiet_hours?.enabled ?? false,
          start: preferences.quiet_hours?.start ?? '22:00',
          end: preferences.quiet_hours?.end ?? '07:00',
        } as Prisma.InputJsonValue,
      },
      update: {
        pushEnabled: preferences.pushEnabled,
        emailEnabled: preferences.emailEnabled,
        categories: preferences.categories as Prisma.InputJsonValue,
        quiet_hours: preferences.quiet_hours as Prisma.InputJsonValue,
      },
    });

    return {
      userId: updatedPreferences.userId,
      pushEnabled: updatedPreferences.pushEnabled,
      emailEnabled: updatedPreferences.emailEnabled,
      categories:
        updatedPreferences.categories as NotificationPreferences['categories'],
      quiet_hours:
        updatedPreferences.quiet_hours as NotificationPreferences['quiet_hours'],
    };
  }

  async markAsRead(userId: string, notificationId: string): Promise<void> {
    await prisma.notification.update({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
      },
    });
  }

  async queueNotification(
    userId: string,
    notification: Pick<Notification, 'type' | 'title' | 'message'>
  ): Promise<void> {
    const createdNotification = await prisma.notification.create({
      data: {
        userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        read: false,
        timestamp: new Date(),
      },
    });

    // Get user's notification preferences
    const preferences = await this.getSettings(userId);

    // Check if notifications are enabled for this type
    if (
      !preferences.categories[
        notification.type as keyof typeof preferences.categories
      ]
    ) {
      return;
    }

    // Check quiet hours
    if (preferences.quiet_hours.enabled) {
      const now = new Date();
      const currentTime = now.getHours() * 60 + now.getMinutes();
      const startTime = this._parseTime(preferences.quiet_hours.start);
      const endTime = this._parseTime(preferences.quiet_hours.end);

      if (this._isInQuietHours(currentTime, startTime, endTime)) {
        return;
      }
    }

    // Send push notification if enabled
    if (preferences.pushEnabled) {
      const subscription = await prisma.pushSubscription.findFirst({
        where: { userId },
      });

      if (subscription) {
        const subscriptionData = JSON.parse(
          subscription.subscription
        ) as PushSubscriptionData;

        try {
          await webpush.sendNotification(
            {
              endpoint: subscriptionData.endpoint,
              keys: {
                p256dh: subscriptionData.keys.p256dh,
                auth: subscriptionData.keys.auth,
              },
            },
            JSON.stringify({
              title: notification.title,
              body: notification.message,
              data: {
                notificationId: createdNotification.id,
              },
            })
          );
        } catch (error) {
          console.error('Failed to send push notification:', error);
        }
      }
    }

    // Send email notification if enabled
    if (preferences.emailEnabled) {
      // TODO: Implement email notification sending
    }
  }

  private _parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private _isInQuietHours(
    currentTime: number,
    startTime: number,
    endTime: number
  ): boolean {
    if (startTime <= endTime) {
      return currentTime >= startTime && currentTime <= endTime;
    } else {
      // Handle case where quiet hours span midnight
      return currentTime >= startTime || currentTime <= endTime;
    }
  }
}

export const notificationService = new NotificationService();
