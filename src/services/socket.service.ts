import { io, Socket } from 'socket.io-client';
import { Message } from '../types/chat';

export class SocketService {
  private socket: Socket | null = null;
  private eventHandlers: Map<string, ((...args: any[]) => void)[]> = new Map();

  connect(url: string): void {
    if (this.socket) {
      console.warn('Socket connection already exists');
      return;
    }

    this.socket = io(url, {
      transports: ['websocket'],
      autoConnect: true,
    });

    // Reconnect existing event handlers
    this.eventHandlers.forEach((handlers, event) => {
      handlers.forEach(handler => {
        this.socket?.on(event, handler);
      });
    });
  }

  disconnect(): void {
    if (!this.socket) {
      console.warn('No socket connection exists');
      return;
    }

    this.socket.disconnect();
    this.socket = null;
  }

  on(event: string, handler: (...args: any[]) => void): void {
    if (!this.socket) {
      console.warn('No socket connection exists');
      return;
    }

    // Store the handler
    const handlers = this.eventHandlers.get(event) || [];
    handlers.push(handler);
    this.eventHandlers.set(event, handlers);

    // Attach the handler
    this.socket.on(event, handler);
  }

  off(event: string, handler: (...args: any[]) => void): void {
    if (!this.socket) {
      console.warn('No socket connection exists');
      return;
    }

    // Remove the handler from storage
    const handlers = this.eventHandlers.get(event) || [];
    const index = handlers.indexOf(handler);
    if (index !== -1) {
      handlers.splice(index, 1);
      if (handlers.length === 0) {
        this.eventHandlers.delete(event);
      } else {
        this.eventHandlers.set(event, handlers);
      }
    }

    // Detach the handler
    this.socket.off(event, handler);
  }

  emit(event: string, ...args: any[]): void {
    if (!this.socket) {
      console.warn('No socket connection exists');
      return;
    }

    this.socket.emit(event, ...args);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();
