
import { Suspense } from 'react';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import '@/styles/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Disco - Find Your Dance Partner',
  description: 'Connect with dancers and find your perfect dance partner',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          <Suspense fallback={<LoadingSpinner className="w-8 h-8" />}>
            <Layout>
              {children}
            </Layout>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
