import { PrismaClient, User as PrismaUser, UserRole, Prisma } from '@prisma/client';
import { User, UserPreferences, NotificationPreferences } from '@/types/user';
import { AppLocationPrivacyMode, LocationPrivacyMode } from '@/types/location';
import { convertToAppPrivacyMode } from '@/utils/location';
import { prisma } from '@/lib/prisma';

const DEFAULT_PREFERENCES: UserPreferences = {
  maxDistance: 50,
  ageRange: {
    min: 18,
    max: 99,
  },
  gender: [],
  lookingFor: [],
  relationshipType: [],
  activityTypes: [],
  availability: [],
  verifiedOnly: false,
  withPhoto: true,
  notifications: {
    push: true,
    email: true,
    inApp: true,
    matches: true,
    messages: true,
    events: true,
    safety: true,
  },
  privacy: {
    location: 'standard' as AppLocationPrivacyMode,
    profile: 'public',
  },
  safety: {
    blockedUsers: [],
    reportedUsers: [],
  },
  language: 'en',
  timezone: 'UTC',
};

export class UserService {
  private static instance: UserService;

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  private convertPrismaUserToUser(prismaUser: PrismaUser & { 
    locations?: { 
      latitude: number;
      longitude: number;
      accuracy: number | null;
      privacyMode: string;
      timestamp: Date;
    }[];
    notificationPrefs?: {
      pushEnabled: boolean;
      emailEnabled: boolean;
      inAppEnabled: boolean;
    } | null;
  }): User {
    const notificationPrefs: NotificationPreferences = prismaUser.notificationPrefs ? {
      push: prismaUser.notificationPrefs.pushEnabled,
      email: prismaUser.notificationPrefs.emailEnabled,
      inApp: prismaUser.notificationPrefs.inAppEnabled,
      matches: true,
      messages: true,
      events: true,
      safety: true,
    } : {
      push: true,
      email: true,
      inApp: true,
      matches: true,
      messages: true,
      events: true,
      safety: true,
    };

    return {
      id: prismaUser.id,
      email: prismaUser.email,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      name: prismaUser.name,
      image: prismaUser.image,
      emailVerified: prismaUser.emailVerified ? true : null,
      verificationStatus: prismaUser.emailVerified ? 'verified' : 'pending',
      role: prismaUser.role,
      streakCount: prismaUser.streakCount,
      lastLogin: prismaUser.lastLogin,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      preferences: DEFAULT_PREFERENCES,
      notificationPrefs,
      location: prismaUser.locations?.[0] ? {
        latitude: prismaUser.locations[0].latitude,
        longitude: prismaUser.locations[0].longitude,
        accuracy: prismaUser.locations[0].accuracy ?? undefined,
        privacyMode: convertToAppPrivacyMode(prismaUser.locations[0].privacyMode as LocationPrivacyMode),
        timestamp: prismaUser.locations[0].timestamp,
      } : undefined,
      safetyEnabled: prismaUser.safetyEnabled,
    };
  }

  async getCurrentUser(): Promise<User | null> {
    const session = await prisma.session.findFirst({
      where: {
        expires: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          include: {
            notificationPrefs: true,
          },
        },
      },
      orderBy: {
        expires: 'desc',
      },
    });

    if (!session?.user) return null;
    return this.convertPrismaUserToUser(session.user);
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          notificationPrefs: true,
          locations: true,
        },
      });

      if (!user) return null;

      return this.convertPrismaUserToUser(user);
    } catch (error) {
      console.error('Error fetching user:', error);
      throw new Error('Failed to fetch user');
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          notificationPrefs: true,
          locations: true,
        },
      });

      if (!user) return null;

      return this.convertPrismaUserToUser(user);
    } catch (error) {
      console.error('Error fetching user by email:', error);
      throw new Error('Failed to fetch user by email');
    }
  }

  async deleteUserById(id: string): Promise<User> {
    const user = await prisma.user.delete({
      where: { id },
      include: {
        notificationPrefs: true,
      },
    });

    return this.convertPrismaUserToUser(user);
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const cacheKey = `user:${userId}:preferences`;
      const cachedPrefs = await prisma.redis.get(cacheKey);
      
      if (cachedPrefs) {
        return JSON.parse(cachedPrefs) as UserPreferences;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          notificationPrefs: true,
        },
      });

      if (!user) return null;

      const preferences = user.notificationPrefs?.preferences as UserPreferences || DEFAULT_PREFERENCES;
      await prisma.redis.set(cacheKey, JSON.stringify(preferences), 'EX', 3600);
      
      return preferences;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      return null;
    }
  }

  async updateUserPreferences(
    userId: string,
    preferences: Partial<UserPreferences>
  ): Promise<User> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        notificationPrefs: {
          upsert: {
            create: {
              preferences: preferences as any,
              pushEnabled: preferences.notifications?.push ?? true,
              emailEnabled: preferences.notifications?.email ?? true,
              inAppEnabled: preferences.notifications?.inApp ?? true,
              categories: [],
              quiet_hours: [],
            },
            update: {
              preferences: preferences as any,
              pushEnabled: preferences.notifications?.push,
              emailEnabled: preferences.notifications?.email,
              inAppEnabled: preferences.notifications?.inApp,
            },
          },
        },
      },
      include: {
        notificationPrefs: true,
        locations: true,
      },
    });

    return this.convertPrismaUserToUser(user);
  }

  async updateUser(userId: string, data: Partial<User>): Promise<User> {
    try {
      const { preferences, location, ...userData } = data;
      
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          ...userData,
          notificationPrefs: preferences ? {
            upsert: {
              create: {
                preferences: preferences as any,
                pushEnabled: preferences.notifications?.push ?? true,
                emailEnabled: preferences.notifications?.email ?? true,
                inAppEnabled: preferences.notifications?.inApp ?? true,
                categories: [],
                quiet_hours: [],
              },
              update: {
                preferences: preferences as any,
                pushEnabled: preferences.notifications?.push,
                emailEnabled: preferences.notifications?.email,
                inAppEnabled: preferences.notifications?.inApp,
              },
            },
          } : undefined,
          locations: location ? {
            upsert: {
              create: {
                ...location,
                timestamp: new Date(),
              },
              update: {
                ...location,
                timestamp: new Date(),
              },
            },
          } : undefined,
        },
        include: {
          notificationPrefs: true,
          locations: true,
        },
      });

      return this.convertPrismaUserToUser(user);
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }
}
