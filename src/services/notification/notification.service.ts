import { prisma } from '@/lib/prisma';
import { webSocketService } from '../websocket/websocket.service';
import type { Notification, NotificationPreferences } from '@/types/notifications';

export const notificationService = {
  async getNotifications(userId: string): Promise<Notification[]> {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { timestamp: 'desc' },
    });
  },

  async getSettings(userId: string): Promise<NotificationPreferences> {
    return prisma.notificationPreferences.findUnique({
      where: { userId },
    });
  },

  async updateSettings(
    userId: string,
    settings: NotificationPreferences
  ): Promise<NotificationPreferences> {
    return prisma.notificationPreferences.upsert({
      where: { userId },
      update: settings,
      create: { ...settings, userId },
    });
  },

  async markAsRead(notificationId: string): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  },

  async sendNotification(
    userId: string,
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>
  ): Promise<void> {
    const userSettings = await this.getSettings(userId);
    const isQuietHours = this._isInQuietHours(userSettings?.quiet_hours);

    if (isQuietHours) {
      await this.queueNotification(notification);
      return;
    }

    const createdNotification = await prisma.notification.create({
      data: {
        ...notification,
        userId,
        timestamp: new Date(),
        read: false,
      },
    });

    webSocketService.emit('notification', createdNotification);
  },

  async registerPushSubscription(
    userId: string,
    subscription: PushSubscription
  ): Promise<void> {
    await prisma.pushSubscription.upsert({
      where: { userId },
      update: { subscription: JSON.stringify(subscription) },
      create: {
        userId,
        subscription: JSON.stringify(subscription),
      },
    });
  },

  async queueNotification(notification: any): Promise<void> {
    await prisma.notificationQueue.create({
      data: {
        notification: JSON.stringify(notification),
        processAfter: this._getQuietHoursEnd(),
      },
    });
  },

  async processOfflineQueue(): Promise<void> {
    const queuedNotifications = await prisma.notificationQueue.findMany({
      where: {
        processAfter: {
          lte: new Date(),
        },
      },
    });

    for (const queued of queuedNotifications) {
      const notification = JSON.parse(queued.notification);
      await this.sendNotification(notification.userId, notification);
      await prisma.notificationQueue.delete({
        where: { id: queued.id },
      });
    }
  },

  _isInQuietHours(quietHours?: {
    enabled: boolean;
    start: string;
    end: string;
  }): boolean {
    if (!quietHours?.enabled) return false;

    const now = new Date();
    const [startHour, startMinute] = quietHours.start.split(':').map(Number);
    const [endHour, endMinute] = quietHours.end.split(':').map(Number);

    const start = new Date(now);
    start.setHours(startHour, startMinute, 0);

    const end = new Date(now);
    end.setHours(endHour, endMinute, 0);

    if (end < start) {
      end.setDate(end.getDate() + 1);
    }

    return now >= start && now <= end;
  },

  _getQuietHoursEnd(): Date {
    // Implementation depends on your quiet hours logic
    const end = new Date();
    end.setHours(7, 0, 0, 0); // Default to 7 AM
    if (end < new Date()) {
      end.setDate(end.getDate() + 1);
    }
    return end;
  },
};
