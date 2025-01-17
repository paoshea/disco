type NotificationPermission = 'default' | 'granted' | 'denied';

interface NotificationData {
  type: string;
  [key: string]: unknown;
}

interface NotificationOptions<T extends NotificationData = NotificationData> {
  title: string;
  body: string;
  icon?: string;
  data?: T;
  onClick?: () => void;
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

    // Load saved permission from storage
    const savedPermission = localStorage.getItem(this.storageKey) as NotificationPermission | null;
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

  private isSupported(): boolean {
    return 'Notification' in window;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      localStorage.setItem(this.storageKey, permission);
      return permission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  }

  public async show<T extends NotificationData>(options: NotificationOptions<T>): Promise<void> {
    if (!this.isSupported()) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    try {
      const notification = new Notification(options.title, {
        body: options.body,
        icon: options.icon,
        data: options.data,
      });

      notification.onclick = async event => {
        event.preventDefault();

        if (options.data?.type) {
          const handler = this.handlers.get(options.data.type);
          if (handler) {
            try {
              await handler(notification);
            } catch (error) {
              console.error(`Error in notification handler for type ${options.data.type}:`, error);
            }
          }
        }

        if (options.onClick) {
          try {
            options.onClick();
          } catch (error) {
            console.error('Error in onClick handler:', error);
          }
        }

        notification.close();
      };
    } catch (error) {
      console.error('Error showing notification:', error);
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
        window.focus();
        window.location.href = `/matches/${match.id}`;
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
      data: { type: 'message', messageId: message.id, senderId: message.senderId },
      onClick: () => {
        window.focus();
        window.location.href = `/messages/${message.senderId}`;
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
        window.focus();
        window.location.href = `/safety/alerts/${alert.id}`;
      },
    });
  }
}

export const notificationService = NotificationService.getInstance();
