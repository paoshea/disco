import { prisma } from '@/lib/prisma';
import type {
  User,
  UserPreferences,
  NotificationPreferences,
} from '@/types/user';
import { UserRole, Prisma } from '@prisma/client';
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
  activityTypes: [],
  gender: [],
  lookingFor: [],
  relationshipType: [],
  availability: [],
  verifiedOnly: false,
  withPhoto: true,
  notifications: DEFAULT_NOTIFICATION_PREFS,
  privacy: {
    location: 'standard' as AppLocationPrivacyMode,
    profile: 'public',
  },
  safety: {
    blockedUsers: [],
    reportedUsers: [],
  },
  language: 'en',
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
};

type PrismaUserWithRelations = Prisma.UserGetPayload<{
  include: {
    notificationPrefs: true;
    locations: true;
  };
}>;

const mapPrismaUserToUser = (prismaUser: PrismaUserWithRelations): User => {
  const notificationPrefs = prismaUser.notificationPrefs
    ? {
        ...DEFAULT_NOTIFICATION_PREFS,
        push: prismaUser.notificationPrefs.pushEnabled,
        email: prismaUser.notificationPrefs.emailEnabled,
        ...(prismaUser.notificationPrefs.categories as Record<string, boolean>),
      }
    : DEFAULT_NOTIFICATION_PREFS;

  const userPrefs = prismaUser as unknown as { preferences?: UserPreferences };

  return {
    id: prismaUser.id,
    email: prismaUser.email || '',
    firstName: prismaUser.firstName || '',
    lastName: prismaUser.lastName || '',
    name: prismaUser.name || '',
    image: prismaUser.image || null,
    emailVerified: prismaUser.emailVerified,
    lastLogin: prismaUser.lastLogin,
    createdAt: prismaUser.createdAt,
    updatedAt: prismaUser.updatedAt,
    verificationStatus: prismaUser.emailVerified ? 'verified' : 'pending',
    role: prismaUser.role || UserRole.user,
    streakCount: prismaUser.streakCount || 0,
    password: prismaUser.password || '',
    safetyEnabled: prismaUser.safetyEnabled || false,
    notificationPrefs,
    preferences: userPrefs.preferences || DEFAULT_PREFERENCES,
  };
};

export const userService = {
  async getCurrentUser(): Promise<User | null> {
    const user = await prisma.user.findFirst({
      orderBy: { lastLogin: 'desc' },
      include: {
        notificationPrefs: true,
        locations: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) return null;
    return mapPrismaUserToUser(user);
  },

  async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        notificationPrefs: true,
        locations: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) return null;
    return mapPrismaUserToUser(user);
  },

  async updateUser(
    id: string,
    updateData: {
      firstName?: string;
      lastName?: string;
      email?: string;
      role?: UserRole;
      streakCount?: number;
      emailVerified?: Date | null;
      lastLogin?: Date;
    }
  ): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        notificationPrefs: true,
        locations: {
          orderBy: { timestamp: 'desc' },
          take: 1,
        },
      },
    });

    return mapPrismaUserToUser(user);
  },

  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        notificationPrefs: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const userWithPrefs = user as unknown as { preferences?: UserPreferences };
    const currentPrefs = userWithPrefs.preferences || DEFAULT_PREFERENCES;
    const updatedPrefs = {
      ...currentPrefs,
      ...preferences,
    };

    // Update notification preferences
    if (preferences.notifications) {
      const notificationData: Prisma.NotificationPreferencesUpdateInput = {
        pushEnabled: preferences.notifications.push,
        emailEnabled: preferences.notifications.email,
        categories:
          preferences.notifications as unknown as Prisma.InputJsonValue,
      };

      if (user.notificationPrefs) {
        await prisma.notificationPreferences.update({
          where: { userId },
          data: notificationData,
        });
      } else {
        await prisma.notificationPreferences.create({
          data: {
            userId,
            ...notificationData,
          },
        });
      }
    }

    // Update user preferences as a JSON field
    await prisma.$executeRaw`UPDATE "User" SET preferences = ${updatedPrefs}::jsonb WHERE id = ${userId}`;

    return updatedPrefs;
  },
};
