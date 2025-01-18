import { EmergencyAlert, SafetyCheck } from './safety';
import { Match } from './match';
import { Message } from './chat';

export type WebSocketPayload =
  | EmergencyAlert
  | SafetyCheck
  | Match
  | Message
  | { userId: string; isTyping: boolean }
  | { userId: string; lat: number; lng: number };

export enum WebSocketEventType {
  CONNECTION = 'connection',
  MESSAGE = 'message',
  LOCATION_UPDATE = 'location_update',
  SAFETY_ALERT = 'safety_alert',
  MATCH_UPDATE = 'match_update',
  CHAT_MESSAGE = 'chat_message',
  EMERGENCY_ALERT = 'emergency_alert',
  SAFETY_CHECK = 'safety_check',
  TYPING = 'typing',
}

export interface WebSocketMessage<T = WebSocketPayload> {
  type: WebSocketEventType;
  payload: T;
  timestamp: string;
}

export interface WebSocketError {
  code: number;
  reason: string;
  wasClean: boolean;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: WebSocketError) => void;
  onMessage?: <T extends WebSocketPayload>(
    message: WebSocketMessage<T>
  ) => void;
}

export interface WebSocketContextType {
  connected: boolean;
  connecting: boolean;
  send: <T extends WebSocketPayload>(message: WebSocketMessage<T>) => void;
  lastMessage: WebSocketMessage | null;
  error: WebSocketError | null;
}

export interface WebSocketProviderProps {
  children: React.ReactNode;
  url: string;
  onMessage?: <T extends WebSocketPayload>(
    message: WebSocketMessage<T>
  ) => void;
}
