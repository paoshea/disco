import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';
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
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect to WebSocket';
      setError(errorMessage);
      console.error('WebSocket connection error:', err);
    }
  };

  const handleConnectionError = (err: Error) => {
    setIsConnected(false);
    setError(`Connection error: ${err.message}`);
    
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectTimeoutId.current = setTimeout(() => {
        reconnectAttempts.current += 1;
        connect();
      }, reconnectInterval);
    } else {
      setError('Max reconnection attempts reached. Please refresh the page.');
    }
  };

  useEffect(() => {
    if (!user?.id) return;

    connect();

    const handleConnect = () => {
      setIsConnected(true);
      setError(null);
      reconnectAttempts.current = 0;
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setError('Disconnected from server');
    };

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);
    socketService.on('error', handleConnectionError);

    return () => {
      if (reconnectTimeoutId.current) {
        clearTimeout(reconnectTimeoutId.current);
      }
      socketService.disconnect();
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
      socketService.off('error', handleConnectionError);
    };
  }, [user?.id, url, reconnectInterval, maxReconnectAttempts]);

  const send = <T extends WebSocketEvent>(event: T, data: WebSocketMessage<T>) => {
    if (!isConnected) {
      throw new Error('WebSocket is not connected');
    }
    socketService.emit(event, data);
  };

  const subscribe = <T extends WebSocketEvent>(
    event: T,
    callback: (data: WebSocketMessage<T>) => void
  ) => {
    socketService.on(event, callback);
    return () => socketService.off(event, callback);
  };

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        error,
        send,
        subscribe,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};
