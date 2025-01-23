import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { UserMenu } from '@/components/layout/UserMenu';
import { UserRole } from '@prisma/client';
import { User, NotificationPreferences, UserPreferences } from '@/types/user';
import { AppLocationPrivacyMode } from '@/types/location';

const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  push: true,
  email: true,
  inApp: true,
  matches: true,
  messages: true,
  events: true,
  safety: true,
};

const DEFAULT_PREFERENCES: UserPreferences = {
  maxDistance: 50,
  ageRange: { min: 18, max: 100 },
  interests: [],
  gender: [],
  lookingFor: [],
  relationshipType: [],
  notifications: DEFAULT_NOTIFICATION_PREFS,
  privacy: {
    showOnlineStatus: true,
    showLastSeen: true,
    showLocation: true,
    showAge: true,
    location: 'standard' as AppLocationPrivacyMode,
    profile: 'public',
  },
  safety: {
    requireVerifiedMatch: true,
    meetupCheckins: true,
    emergencyContactAlerts: true,
    blockedUsers: [],
    reportedUsers: [],
  },
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

interface HeaderProps {
  user: User | null;
}

const defaultUser: User = {
  id: '',
  email: '',
  firstName: '',
  lastName: '',
  name: '',
  image: null,
  emailVerified: null,
  lastLogin: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  verificationStatus: 'pending',
  role: 'user',
  streakCount: 0,
  password: '',
  safetyEnabled: false,
  preferences: {
    maxDistance: 50,
    ageRange: { min: 18, max: 100 },
    activityTypes: [],
    gender: [],
    lookingFor: [],
    relationshipType: [],
    availability: [],
    verifiedOnly: false,
    withPhoto: true,
    notifications: DEFAULT_NOTIFICATION_PREFS,
    privacy: {
      location: 'standard',
      profile: 'public',
    },
    safety: {
      blockedUsers: [],
      reportedUsers: [],
    },
    language: 'en',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
  notificationPrefs: DEFAULT_NOTIFICATION_PREFS,
};

export function Header() {
  const { user, isLoading, logout } = useAuth();

  const [preferences, setPreferences] = React.useState<UserPreferences>(DEFAULT_PREFERENCES);

  React.useEffect(() => {
    if (user?.preferences) {
      setPreferences((prev) => ({ ...prev, ...user.preferences }));
    }
  }, [user?.preferences]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) return null;

  const mergedUser: User = {
    ...user,
    notificationPrefs: user.notificationPrefs || DEFAULT_NOTIFICATION_PREFS,
    preferences: user.preferences || DEFAULT_PREFERENCES,
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
