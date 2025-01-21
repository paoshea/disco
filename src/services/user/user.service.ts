import type { User } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import type { UserPreferences } from '@/types/user';

export class UserService {
  private static instance: UserService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async getUserById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
      include: {
        locations: true,
        emergencyContacts: true,
        safetyChecks: true,
        achievements: true,
        participatingRooms: true,
        messages: true,
        events: true,
        eventParticipants: true,
        privacyZones: true,
      },
    });
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
      include: {
        locations: true,
        emergencyContacts: true,
        safetyChecks: true,
        achievements: true,
        participatingRooms: true,
        messages: true,
        events: true,
        eventParticipants: true,
        privacyZones: true,
      },
    });
  }

  async deleteUserById(id: string): Promise<User> {
    // Invalidate cache
    const cacheKey = `user:${id}`;
    if (redis) {
      try {
        await redis.del(cacheKey);
      } catch (error) {
        console.error('Error deleting user cache:', error);
      }
    }
    return prisma.user.delete({
      where: { id },
    });
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    let preferences: UserPreferences | null = null;

    if (redis) {
      try {
        const cachedPrefs = await redis.get(`user:${userId}:preferences`);
        if (cachedPrefs) {
          preferences = JSON.parse(cachedPrefs) as UserPreferences;
        }
      } catch (error) {
        console.error('Error getting cached preferences:', error);
      }
    }

    if (!preferences) {
      const user = await this.getUserById(userId);
      if (!user) return null;

      preferences = {
        maxDistance: 10,
        ageRange: { min: 18, max: 99 },
        interests: [],
        gender: ['any'],
        lookingFor: ['any'],
        relationshipType: ['friendship'],
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
      };

      // Cache the preferences if Redis is available
      if (redis) {
        try {
          await redis.setex(
            `user:${userId}:preferences`,
            3600, // 1 hour
            JSON.stringify(preferences)
          );
        } catch (error) {
          console.error('Error caching preferences:', error);
        }
      }
    }

    return preferences;
  }

  async updateUserPreferences(
    userId: string,
    preferences: UserPreferences
  ): Promise<void> {
    // Validate user exists
    const user = await this.getUserById(userId);
    if (!user) throw new Error('User not found');

    // Update cache if Redis is available
    if (redis) {
      try {
        await redis.setex(
          `user:${userId}:preferences`,
          3600,
          JSON.stringify(preferences)
        );
      } catch (error) {
        console.error('Error updating preferences cache:', error);
      }
    }
  }

  async updateUser(
    userId: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      emailVerified: Date | null;
      role: string;
      streakCount: number;
      lastLogin: Date;
      safetyEnabled: boolean;
    }>
  ): Promise<User> {
    const updateData = {
      ...data,
      emailVerified:
        data.emailVerified === undefined ? undefined : data.emailVerified,
      lastLogin:
        data.lastLogin === undefined ? undefined : new Date(data.lastLogin),
    };

    return prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }
}
