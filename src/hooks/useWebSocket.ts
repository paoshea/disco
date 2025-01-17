import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { WebSocketMessage } from '@/types/websocket';

interface WebSocketOptions {
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  protocols?: string | string[];
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

interface WebSocketState {
  isConnected: boolean;
  error: string | null;
  lastMessage: WebSocketMessage | null;
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
            error: 'Maximum reconnection attempts reached',
          }));
        }
      };

      ws.current.onerror = (event: Event) => {
        setState(prev => ({
          ...prev,
          error: 'WebSocket error occurred',
        }));
        onError?.(event);
      };

      ws.current.onmessage = (event: MessageEvent) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          setState(prev => ({ ...prev, lastMessage: message }));
          onMessage?.(message);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
          setState(prev => ({
            ...prev,
            error: err instanceof Error ? err.message : 'An error occurred while parsing message',
          }));
        }
      };
    } catch (err) {
      console.error('Error connecting to WebSocket:', err);
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'An error occurred while connecting to WebSocket',
      }));
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

  const send = useCallback((message: WebSocketMessage) => {
    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return;
    }

    try {
      ws.current.send(JSON.stringify(message));
    } catch (err) {
      console.error('Error sending WebSocket message:', err);
      setState(prev => ({
        ...prev,
        error: err instanceof Error ? err.message : 'An error occurred while sending message',
      }));
    }
  }, [ws]);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    ...state,
    send,
    disconnect,
    reconnect: connect,
  };
};
