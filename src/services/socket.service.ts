import { io, Socket } from 'socket.io-client';

export type WebSocketEvent = 
  | 'connect'
  | 'disconnect'
  | 'error'
  | 'message'
  | 'notification'
  | 'safety_alert'
  | 'typing'
  | 'presence'
  | 'match'
  | string;

export type WebSocketMessage<T extends WebSocketEvent> = T extends 'message'
  ? {
      id: string;
      senderId: string;
      recipientId: string;
      content: string;
      timestamp: string;
    }
  : T extends 'notification'
  ? {
      id: string;
      type: 'match' | 'message' | 'safety' | 'system';
      title: string;
      message: string;
      timestamp: string;
      data?: Record<string, any>;
    }
  : T extends 'safety_alert'
  ? {
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
  : T extends 'typing'
  ? {
      userId: string;
      conversationId: string;
      isTyping: boolean;
    }
  : T extends 'presence'
  ? {
      userId: string;
      status: 'online' | 'offline' | 'away';
      lastSeen?: string;
    }
  : T extends 'match'
  ? {
      matchId: string;
      userId: string;
      matchedUserId: string;
      timestamp: string;
    }
  : Record<string, any>;

interface SocketOptions {
  auth: {
    token: string | null;
    userId: string | undefined;
  };
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

class SocketService {
  private socket: Socket | null = null;
  private handlers: Map<WebSocketEvent, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(url: string, options: SocketOptions): void {
    if (this.socket?.connected) return;

    this.socket = io(url, {
      auth: options.auth,
      reconnection: options.reconnection ?? true,
      reconnectionAttempts: options.reconnectionAttempts ?? this.maxReconnectAttempts,
      reconnectionDelay: options.reconnectionDelay ?? this.reconnectDelay,
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.notifyHandlers('connect', undefined);
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
      this.notifyHandlers('disconnect', undefined);
    });

    this.socket.on('error', (error: Error) => {
      console.error('WebSocket error:', error);
      this.notifyHandlers('error', error);
    });

    // Handle custom events
    ['message', 'notification', 'safety_alert', 'typing', 'presence', 'match'].forEach((event) => {
      this.socket?.on(event, (data: any) => {
        this.notifyHandlers(event as WebSocketEvent, data);
      });
    });
  }

  disconnect(): void {
    if (!this.socket) return;

    this.socket.disconnect();
    this.socket = null;
    this.handlers.clear();
  }

  send<T extends WebSocketEvent>(event: T, data: WebSocketMessage<T>): void {
    if (!this.socket?.connected) {
      console.error('Cannot send message: WebSocket not connected');
      return;
    }

    this.socket.emit(event, data);
  }

  subscribe<T extends WebSocketEvent>(
    event: T,
    callback: (data: WebSocketMessage<T>) => void
  ): () => void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }

    const handlers = this.handlers.get(event)!;
    handlers.add(callback);

    return () => {
      handlers.delete(callback);
      if (handlers.size === 0) {
        this.handlers.delete(event);
      }
    };
  }

  private notifyHandlers<T extends WebSocketEvent>(event: T, data: WebSocketMessage<T>): void {
    const handlers = this.handlers.get(event);
    if (!handlers) return;

    handlers.forEach((handler) => {
      try {
        handler(data);
      } catch (error) {
        console.error(`Error in WebSocket handler for event ${event}:`, error);
      }
    });
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const socketService = new SocketService();
