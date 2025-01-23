import {
  PrismaClient,
  User as PrismaUser,
  UserRole,
  Prisma,
} from '@prisma/client';
import { User, UserPreferences, NotificationPreferences } from '@/types/user';
import { AppLocationPrivacyMode } from '@/types/location';
import { convertLocationPrivacyMode } from '@/utils/location';

const prisma = new PrismaClient();

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

export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  private convertPrismaUserToUser(
    prismaUser: PrismaUser & {
      locations?: {
        latitude: number;
        longitude: number;
        accuracy: number | null;
        privacyMode: string;
        timestamp: Date;
      }[];
      notificationPrefs?: {
        id: string;
        userId: string;
        pushEnabled: boolean;
        emailEnabled: boolean;
        categories: Prisma.JsonValue;
        quiet_hours: Prisma.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
      } | null;
    }
  ): User {
    const notificationPrefs: NotificationPreferences =
      prismaUser.notificationPrefs
        ? {
            ...DEFAULT_NOTIFICATION_PREFS,
            push: prismaUser.notificationPrefs.pushEnabled,
            email: prismaUser.notificationPrefs.emailEnabled,
            ...(prismaUser.notificationPrefs.categories as Record<
              string,
              boolean
            >),
          }
        : DEFAULT_NOTIFICATION_PREFS;

    const userPrefs = prismaUser as unknown as { preferences?: UserPreferences };

    return {
      id: prismaUser.id,
      email: prismaUser.email,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      name: prismaUser.name || '',
      image: prismaUser.image || null,
      emailVerified: prismaUser.emailVerified ? true : null,
      lastLogin: prismaUser.lastLogin,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      verificationStatus: prismaUser.emailVerified ? 'verified' : 'pending',
      role: prismaUser.role,
      streakCount: prismaUser.streakCount,
      password: prismaUser.password,
      safetyEnabled: prismaUser.safetyEnabled || false,
      preferences: userPrefs.preferences || DEFAULT_PREFERENCES,
      notificationPrefs,
      location: prismaUser.locations?.[0]
        ? {
            latitude: prismaUser.locations[0].latitude,
            longitude: prismaUser.locations[0].longitude,
            accuracy: prismaUser.locations[0].accuracy ?? undefined,
            privacyMode: convertLocationPrivacyMode(
              prismaUser.locations[0].privacyMode
            ),
            timestamp: prismaUser.locations[0].timestamp,
          }
        : undefined,
    };
  }

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
    return this.convertPrismaUserToUser(user);
  }

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
    return this.convertPrismaUserToUser(user);
  }

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

    return this.convertPrismaUserToUser(user);
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

    const userWithPrefs = user as unknown as { preferences?: UserPreferences };
    return userWithPrefs.preferences || DEFAULT_PREFERENCES;
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<void> {
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

    // Update notification preferences if provided
    if (preferences.notifications) {
      const notificationData: Prisma.NotificationPreferencesUpdateInput = {
        pushEnabled: preferences.notifications.push,
        emailEnabled: preferences.notifications.email,
        categories: preferences.notifications as unknown as Prisma.InputJsonValue,
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
  }

  async findNearbyUsers(
    userId: string,
    userLocation: { latitude: number; longitude: number },
    maxDistance: number
  ): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: {
        id: { not: userId },
        locations: {
          some: {
            latitude: {
              gte: userLocation.latitude - maxDistance / 111,
              lte: userLocation.latitude + maxDistance / 111,
            },
            longitude: {
              gte: userLocation.longitude - maxDistance / (111 * Math.cos(userLocation.latitude * Math.PI / 180)),
              lte: userLocation.longitude + maxDistance / (111 * Math.cos(userLocation.latitude * Math.PI / 180)),
            },
          },
        },
      },
      include: {
        notificationPrefs: true,
        locations: true,
      },
    });

    return users.map(user => this.convertPrismaUserToUser(user));
  }
}
