import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { SafetyAlertProvider } from '@/contexts/SafetyAlertContext';
import { SafetyAlertNotification } from '@/components/safety/SafetyAlertNotification';
import { AppRoutes } from '@/routes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <WebSocketProvider>
          <SafetyAlertProvider>
            <AppRoutes />
            <SafetyAlertNotification />
          </SafetyAlertProvider>
        </WebSocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
