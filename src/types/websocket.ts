export interface WebSocketMessage<T = any> {
  type: string;
  payload: T;
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
  onMessage?: (message: WebSocketMessage) => void;
}

export interface WebSocketContextType {
  connected: boolean;
  connecting: boolean;
  send: (message: WebSocketMessage) => void;
  lastMessage: WebSocketMessage | null;
  error: WebSocketError | null;
}

export interface WebSocketProviderProps {
  children: React.ReactNode;
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
}

export type WebSocketEventType = 
  | 'connection'
  | 'message'
  | 'location_update'
  | 'safety_alert'
  | 'match_update'
  | 'chat_message';

export interface WebSocketEvent<T = any> {
  type: WebSocketEventType;
  payload: T;
  timestamp: string;
}
