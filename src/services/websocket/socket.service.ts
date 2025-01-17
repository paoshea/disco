import { io, Socket } from 'socket.io-client';
import { EmergencyAlert, SafetyCheck } from '@/types/safety';
import { Match } from '@/types/match';
import { Message } from '@/types/chat';

interface WebSocketMessage<T = unknown> {
  type: string;
  data: T;
  timestamp: number;
}

type WebSocketEvents = {
  emergency_alert: EmergencyAlert;
  safety_check: SafetyCheck;
  new_match: Match;
  message: Message;
  typing: { userId: string; isTyping: boolean };
  location_update: { userId: string; lat: number; lng: number };
};

type MessageHandler<T> = (data: T) => void | Promise<void>;

interface SocketError extends Error {
  code?: string;
  description?: string;
}

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;
  private handlers: Map<
    keyof WebSocketEvents,
    Set<MessageHandler<WebSocketEvents[keyof WebSocketEvents]>>
  > = new Map();
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

  async connect(token: string): Promise<Socket> {
    if (!this.socket) {
      const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
      if (!wsUrl) {
        throw new Error('WebSocket URL not configured');
      }

      return new Promise((resolve, reject) => {
        this.socket = io(wsUrl, {
          auth: { token },
          reconnection: true,
          reconnectionAttempts: this.maxReconnectAttempts,
          reconnectionDelay: this.reconnectDelay,
        });

        this.socket.once('connect', () => {
          this.setupEventHandlers();
          resolve(this.socket!);
        });

        this.socket.once('connect_error', (error: SocketError) => {
          reject(new Error(`WebSocket connection failed: ${error.message}`));
        });
      });
    }
    return this.socket;
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason: string) => {
      console.log('WebSocket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, attempt to reconnect
        if (this.socket) {
          try {
            this.socket.connect();
          } catch (error: unknown) {
            const socketError = error as SocketError;
            console.error('Failed to reconnect:', {
              message: socketError.message,
              code: socketError.code,
              description: socketError.description,
            });
          }
        }
      }
    });

    this.socket.on('connect_error', (error: SocketError) => {
      console.error('Connection error:', error);
      this.reconnectAttempts++;
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.disconnect();
      }
    });

    // Safety-related events
    this.socket.on('emergency_alert', (data: EmergencyAlert) => {
      // Use void operator to explicitly ignore the promise
      void this.notifyHandlers('emergency_alert', data);
    });

    this.socket.on('safety_check', (data: SafetyCheck) => {
      void this.notifyHandlers('safety_check', data);
    });

    this.socket.on(
      'message',
      (message: WebSocketMessage<WebSocketEvents[keyof WebSocketEvents]>) => {
        const eventType = message.type as keyof WebSocketEvents;
        const handlers = this.handlers.get(eventType);
        if (handlers) {
          handlers.forEach(handler => {
            try {
              const result = handler(message.data);
              if (result instanceof Promise) {
                void result.catch(error => {
                  console.error(`Error in message handler for ${message.type}:`, error);
                });
              }
            } catch (error) {
              console.error('Error in message handler:', error);
            }
          });
        }
      }
    );
  }

  subscribe<K extends keyof WebSocketEvents>(
    event: K,
    handler: MessageHandler<WebSocketEvents[K]>
  ): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers
      .get(event)
      ?.add(handler as MessageHandler<WebSocketEvents[keyof WebSocketEvents]>);
  }

  unsubscribe<K extends keyof WebSocketEvents>(
    event: K,
    handler: MessageHandler<WebSocketEvents[K]>
  ): void {
    this.handlers
      .get(event)
      ?.delete(handler as MessageHandler<WebSocketEvents[keyof WebSocketEvents]>);
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
    const message: WebSocketMessage<WebSocketEvents[K]> = {
      type: event,
      data,
      timestamp: Date.now(),
    };
    this.socket.emit('message', message);
  }
}

export const socketService = SocketService.getInstance();
