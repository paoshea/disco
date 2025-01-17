import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { socketService, WebSocketEvent, WebSocketMessage } from '@/services/socket.service';

interface WebSocketContextType {
  isConnected: boolean;
  error: string | null;
  send: <T extends WebSocketEvent>(event: T, data: WebSocketMessage<T>) => void;
  subscribe: <T extends WebSocketEvent>(
    event: T,
    callback: (data: WebSocketMessage<T>) => void
  ) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

interface WebSocketProviderProps {
  children: React.ReactNode;
  url: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  children,
  url,
  reconnectInterval = 5000,
  maxReconnectAttempts = 5,
}) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimeoutId = useRef<NodeJS.Timeout>();

  const connect = () => {
    try {
      socketService.connect(url, {
        auth: {
          token: localStorage.getItem('token'),
          userId: user?.id,
        },
        reconnection: true,
        reconnectionAttempts: maxReconnectAttempts,
        reconnectionDelay: reconnectInterval,
      });
    } catch (err) {
      console.error('WebSocket connection error:', err);
      setError('Failed to connect to WebSocket server');
    }
  };

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
      reconnectAttempts.current = 0;
      if (reconnectTimeoutId.current) {
        clearTimeout(reconnectTimeoutId.current);
        reconnectTimeoutId.current = undefined;
      }
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      if (reconnectAttempts.current < maxReconnectAttempts) {
        reconnectTimeoutId.current = setTimeout(() => {
          reconnectAttempts.current += 1;
          connect();
        }, reconnectInterval);
      } else {
        setError('Maximum reconnection attempts reached');
      }
    };

    const handleError = (data: Record<string, any>) => {
      const error = data instanceof Error ? data : new Error(data.message || 'Unknown WebSocket error');
      console.error('WebSocket error:', error);
      setError(error.message);
    };

    // Subscribe to connection events
    const unsubscribeConnect = socketService.subscribe('connect', handleConnect);
    const unsubscribeDisconnect = socketService.subscribe('disconnect', handleDisconnect);
    const unsubscribeError = socketService.subscribe('error', handleError);

    // Initial connection
    connect();

    // Cleanup
    return () => {
      if (reconnectTimeoutId.current) {
        clearTimeout(reconnectTimeoutId.current);
      }
      unsubscribeConnect();
      unsubscribeDisconnect();
      unsubscribeError();
      socketService.disconnect();
    };
  }, [url, reconnectInterval, maxReconnectAttempts, user?.id]);

  const send = <T extends WebSocketEvent>(event: T, data: WebSocketMessage<T>) => {
    if (!isConnected) {
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }
    socketService.send(event, data);
  };

  const subscribe = <T extends WebSocketEvent>(
    event: T,
    callback: (data: WebSocketMessage<T>) => void
  ) => {
    return socketService.subscribe(event, callback);
  };

  const value = {
    isConnected,
    error,
    send,
    subscribe,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};
