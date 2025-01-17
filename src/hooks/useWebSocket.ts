import { useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

type WebSocketEventHandler = (data: any) => void;

interface WebSocketHook {
  on: (event: string, handler: WebSocketEventHandler) => void;
  off: (event: string, handler: WebSocketEventHandler) => void;
  send: (event: string, data: any) => void;
}

export const useWebSocket = (): WebSocketHook | null => {
  const { user } = useAuth();
  const ws = useRef<WebSocket | null>(null);
  const eventHandlers = useRef<Map<string, Set<WebSocketEventHandler>>>(new Map());

  const connect = useCallback(() => {
    if (!user?.id) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws?userId=${user.id}`;

    ws.current = new WebSocket(wsUrl);

    ws.current.onmessage = event => {
      try {
        const { type, data } = JSON.parse(event.data);
        const handlers = eventHandlers.current.get(type);
        if (handlers) {
          handlers.forEach(handler => handler(data));
        }
      } catch (error) {
        console.error('WebSocket message parsing error:', error);
      }
    };

    ws.current.onclose = () => {
      // Attempt to reconnect after a delay
      setTimeout(connect, 3000);
    };

    ws.current.onerror = error => {
      console.error('WebSocket error:', error);
      ws.current?.close();
    };
  }, [user?.id]);

  useEffect(() => {
    connect();
    return () => {
      ws.current?.close();
    };
  }, [connect]);

  const on = useCallback((event: string, handler: WebSocketEventHandler) => {
    if (!eventHandlers.current.has(event)) {
      eventHandlers.current.set(event, new Set());
    }
    eventHandlers.current.get(event)?.add(handler);
  }, []);

  const off = useCallback((event: string, handler: WebSocketEventHandler) => {
    eventHandlers.current.get(event)?.delete(handler);
  }, []);

  const send = useCallback((event: string, data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify({ type: event, data }));
    }
  }, []);

  if (!ws.current) return null;

  return { on, off, send };
};
