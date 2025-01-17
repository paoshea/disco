import React, { createContext, useContext, useEffect, useCallback, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { WebSocketMessage } from '@/types/websocket';

interface WebSocketContextType {
  connected: boolean;
  error: string | null;
  sendMessage: (message: WebSocketMessage) => void;
  subscribe: (channel: string, callback: (message: WebSocketMessage) => void) => () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  url: string;
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({
  url,
  children,
}) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscribers, setSubscribers] = useState<Map<string, Set<(message: WebSocketMessage) => void>>>(
    new Map()
  );

  const connect = useCallback(() => {
    try {
      if (!user?.id) return;

      const ws = new WebSocket(`${url}?token=${user.id}`);

      ws.onopen = () => {
        setConnected(true);
        setError(null);
      };

      ws.onclose = () => {
        setConnected(false);
        setError('WebSocket connection closed');
        // Attempt to reconnect after 5 seconds
        setTimeout(() => connect(), 5000);
      };

      ws.onerror = (event) => {
        setError('WebSocket error occurred');
        console.error('WebSocket error:', event);
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          const { channel } = message;

          if (channel && subscribers.has(channel)) {
            const channelSubscribers = subscribers.get(channel);
            channelSubscribers?.forEach((callback) => callback(message));
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      setSocket(ws);

      return () => {
        ws.close();
      };
    } catch (err) {
      console.error('Error connecting to WebSocket:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'An error occurred while connecting to WebSocket'
      );
    }
  }, [url, user?.id, subscribers]);

  useEffect(() => {
    const cleanup = connect();
    return () => cleanup?.();
  }, [connect]);

  const sendMessage = useCallback(
    (message: WebSocketMessage) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        console.error('WebSocket is not connected');
        return;
      }

      try {
        socket.send(JSON.stringify(message));
      } catch (err) {
        console.error('Error sending WebSocket message:', err);
        setError(
          err instanceof Error
            ? err.message
            : 'An error occurred while sending message'
        );
      }
    },
    [socket]
  );

  const subscribe = useCallback(
    (channel: string, callback: (message: WebSocketMessage) => void) => {
      setSubscribers((prev) => {
        const channelSubscribers = prev.get(channel) || new Set();
        channelSubscribers.add(callback);
        return new Map(prev).set(channel, channelSubscribers);
      });

      return () => {
        setSubscribers((prev) => {
          const channelSubscribers = prev.get(channel);
          if (channelSubscribers) {
            channelSubscribers.delete(callback);
            if (channelSubscribers.size === 0) {
              const newMap = new Map(prev);
              newMap.delete(channel);
              return newMap;
            }
            return new Map(prev).set(channel, channelSubscribers);
          }
          return prev;
        });
      };
    },
    []
  );

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        error,
        sendMessage,
        subscribe,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
