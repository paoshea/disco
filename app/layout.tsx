import { ReactNode } from 'react';
import { Providers } from './providers';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '@/styles/globals.css';

export const metadata = {
  title: 'Disco',
  description: 'A modern chat application',
  icons: {
    icon: [
      { url: '/app/favicon.svg', type: 'image/svg+xml' },
      { url: '/images/disco-logo.svg', type: 'image/svg+xml', sizes: 'any' },
    ],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/app/favicon.svg" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
          {children}
          <ToastContainer position="top-right" autoClose={3000} />
        </Providers>
      </body>
    </html>
  );
}
