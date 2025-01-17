import type { AppProps } from 'next/app';
import { AuthProvider } from '@/contexts/AuthContext';
import { WebSocketProvider } from '@/contexts/WebSocketContext';
import { SafetyAlertProvider } from '@/contexts/SafetyAlertContext';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <WebSocketProvider
        url={process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws'}
      >
        <SafetyAlertProvider>
          <Component {...pageProps} />
        </SafetyAlertProvider>
      </WebSocketProvider>
    </AuthProvider>
  );
}
