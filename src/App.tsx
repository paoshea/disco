import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { SafetyAlertProvider } from '@/contexts/SafetyAlertContext';
import { SafetyAlertNotification } from '@/components/safety/SafetyAlertNotification';
import { AppRoutes } from '@/routes';

export const App: React.FC = () => {
  const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
  if (!wsUrl) {
    console.error(
      'WebSocket URL not configured. Please set NEXT_PUBLIC_WEBSOCKET_URL environment variable.'
    );
    return null;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <WebSocketProvider url={wsUrl} reconnectInterval={5000} maxReconnectAttempts={5}>
          <SafetyAlertProvider>
            <AppRoutes />
            <SafetyAlertNotification />
          </SafetyAlertProvider>
        </WebSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
