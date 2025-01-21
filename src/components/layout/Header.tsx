import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { UserMenu } from '@/components/layout/UserMenu';
import type { User, AuthUser } from '@/types/user';

export function Header() {
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const transformAuthUser = (authUser: AuthUser): User => ({
    ...authUser,
    name: `${authUser.firstName} ${authUser.lastName}`,
    lastActive: new Date(),
    verificationStatus: authUser.emailVerified ? 'verified' : 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo.png"
                alt="Disco Logo"
                width={32}
                height={32}
              />
              <span className="ml-2 text-xl font-bold text-primary-600">
                DISCO!
              </span>
            </Link>
          </div>

          <div className="flex items-center">
            {isLoading ? (
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
            ) : user ? (
              <UserMenu
                user={transformAuthUser(user)}
                onLogout={handleLogout}
              />
            ) : (
              <div className="space-x-4">
                <Link
                  href="/auth/login"
                  className="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-md bg-white px-4 py-2 text-sm font-medium text-primary-600 hover:bg-gray-50"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
