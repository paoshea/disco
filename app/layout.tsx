import { ReactNode } from 'react';
import { Providers } from './providers';
import '@/styles/globals.css';

export const metadata = {
  title: 'Disco',
  description: 'A modern chat application',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
