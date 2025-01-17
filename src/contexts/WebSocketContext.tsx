import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WebSocketMessage, WebSocketPayload, WebSocketEventType } from '@/types/websocket';

interface WebSocketContextType {
  isConnected: boolean;
  error: string | null;
  send: <T extends WebSocketPayload>(message: WebSocketMessage<T>) => Promise<void>;
  disconnect: () => void;
  reconnect: () => Promise<void>;
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
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const connect = useCallback(async () => {
    try {
      if (!user?.id) {
        throw new Error('Cannot connect: No user ID available');
      }

      const ws = new WebSocket(`${url}?token=${encodeURIComponent(user.id)}`);

      return new Promise<WebSocket>((resolve, reject) => {
        const timeout = setTimeout(() => {
          ws.close();
          reject(new Error('Connection timeout'));
        }, 10000);

        ws.onopen = () => {
          clearTimeout(timeout);
          setIsConnected(true);
          setError(null);
          setReconnectAttempts(0);
          resolve(ws);
        };

        ws.onclose = (event: CloseEvent) => {
          clearTimeout(timeout);
          setIsConnected(false);
          const closeReason = event.reason || 'Connection closed';
          setError(`WebSocket connection closed: ${closeReason}`);

          if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            setTimeout(() => {
              setReconnectAttempts(prev => prev + 1);
              void connect();
            }, delay);
          }
        };

        ws.onerror = (event: Event) => {
          clearTimeout(timeout);
          const errorMessage = event instanceof ErrorEvent ? event.message : 'Unknown error';
          setError(`WebSocket error: ${errorMessage}`);
          reject(new Error(errorMessage));
        };

        ws.onmessage = (event: MessageEvent) => {
          try {
            const data = JSON.parse(event.data);
            if (!data.type || !data.payload) {
              throw new Error('Invalid message format');
            }
            const message = data as WebSocketMessage<WebSocketPayload>;
            handleWebSocketMessage(message);
          } catch (err) {
            console.error('Error handling WebSocket message:', err);
            setError(err instanceof Error ? err.message : 'Error processing message');
          }
        };
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMessage);
      console.error('WebSocket connection error:', errorMessage);
      throw err;
    }
  }, [url, user?.id, reconnectAttempts]);

  const handleWebSocketMessage = useCallback((message: WebSocketMessage<WebSocketPayload>) => {
    switch (message.type) {
      case WebSocketEventType.SAFETY_ALERT:
      case WebSocketEventType.EMERGENCY_ALERT:
        // Handle safety/emergency alerts
        break;
      case WebSocketEventType.LOCATION_UPDATE:
        // Handle location update
        break;
      case WebSocketEventType.CONNECTION:
        // Handle connection status
        break;
      default:
        console.warn('Unhandled WebSocket message type:', message.type);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
      setReconnectAttempts(0);
    }
  }, [socket]);

  const reconnect = useCallback(async () => {
    disconnect();
    setReconnectAttempts(0);
    const newSocket = await connect();
    setSocket(newSocket);
  }, [connect, disconnect]);

  const send = useCallback(
    async <T extends WebSocketPayload>(message: WebSocketMessage<T>): Promise<void> => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket is not connected');
      }

      try {
        socket.send(JSON.stringify(message));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
        setError(errorMessage);
        console.error('Error sending WebSocket message:', err);
        throw err;
      }
    },
    [socket]
  );

  useEffect(() => {
    if (user?.id) {
      void connect().then(setSocket);
    }
    return () => {
      disconnect();
    };
  }, [connect, disconnect, user?.id]);

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
