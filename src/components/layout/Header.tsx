import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { UserMenu } from '@/components/layout/UserMenu';
import type { User as AppUser } from '@/types/user';

// Define the auth user type to match useAuth's type
interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  streakCount: number;
  emailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export function Header() {
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const transformAuthUser = (authUser: AuthUser): AppUser => ({
    id: authUser.id,
    email: authUser.email,
    firstName: authUser.firstName,
    lastName: authUser.lastName,
    emailVerified: authUser.emailVerified,
    createdAt: authUser.createdAt || new Date(),
    updatedAt: authUser.updatedAt || new Date(),
    name: `${authUser.firstName} ${authUser.lastName}`,
    lastActive: new Date(),
    verificationStatus: 'pending',
    preferences: {
      maxDistance: 50,
      ageRange: { min: 18, max: 99 },
      interests: [],
      gender: [],
      lookingFor: [],
      relationshipType: [],
      notifications: {
        matches: true,
        messages: true,
        events: true,
        safety: true
      },
      privacy: {
        showOnlineStatus: true,
        showLastSeen: true,
        showLocation: true,
        showAge: true
      },
      safety: {
        requireVerifiedMatch: false,
        meetupCheckins: true,
        emergencyContactAlerts: true
      }
    },
    stats: {
      responseRate: 0,
      meetupSuccessRate: 0,
      matchRate: 0,
      lastActive: new Date()
    }
  });

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image src="/logo.svg" alt="Logo" width={32} height={32} />
          <span className="font-bold">Disco</span>
        </Link>

        <div className="flex flex-1 items-center justify-end space-x-4">
          {isLoading ? (
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
          ) : user ? (
            <UserMenu
              user={transformAuthUser(user as AuthUser)}
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
    </header>
  );
}
