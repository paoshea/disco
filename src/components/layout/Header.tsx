import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { UserMenu } from '@/components/layout/UserMenu';
import { UserRole } from '@prisma/client';
import { User, NotificationPreferences } from '@/types/user';

const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  matches: true,
  messages: true,
  events: true,
  safety: true,
};

interface HeaderProps {
  user: User | null;
}

const defaultUser: User = {
  id: '',
  email: '',
  name: '',
  firstName: '',
  lastName: '',
  image: null,
  emailVerified: null,
  lastLogin: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  verificationStatus: 'pending',
  role: UserRole.user,
  streakCount: 0,
  password: '',
  notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
  preferences: {
    maxDistance: 50,
    ageRange: { min: 18, max: 100 },
    interests: [],
    gender: [],
    lookingFor: [],
    relationshipType: [],
    notifications: {
      matches: true,
      messages: true,
      events: true,
      safety: true,
    },
    privacy: {
      showOnlineStatus: true,
      showLastSeen: true,
      showLocation: true,
      showAge: true,
    },
    safety: {
      requireVerifiedMatch: true,
      meetupCheckins: true,
      emergencyContactAlerts: true,
    },
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
};

export function Header() {
  const { user, isLoading, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) return null;

  const mergedUser: User = {
    ...user,
    notificationPrefs: user.notificationPrefs || DEFAULT_NOTIFICATION_PREFS,
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image
              src="/images/logo.svg"
              alt="Disco Logo"
              width={32}
              height={32}
            />
            <span className="hidden font-bold sm:inline-block">Disco</span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {!isLoading && (
              <>
                <Link
                  href="/discover"
                  className="transition-colors hover:text-foreground/80"
                >
                  Discover
                </Link>
                <Link
                  href="/messages"
                  className="transition-colors hover:text-foreground/80"
                >
                  Messages
                </Link>
                <UserMenu
                  user={mergedUser}
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
