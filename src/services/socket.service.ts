import { io, Socket } from 'socket.io-client';
import { EventEmitter } from 'events';

interface SocketEvents {
  connect: () => void;
  disconnect: () => void;
  error: (error: Error) => void;
  message: (data: MessageData) => void;
  notification: (data: NotificationData) => void;
  status: (data: StatusData) => void;
  safety_alert: (data: SafetyAlertData) => void;
  typing: (data: TypingData) => void;
  presence: (data: PresenceData) => void;
  match: (data: MatchData) => void;
}

interface MessageData {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  timestamp: string;
}

interface NotificationData {
  id: string;
  type: 'match' | 'message' | 'safety' | 'system';
  title: string;
  message: string;
  timestamp: string;
  data?: Record<string, unknown>;
}

interface StatusData {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: number;
}

interface SafetyAlertData {
  id: string;
  type: 'sos' | 'check' | 'alert';
  userId: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  timestamp: string;
}

interface TypingData {
  userId: string;
  conversationId: string;
  isTyping: boolean;
}

interface PresenceData {
  userId: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

interface MatchData {
  matchId: string;
  userId: string;
  matchedUserId: string;
  timestamp: string;
}

interface SocketConfig {
  url: string;
  options?: {
    autoConnect?: boolean;
    reconnection?: boolean;
    reconnectionAttempts?: number;
    reconnectionDelay?: number;
    timeout?: number;
  };
}

class SocketService extends EventEmitter {
  private socket: Socket | null = null;
  private config: SocketConfig;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private connected = false;

  constructor(config: SocketConfig) {
    super();
    this.config = config;
  }

  connect(): void {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(this.config.url, {
      autoConnect: false,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 10000,
      ...this.config.options,
    });

    this.setupEventListeners();
    this.socket.connect();
  }

  private setupEventListeners(): void {
    if (!this.socket) {
      return;
    }

    this.socket.on('connect', () => {
      this.connected = true;
      this.reconnectAttempts = 0;
      this.emit('connect');
    });

    this.socket.on('disconnect', () => {
      this.connected = false;
      this.emit('disconnect');
    });

    this.socket.on('error', (error: Error) => {
      this.emit('error', error);
    });

    this.socket.on('message', (data: MessageData) => {
      this.emit('message', data);
    });

    this.socket.on('notification', (data: NotificationData) => {
      this.emit('notification', data);
    });

    this.socket.on('status', (data: StatusData) => {
      this.emit('status', data);
    });

    this.socket.on('safety_alert', (data: SafetyAlertData) => {
      this.emit('safety_alert', data);
    });

    this.socket.on('typing', (data: TypingData) => {
      this.emit('typing', data);
    });

    this.socket.on('presence', (data: PresenceData) => {
      this.emit('presence', data);
    });

    this.socket.on('match', (data: MatchData) => {
      this.emit('match', data);
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  emit<K extends keyof SocketEvents>(event: K, ...args: Parameters<SocketEvents[K]>): boolean {
    if (!this.socket?.connected) {
      console.warn(`Socket not connected. Unable to emit event: ${event}`);
      return false;
    }

    try {
      this.socket.emit(event, ...args);
      return true;
    } catch (error) {
      console.error(`Error emitting event ${event}:`, error);
      return false;
    }
  }

  on<K extends keyof SocketEvents>(event: K, listener: SocketEvents[K]): this {
    super.on(event, listener);
    return this;
  }

  off<K extends keyof SocketEvents>(event: K, listener: SocketEvents[K]): this {
    super.off(event, listener);
    return this;
  }

  isConnected(): boolean {
    return this.connected;
  }

  getSocket(): Socket {
    if (!this.socket) {
      throw new Error('Socket not initialized');
    }
    return this.socket;
  }
}

export const socketService = new SocketService({
  url: process.env.NEXT_PUBLIC_SOCKET_URL || 'ws://localhost:3000',
});
