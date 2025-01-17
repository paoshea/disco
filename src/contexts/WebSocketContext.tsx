import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface WebSocketContextType {
  send: (event: string, data: any) => void;
  on: (event: string, callback: (data: any) => void) => void;
  off: (event: string, callback: (data: any) => void) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const ws = useRef<WebSocket | null>(null);
  const listeners = useRef<Map<string, Set<(data: any) => void>>>(new Map());

  useEffect(() => {
    if (!user?.id) return;

    const connect = () => {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ws?userId=${user.id}`;
      ws.current = new WebSocket(wsUrl);

      ws.current.onmessage = (event) => {
        try {
          const { type, data } = JSON.parse(event.data);
          const eventListeners = listeners.current.get(type);
          if (eventListeners) {
            eventListeners.forEach((callback) => callback(data));
          }
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      };

      ws.current.onclose = () => {
        // Reconnect after 1 second
        setTimeout(connect, 1000);
      };
    };

    connect();

    return () => {
      ws.current?.close();
    };
  }, [user?.id]);

  const send = (event: string, data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: event, data }));
    }
  };

  const on = (event: string, callback: (data: any) => void) => {
    if (!listeners.current.has(event)) {
      listeners.current.set(event, new Set());
    }
    listeners.current.get(event)!.add(callback);
  };

  const off = (event: string, callback: (data: any) => void) => {
    const eventListeners = listeners.current.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        listeners.current.delete(event);
      }
    }
  };

  return (
    <WebSocketContext.Provider value={{ send, on, off }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
