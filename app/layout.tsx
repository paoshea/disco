import { ReactNode } from 'react';
import { Providers } from './providers';
import { Toaster } from 'react-hot-toast';
import '@/styles/globals.css';

export const metadata = {
  title: 'Disco',
  description: 'A modern chat application',
  icons: {
    icon: { url: '/app/favicon.svg', type: 'image/svg+xml' },
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  );
}
