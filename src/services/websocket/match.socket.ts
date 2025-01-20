import { io, Socket } from 'socket.io-client';
import { Match, MatchScore } from '@/types/match';

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
  type: 'message';
  message: string;
  matchId: string;
}

interface TypingEvent {
  type: 'typing';
  userId: string;
  matchId: string;
}

interface MessageEventNew {
  matchId: string;
  message: any;
}

interface TypingEventNew {
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

    this.socket = io(process.env.NEXT_PUBLIC_WS_URL!, {
      auth: { token },
      transports: ['websocket'],
      autoConnect: true,
    });

    this.setupEventListeners();
  }

  public disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('match:update', (data: MatchUpdateEvent) => {
      this.notifyListeners('matchUpdate', data);
    });

    this.socket.on('match:action', (data: MatchActionEvent) => {
      this.notifyListeners('matchAction', data);
    });

    this.socket.on('match:score', (data: { matchId: string; score: MatchScore }) => {
      this.notifyListeners('matchScore', data);
    });

    this.socket.on('message', (data: MessageEvent) => {
      this.notifyListeners('message', data);
    });

    this.socket.on('typing', (data: TypingEvent) => {
      this.notifyListeners('typing', data);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
      this.notifyListeners('error', error);
    });
  }

  public subscribeToMatches(callback: (data: MatchUpdateEvent) => void): () => void {
    return this.subscribe('matchUpdate', callback);
  }

  public subscribeToActions(callback: (data: MatchActionEvent) => void): () => void {
    return this.subscribe('matchAction', callback);
  }

  public subscribeToScores(
    callback: (data: { matchId: string; score: MatchScore }) => void
  ): () => void {
    return this.subscribe('matchScore', callback);
  }

  public subscribeToMessages(callback: (data: MessageEvent) => void): () => void {
    return this.subscribe('message', callback);
  }

  public subscribeToTyping(callback: (data: TypingEvent) => void): () => void {
    return this.subscribe('typing', callback);
  }

  public subscribeToMessagesNew(callback: (data: MessageEventNew) => void): () => void {
    if (!this.socket) {
      console.error('Socket not connected');
      return () => {};
    }

    this.socket.on('message', callback);
    return () => {
      this.socket?.off('message', callback);
    };
  }

  public subscribeToTypingNew(callback: (data: TypingEventNew) => void): () => void {
    if (!this.socket) {
      console.error('Socket not connected');
      return () => {};
    }

    this.socket.on('typing', callback);
    return () => {
      this.socket?.off('typing', callback);
    };
  }

  private subscribe(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  public emitMessage(matchId: string, message: string): void {
    this.emit('message', { type: 'message', message, matchId });
  }

  public emitTyping(matchId: string, userId: string): void {
    this.emit('typing', { type: 'typing', userId, matchId });
  }

  public emitMessageNew(matchId: string, message: any): void {
    this.emit('message', { matchId, message });
  }

  public emitTypingNew(matchId: string, userId: string, isTyping: boolean): void {
    this.emit('typing', { matchId, userId, isTyping });
  }

  private emit(event: string, data: any): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit(event, data);
  }

  private notifyListeners(event: string, data: any): void {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }
}
