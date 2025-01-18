import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { UserMenu } from '@/components/layout/UserMenu';

export const Header: React.FC = () => {
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Router will handle redirect after logout
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      // Add a finally block to ensure any necessary cleanup is done
    }
  };

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <Image src="/images/logo.svg" alt="DISCO!" width={32} height={32} />
              <span className="ml-2 text-xl font-bold text-primary-600">DISCO!</span>
            </Link>
          </div>

          <div className="flex items-center">
            {isLoading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            ) : user ? (
              <UserMenu
                user={user}
                onLogout={() => {
                  void handleLogout();
                }}
              />
            ) : (
              <div className="space-x-4">
                <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
