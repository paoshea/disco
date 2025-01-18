import { ReactNode } from 'react';
import '@/styles/globals.css';

export const metadata = {
  title: 'Disco',
  description: 'A modern chat application',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
