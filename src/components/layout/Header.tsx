import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { UserMenu } from '@/components/layout/UserMenu';

export function Header() {
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="flex flex-1 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/images/logo.svg"
              alt="Disco Logo"
              width={32}
              height={32}
            />
            <span className="hidden font-bold sm:inline-block">Disco</span>
          </Link>

          <nav className="flex items-center space-x-6">
            {!isLoading && user && (
              <>
                <Link
                  href="/matches"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Matches
                </Link>
                <Link
                  href="/messages"
                  className="text-sm font-medium transition-colors hover:text-primary"
                >
                  Messages
                </Link>
                <UserMenu
                  user={user}
                  onLogout={() => {
                    void handleLogout();
                  }}
                />
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
