import { io, Socket } from 'socket.io-client';
import { Match, MatchScore } from '@/types/match';
import { MessageWithSender } from '@/types/chat';

interface MatchUpdateEvent {
  type: 'new' | 'update' | 'remove';
  match: Match;
}

interface MatchActionEvent {
  type: 'accepted' | 'declined' | 'blocked';
  matchId: string;
  userId: string;
}

interface MessageEvent {
  matchId: string;
  message: MessageWithSender;
}

interface TypingEvent {
  matchId: string;
  userId: string;
  isTyping: boolean;
}

export class MatchSocketService {
  private static instance: MatchSocketService;
  private socket: Socket | null = null;
  private listeners: Map<string, Set<Function>> = new Map();

  private constructor() {}

  public static getInstance(): MatchSocketService {
    if (!MatchSocketService.instance) {
      MatchSocketService.instance = new MatchSocketService();
    }
    return MatchSocketService.instance;
  }

  public connect(token: string): void {
    if (this.socket?.connected) return;

    this.socket = io(
      process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'ws://localhost:3001',
      {
        auth: { token },
        transports: ['websocket'],
      }
    );

    this.setupEventListeners();
  }

  public disconnect(): void {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
    this.listeners.clear();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Connected to match websocket');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from match websocket');
    });

    this.socket.on('error', (error: Error) => {
      console.error('Match websocket error:', error);
    });

    this.socket.on('match_update', (data: MatchUpdateEvent) => {
      this.notifyListeners('match_update', data);
    });

    this.socket.on('match_action', (data: MatchActionEvent) => {
      this.notifyListeners('match_action', data);
    });

    this.socket.on('chat_message', (data: MessageEvent) => {
      this.notifyListeners('chat_message', data);
    });

    this.socket.on('typing', (data: TypingEvent) => {
      this.notifyListeners('typing', data);
    });
  }

  public subscribeToMatches(
    callback: (data: MatchUpdateEvent) => void
  ): () => void {
    return this.subscribe('match_update', callback);
  }

  public subscribeToActions(
    callback: (data: MatchActionEvent) => void
  ): () => void {
    return this.subscribe('match_action', callback);
  }

  public subscribeToMessages(
    callback: (data: MessageEvent) => void
  ): () => void {
    return this.subscribe('chat_message', callback);
  }

  public subscribeToTyping(callback: (data: TypingEvent) => void): () => void {
    return this.subscribe('typing', callback);
  }

  private subscribe(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const eventListeners = this.listeners.get(event)!;
    eventListeners.add(callback);

    if (this.socket) {
      this.socket.on(event, callback as any);
    }

    return () => {
      if (this.socket) {
        this.socket.off(event, callback as any);
      }
      eventListeners.delete(callback);
    };
  }

  public emitMessage(matchId: string, message: string): void {
    if (!this.socket?.connected) return;
    this.socket.emit('chat_message', { matchId, message });
  }

  public emitTyping(matchId: string, isTyping: boolean): void {
    if (!this.socket?.connected) return;
    this.socket.emit('typing', { matchId, isTyping });
  }

  public emitMatchAction(
    matchId: string,
    action: 'accept' | 'decline' | 'block'
  ): void {
    if (!this.socket?.connected) return;
    this.socket.emit('match_action', { matchId, action });
  }

  private notifyListeners(event: string, data: any): void {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }
}
