import { io, Socket } from 'socket.io-client';
import { EmergencyAlert, SafetyCheck } from '@/types/safety';
import { Match } from '@/types/match';
import { Message } from '@/types/chat';

type WebSocketEvents = {
  emergency_alert: EmergencyAlert;
  safety_check: SafetyCheck;
  new_match: Match;
  message: Message;
  typing: { userId: string; isTyping: boolean };
  location_update: { userId: string; lat: number; lng: number };
};

type MessageHandler<T = unknown> = (data: T) => void | Promise<void>;

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;
  private handlers: Map<keyof WebSocketEvents, Set<MessageHandler<any>>> = new Map();
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 1000;

  private constructor() {
    // Private constructor to prevent direct instantiation
  }

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(token: string): Socket {
    if (!this.socket) {
      const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
      if (!wsUrl) {
        throw new Error('WebSocket URL not configured');
      }

      this.socket = io(wsUrl, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectDelay,
      });

      this.setupEventHandlers();
    }
    return this.socket;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', reason => {
      console.log('WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, attempt to reconnect
        this.socket?.connect();
      }
    });

    this.socket.on('connect_error', error => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    // Safety-related events
    this.socket.on('emergency_alert', (data: EmergencyAlert) => {
      void this.notifyHandlers('emergency_alert', data);
    });

    this.socket.on('safety_check', (data: SafetyCheck) => {
      void this.notifyHandlers('safety_check', data);
    });
  }

  subscribe<K extends keyof WebSocketEvents>(
    event: K,
    handler: MessageHandler<WebSocketEvents[K]>
  ): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)?.add(handler);
  }

  unsubscribe<K extends keyof WebSocketEvents>(
    event: K,
    handler: MessageHandler<WebSocketEvents[K]>
  ): void {
    this.handlers.get(event)?.delete(handler);
    if (this.handlers.get(event)?.size === 0) {
      this.handlers.delete(event);
    }
  }

  private async notifyHandlers<K extends keyof WebSocketEvents>(
    event: K,
    data: WebSocketEvents[K]
  ): Promise<void> {
    const handlers = this.handlers.get(event);
    if (!handlers) return;

    const promises = Array.from(handlers).map(async handler => {
      try {
        await handler(data);
      } catch (error) {
        console.error(`Error in ${event} handler:`, error);
      }
    });

    await Promise.all(promises);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.handlers.clear();
      this.reconnectAttempts = 0;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  emit<K extends keyof WebSocketEvents>(event: K, data: WebSocketEvents[K]): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit(event, data);
  }
}

export const socketService = SocketService.getInstance();
