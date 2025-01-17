import { io, Socket } from 'socket.io-client';
import { EmergencyAlert, SafetyCheck } from '@/types/safety';

type MessageHandler = (data: any) => void;

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;
  private handlers: Map<string, Set<MessageHandler>> = new Map();

  private constructor() {}

  static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect(token: string) {
    if (!this.socket) {
      this.socket = io(process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:8081', {
        auth: { token },
      });

      this.setupEventHandlers();
    }
    return this.socket;
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    // Safety-related events
    this.socket.on('emergency_alert', (data: EmergencyAlert) => {
      this.notifyHandlers('emergency_alert', data);
    });

    this.socket.on('safety_check', (data: SafetyCheck) => {
      this.notifyHandlers('safety_check', data);
    });

    // Add more event handlers as needed
  }

  subscribe(event: string, handler: MessageHandler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)?.add(handler);
  }

  unsubscribe(event: string, handler: MessageHandler) {
    this.handlers.get(event)?.delete(handler);
  }

  private notifyHandlers(event: string, data: any) {
    this.handlers.get(event)?.forEach(handler => handler(data));
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  emit(event: string, data: any) {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }
    this.socket.emit(event, data);
  }
}

export const socketService = SocketService.getInstance();
