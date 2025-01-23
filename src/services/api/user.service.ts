import { prisma } from '@/lib/prisma';
import type { User, UserPreferences } from '@/types/user';
import { UserRole, Prisma } from '@prisma/client';

const mapPrismaUserToUser = (prismaUser: any): User => {
  const notificationPrefs = prismaUser.notificationPrefs ? {
    matches: true,
    messages: true,
    events: true,
    safety: true,
  } : undefined;

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
    notificationPrefs,
    preferences: prismaUser.preferences as UserPreferences || {
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
};

export const userService = {
  async getCurrentUser(): Promise<User | null> {
    const user = await prisma.user.findFirst({
      orderBy: { lastLogin: 'desc' },
    });

    if (!user) return null;
    return mapPrismaUserToUser(user);
  },

  async getUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;
    return mapPrismaUserToUser(user);
  },

  async updateUser(id: string, updateData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: UserRole;
    streakCount?: number;
    emailVerified?: Date | null;
    lastLogin?: Date;
  }): Promise<User> {
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return mapPrismaUserToUser(user);
  },

  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<UserPreferences> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const currentPrefs = (user.preferences as UserPreferences) || {
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
    };

    const updatedPrefs = {
      ...currentPrefs,
      ...preferences,
    };

    await prisma.user.update({
      where: { id: userId },
      data: {
        preferences: updatedPrefs as unknown as Prisma.JsonValue,
      },
    });

    return updatedPrefs;
  },
};
