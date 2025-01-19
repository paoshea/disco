'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/ui/Logo';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="flex items-center"
                >
                  <Logo />
                </button>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={() => router.push('/profile')}
                className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Profile
              </button>
              <button
                onClick={() => router.push('/safety')}
                className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Safety
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1">{children}</main>
    </div>
  );
};
