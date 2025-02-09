type NotificationPermission = 'default' | 'granted' | 'denied';

interface NotificationError extends Error {
  code?: string;
  name: string;
}

interface NotificationData {
  type: string;
  [key: string]: unknown;
}

interface NotificationOptions<T extends NotificationData = NotificationData> {
  title: string;
  body: string;
  recipient?: string;
  scheduledFor?: Date;
  icon?: string;
  data?: T;
  onClick?: () => void | Promise<void>;
}

type NotificationHandler = (notification: Notification) => void | Promise<void>;

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';
  private handlers: Map<string, NotificationHandler> = new Map();
  private readonly storageKey = 'notification_permission';

  private constructor() {
    void this.init();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async init(): Promise<void> {
    if (!this.isSupported()) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (typeof window !== 'undefined') {
      const savedPermission = localStorage.getItem(
        this.storageKey
      ) as NotificationPermission | null;

      if (savedPermission) {
        this.permission = savedPermission;
      } else {
        this.permission = Notification.permission;
        localStorage.setItem(this.storageKey, this.permission);
      }

      if (this.permission === 'default') {
        await this.requestPermission();
      }
    }
  }

  private isSupported(): boolean {
    console.warn('This browser does not support notifications');
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;

      if (typeof window !== 'undefined') {
        localStorage.setItem(this.storageKey, permission);
      }

      return permission;
    } catch (error) {
      const notificationError = error as NotificationError;
      console.error('Error requesting notification permission:', {
        message: notificationError.message,
        name: notificationError.name,
        code: notificationError.code,
      });
      return 'denied';
    }
  }

  public async show<T extends NotificationData>(
    options: NotificationOptions<T>
  ): Promise<void> {
    if (!this.isSupported()) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (this.permission !== 'granted') {
      const permission = await this.requestPermission();
      if (permission !== 'granted') {
        console.warn('Notification permission not granted');
        return;
      }
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon,
        data: options.data,
      });

      await new Promise<void>((resolve, reject) => {
        notification.onclick = async event => {
          event.preventDefault();

          try {
            if (options.data?.type) {
              const handler = this.handlers.get(options.data.type);
              if (handler) {
                await handler(notification);
              }
            }

            if (options.onClick) {
              await Promise.resolve(options.onClick());
            }

            notification.close();
            resolve();
          } catch (error) {
            const notificationError = error as NotificationError;
            console.error('Error handling notification click:', {
              message: notificationError.message,
              name: notificationError.name,
              code: notificationError.code,
            });
            reject(error);
          }
        };

        notification.onerror = error => {
          console.error('Notification error:', error);
          reject(error);
        };
      });
    } catch (error) {
      const notificationError = error as NotificationError;
      console.error('Error showing notification:', {
        message: notificationError.message,
        name: notificationError.name,
        code: notificationError.code,
      });
      throw error;
    }
  }

  public registerHandler(type: string, handler: NotificationHandler): void {
    this.handlers.set(type, handler);
  }

  public unregisterHandler(type: string): void {
    this.handlers.delete(type);
  }

  public async showMatchNotification(match: {
    id: string;
    name: string;
    profileImage?: string;
  }): Promise<void> {
    await this.show({
      title: 'New Match!',
      body: `You matched with ${match.name}`,
      icon: match.profileImage,
      data: { type: 'match', matchId: match.id },
      onClick: () => {
        if (typeof window !== 'undefined') {
          window.focus();
          window.location.href = `/matches/${match.id}`;
        }
      },
    });
  }

  public async showMessageNotification(message: {
    id: string;
    senderId: string;
    senderName: string;
    content: string;
  }): Promise<void> {
    await this.show({
      title: `Message from ${message.senderName}`,
      body: message.content,
      data: {
        type: 'message',
        messageId: message.id,
        senderId: message.senderId,
      },
      onClick: () => {
        if (typeof window !== 'undefined') {
          window.focus();
          window.location.href = `/messages/${message.senderId}`;
        }
      },
    });
  }

  public async showSafetyAlertNotification(alert: {
    id: string;
    userId: string;
    type: string;
    message: string;
  }): Promise<void> {
    await this.show({
      title: 'Safety Alert',
      body: alert.message,
      data: {
        type: 'safety_alert',
        alertId: alert.id,
        userId: alert.userId,
        alertType: alert.type,
      },
      onClick: () => {
        if (typeof window !== 'undefined') {
          window.focus();
          window.location.href = `/safety/alerts/${alert.id}`;
        }
      },
    });
  }
}

export const notificationService = NotificationService.getInstance();

import { prisma } from '@/lib/prisma';

export type LocalNotificationType = 'MILESTONE' | 'ACHIEVEMENT' | 'LEVEL_UP';

export interface LocalProgressNotification {
  id: string;
  userId: string;
  type: LocalNotificationType;
  title: string;
  message: string;
  reward?: {
    type: string;
    value: number;
  };
  createdAt: Date;
  read: boolean;
}

class ProgressNotificationService {
  async createMilestoneNotification(
    userId: string,
    milestone: string,
    reward?: { type: string; value: number }
  ): Promise<LocalProgressNotification> {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type: 'MILESTONE',
        title: 'Milestone Reached!',
        message: `Congratulations! You've reached ${milestone}`,
        metadata: reward ? JSON.stringify(reward) : null,
      },
    });

    if (reward) {
      await this.grantReward(userId, reward);
    }

    return {
      ...notification,
      type: notification.type as LocalNotificationType,
    };
  }

  async grantReward(
    userId: string,
    reward: { type: string; value: number }
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return;

    switch (reward.type) {
      case 'POINTS':
        await prisma.user.update({
          where: { id: userId },
          data: {
            points: {
              increment: reward.value,
            },
          },
        });
        break;
      // Add other reward types here
    }
  }

  async getUnreadNotifications(
    userId: string
  ): Promise<LocalProgressNotification[]> {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        read: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return notifications.map(notification => ({
      ...notification,
      type: notification.type as LocalNotificationType,
    }));
  }

  async markAsRead(notificationId: string): Promise<void> {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
  }
}

export const progressNotificationService = new ProgressNotificationService();
