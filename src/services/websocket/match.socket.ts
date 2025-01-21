import { io, Socket } from 'socket.io-client';
import { Match } from '@/types/match';
import { MessageWithSender } from '@/types/chat';

interface ServerToClientEvents {
  match_update: (data: MatchUpdateEvent) => void;
  match_action: (data: MatchActionEvent) => void;
  chat_message: (data: MessageEvent) => void;
  typing: (data: TypingEvent) => void;
  error: (error: Error) => void;
  connect: () => void;
  disconnect: () => void;
}

interface ClientToServerEvents {
  chat_message: (data: { matchId: string; message: string }) => void;
  typing: (data: { matchId: string; isTyping: boolean }) => void;
  match_action: (data: {
    matchId: string;
    action: 'accept' | 'decline' | 'block';
  }) => void;
}

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

type EventCallback<T> = (data: T) => void;

type EventMap = {
  match_update: MatchUpdateEvent;
  match_action: MatchActionEvent;
  chat_message: MessageEvent;
  typing: TypingEvent;
};

export class MatchSocketService {
  private static instance: MatchSocketService;
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null =
    null;
  private listeners: Map<keyof EventMap, Set<EventCallback<any>>> = new Map();

  private constructor() {
    // Private constructor for singleton pattern
  }

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
    ) as Socket<ServerToClientEvents, ClientToServerEvents>;

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
    callback: EventCallback<MatchUpdateEvent>
  ): () => void {
    return this.subscribe('match_update', callback);
  }

  public subscribeToActions(
    callback: EventCallback<MatchActionEvent>
  ): () => void {
    return this.subscribe('match_action', callback);
  }

  public subscribeToMessages(
    callback: EventCallback<MessageEvent>
  ): () => void {
    return this.subscribe('chat_message', callback);
  }

  public subscribeToTyping(callback: EventCallback<TypingEvent>): () => void {
    return this.subscribe('typing', callback);
  }

  private subscribe<K extends keyof EventMap>(
    event: K,
    callback: EventCallback<EventMap[K]>
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }

    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return () => {};

    eventListeners.add(callback);

    if (this.socket) {
      const typedCallback = ((data: EventMap[K]) => callback(data)) as (
        ...args: any[]
      ) => void;

      this.socket.on(event as any, typedCallback);

      return () => {
        if (this.socket) {
          this.socket.off(event as any, typedCallback);
        }
        eventListeners.delete(callback);
      };
    }

    return () => {
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

  private notifyListeners<K extends keyof EventMap>(
    event: K,
    data: EventMap[K]
  ): void {
    const listeners = this.listeners.get(event);
    if (!listeners) return;

    listeners.forEach(callback => {
      callback(data);
    });
  }
}
