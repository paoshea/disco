import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WebSocketMessage } from '@/types/websocket';

interface WebSocketContextType {
  isConnected: boolean;
  error: string | null;
  send: (message: WebSocketMessage<any>) => void;
  disconnect: () => void;
  reconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  url: string;
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ url, children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(() => {
    try {
      const ws = new WebSocket(`${url}?token=${user?.id}`);

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setError('WebSocket connection closed');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => connect(), 5000);
      };

      ws.onerror = event => {
        setError('WebSocket error occurred');
        console.error('WebSocket error:', event);
      };

      ws.onmessage = event => {
        try {
          const message: WebSocketMessage<any> = JSON.parse(event.data);
          console.log('WebSocket message received:', message);
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      setSocket(ws);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to WebSocket');
      console.error('WebSocket connection error:', err);
    }
  }, [url, user?.id]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
    }
  }, [socket]);

  const reconnect = useCallback(() => {
    disconnect();
    connect();
  }, [connect, disconnect]);

  const send = useCallback(
    (message: WebSocketMessage<any>) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        setError('WebSocket is not connected');
        return;
      }

      try {
        socket.send(JSON.stringify(message));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to send message');
        console.error('Error sending WebSocket message:', err);
      }
    },
    [socket]
  );

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  const value = {
    isConnected,
    error,
    send,
    disconnect,
    reconnect,
  };

  return <WebSocketContext.Provider value={value}>{children}</WebSocketContext.Provider>;
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
