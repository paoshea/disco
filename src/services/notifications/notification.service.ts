type Permission = 'default' | 'granted' | 'denied';

interface NotificationOptions {
  title: string;
  body: string;
  icon?: string;
  data?: any;
  onClick?: () => void;
}

export class NotificationService {
  private static instance: NotificationService;
  private permission: Permission = 'default';
  private handlers: Map<string, (notification: Notification) => void> = new Map();

  private constructor() {
    this.init();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async init() {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    this.permission = Notification.permission;

    if (this.permission === 'default') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
    }
  }

  public async requestPermission(): Promise<Permission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    this.permission = permission;
    return permission;
  }

  public async show(options: NotificationOptions): Promise<void> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    if (this.permission !== 'granted') {
      console.warn('Notification permission not granted');
      return;
    }

    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon,
      data: options.data,
    });

    if (options.onClick) {
      notification.onclick = options.onClick;
    }

    // Handle notification click for registered handlers
    notification.onclick = event => {
      event.preventDefault();
      if (options.data?.type && this.handlers.has(options.data.type)) {
        this.handlers.get(options.data.type)?.(notification);
      }
      if (options.onClick) {
        options.onClick();
      }
      notification.close();
    };
  }

  public registerHandler(type: string, handler: (notification: Notification) => void) {
    this.handlers.set(type, handler);
  }

  public unregisterHandler(type: string) {
    this.handlers.delete(type);
  }

  public async showMatchNotification(match: { id: string; name: string; profileImage?: string }) {
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
    matchId: string;
    senderName: string;
    content: string;
    senderImage?: string;
  }) {
    await this.show({
      title: `Message from ${message.senderName}`,
      body: message.content,
      icon: message.senderImage,
      data: { type: 'message', matchId: message.matchId },
      onClick: () => {
        window.focus();
        window.location.href = `/chat/${message.matchId}`;
      },
    });
  }

  public async showSafetyAlert(alert: {
    id: string;
    type: 'emergency' | 'warning';
    message: string;
  }) {
    await this.show({
      title: alert.type === 'emergency' ? '🚨 Emergency Alert' : '⚠️ Safety Warning',
      body: alert.message,
      data: { type: 'safety', alertId: alert.id },
      onClick: () => {
        window.focus();
        window.location.href = '/safety';
      },
    });
  }
}
