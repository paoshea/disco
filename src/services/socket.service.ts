import { io, Socket } from 'socket.io-client';

export class SocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, Function[]> = new Map();

  constructor() {
    const url = process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'http://localhost:8080';

    this.socket = io(url, {
      transports: ['websocket'],
      autoConnect: true,
    });

    // Reconnect existing event handlers
    this.socket.on('connect', () => {
      this.eventHandlers.forEach((handlers, event) => {
        handlers.forEach(handler => {
          this.socket?.on(event, handler);
        });
      });
    });
  }

  public on<T = any>(event: string, handler: (data: T) => void): void {
    if (!this.socket) return;

    // Store handler for reconnection
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(handler);

    this.socket.on(event, handler);
  }

  public off<T = any>(event: string, handler?: (data: T) => void): void {
    if (!this.socket) return;

    if (handler) {
      // Remove specific handler
      this.socket.off(event, handler);
      const handlers = this.eventHandlers.get(event);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    } else {
      // Remove all handlers for this event
      this.socket.off(event);
      this.eventHandlers.delete(event);
    }
  }

  public emit<T = any>(event: string, data: T): void {
    if (!this.socket) return;
    this.socket.emit(event, data);
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();
