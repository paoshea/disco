import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';

interface WebSocketOptions {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  protocols?: string | string[];
  onMessage?: (data: WebSocketData) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

interface WebSocketData {
  type: string;
  payload: unknown;
}

interface WebSocketState {
  isConnected: boolean;
  error: Error | null;
  lastMessage: WebSocketData | null;
}

export const useWebSocket = ({
  url,
  reconnectInterval = 5000,
  maxReconnectAttempts = 5,
  protocols,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
}: WebSocketOptions) => {
  const { user } = useAuth();
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    error: null,
    lastMessage: null,
  });

  const ws = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutId = useRef<NodeJS.Timeout>();

  const connect = useCallback(() => {
    try {
      const token = localStorage.getItem('token');
      const wsUrl = new URL(url);
      if (token && user?.id) {
        wsUrl.searchParams.append('token', token);
        wsUrl.searchParams.append('userId', user.id);
      }

      ws.current = new WebSocket(wsUrl.toString(), protocols);

      ws.current.onopen = () => {
        setState(prev => ({ ...prev, isConnected: true, error: null }));
        reconnectAttempts.current = 0;
        onConnect?.();
      };

      ws.current.onclose = () => {
        setState(prev => ({ ...prev, isConnected: false }));
        onDisconnect?.();

        if (reconnectAttempts.current < maxReconnectAttempts) {
          reconnectTimeoutId.current = setTimeout(() => {
            reconnectAttempts.current += 1;
            connect();
          }, reconnectInterval);
        } else {
          setState(prev => ({
            ...prev,
            error: new Error('Max reconnection attempts reached'),
          }));
        }
      };

      ws.current.onerror = (event: Event) => {
        setState(prev => ({
          ...prev,
          error: new Error('WebSocket connection error'),
        }));
        onError?.(event);
      };

      ws.current.onmessage = (event: MessageEvent) => {
        try {
          const data: WebSocketData = JSON.parse(event.data);
          setState(prev => ({ ...prev, lastMessage: data }));
          onMessage?.(data);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
          setState(prev => ({
            ...prev,
            error: new Error('Failed to parse WebSocket message'),
          }));
        }
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to connect to WebSocket');
      setState(prev => ({ ...prev, error }));
    }
  }, [
    url,
    protocols,
    maxReconnectAttempts,
    reconnectInterval,
    user?.id,
    onConnect,
    onDisconnect,
    onError,
    onMessage,
  ]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutId.current) {
      clearTimeout(reconnectTimeoutId.current);
    }

    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }

    setState(prev => ({ ...prev, isConnected: false }));
  }, []);

  const send = useCallback((type: string, payload: unknown) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    ws.current.send(JSON.stringify({ type, payload }));
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    ...state,
    send,
    disconnect,
    reconnect: connect,
  };
};
