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
  const maxReconnectAttempts = 5;

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

  const connectWebSocket = useCallback(async () => {
    if (!user?.id || !url) {
      throw new Error('Cannot connect: Missing user ID or URL');
    }

    try {
      const ws = new WebSocket(url);
      setSocket(ws);

      return new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          ws.close();
          reject(new Error('Connection timeout'));
        }, 10000);

        ws.onopen = () => {
          clearTimeout(timeout);
          setIsConnected(true);
          setError(null);
          setReconnectAttempts(0);
          resolve();
        };

        ws.onclose = () => {
          clearTimeout(timeout);
          setIsConnected(false);
          setSocket(null);

          // Attempt to reconnect if not manually disconnected
          if (reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
            setReconnectAttempts(prev => prev + 1);
            setTimeout(() => {
              void connectWebSocket();
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
            const rawData: unknown = JSON.parse(event.data);

            // Type guard function
            const isValidWebSocketMessage = (data: unknown): data is WebSocketMessage => {
              return (
                typeof data === 'object' &&
                data !== null &&
                'type' in data &&
                'payload' in data &&
                'timestamp' in data &&
                typeof (data as any).type === 'string' &&
                (data as any).type in WebSocketEventType &&
                typeof (data as any).timestamp === 'string'
              );
            };

            if (!isValidWebSocketMessage(rawData)) {
              throw new Error('Invalid message format');
            }

            const message: WebSocketMessage = {
              type: rawData.type,
              payload: rawData.payload,
              timestamp: rawData.timestamp,
            };
            handleWebSocketMessage(message);
          } catch (err) {
            console.error('Error parsing WebSocket message:', err);
          }
        };
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect';
      setError(errorMessage);
      console.error('WebSocket connection error:', errorMessage);
      throw err;
    }
  }, [url, user?.id, reconnectAttempts, handleWebSocketMessage, maxReconnectAttempts]);

  useEffect(() => {
    if (user && url && !isConnected) {
      void connectWebSocket();
    }
    return () => {
      if (socket) {
        socket.close();
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [user, url, isConnected, connectWebSocket]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close();
      setSocket(null);
      setIsConnected(false);
      setReconnectAttempts(0);
    }
  }, [socket]);

  const reconnect = useCallback(async () => {
    if (!socket) return;

    try {
      disconnect();
      setReconnectAttempts(0);
      await connectWebSocket();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reconnect';
      setError(errorMessage);
      console.error('WebSocket reconnection error:', err);
      throw err;
    }
  }, [connectWebSocket, disconnect, socket]);

  const send = useCallback(
    async (message: WebSocketMessage): Promise<void> => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        throw new Error('WebSocket is not connected');
      }
      await new Promise<void>((resolve, reject) => {
        try {
          socket.send(JSON.stringify(message));
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    },
    [socket]
  );

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
