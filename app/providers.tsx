'use client';

import React from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { SafetyAlertProvider } from '@/contexts/SafetyAlertContext';
import { SafetyAlerts } from '@/components/safety/SafetyAlerts';

export function Providers({ children }: { children: React.ReactNode }) {
  const wsUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;
  if (!wsUrl) {
    console.error(
      'WebSocket URL not configured. Please set NEXT_PUBLIC_WEBSOCKET_URL environment variable.'
    );
    return null;
  }

  return (
    <AuthProvider>
      <WebSocketProvider url={wsUrl}>
        <SafetyAlertProvider>
          {children}
          <SafetyAlerts />
        </SafetyAlertProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}
