import type { User } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import type { UserPreferences } from '@/types/user';

export class UserService {
  private static instance: UserService;

  private constructor() {}

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
    await redis.del(cacheKey);
    return prisma.user.delete({
      where: { id },
    });
  }

  async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    const cachedPrefs = await redis.get(`user:${userId}:preferences`);
    if (cachedPrefs) {
      const parsedPrefs = JSON.parse(cachedPrefs);
      return parsedPrefs as UserPreferences;
    }

    const user = await this.getUserById(userId);
    if (!user) return null;

    const preferences: UserPreferences = {
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

    // Cache the preferences
    await redis.setex(
      `user:${userId}:preferences`,
      3600,
      JSON.stringify(preferences)
    );
    return preferences;
  }

  async updateUserPreferences(
    userId: string,
    preferences: UserPreferences
  ): Promise<void> {
    // Validate user exists
    const user = await this.getUserById(userId);
    if (!user) throw new Error('User not found');

    // Update cache
    await redis.setex(
      `user:${userId}:preferences`,
      3600,
      JSON.stringify(preferences)
    );
  }

  async updateUserById(
    id: string,
    data: Partial<{
      firstName: string;
      lastName: string;
      email: string;
      emailVerified: boolean;
      role: string;
      streakCount: number;
      lastLogin: Date;
      safetyEnabled: boolean;
    }>
  ): Promise<User> {
    return prisma.user.update({
      where: { id },
      data,
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
}
