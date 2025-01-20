import { Socket, io } from 'socket.io-client';
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

  private subscribe(event: string, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  private notifyListeners(event: string, data: any): void {
    this.listeners.get(event)?.forEach(callback => callback(data));
  }
}
