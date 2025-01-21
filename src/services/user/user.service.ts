import { PrismaClient, User } from '@prisma/client';
import { Redis } from 'ioredis';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import type { UserPreferences } from '@/types/user';

export async function getUserById(id: string): Promise<User | null> {
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

export async function getUserByEmail(email: string): Promise<User | null> {
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

export type UserUpdateData = Partial<{
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  role: string;
  streakCount: number;
  lastLogin: Date;
  safetyEnabled: boolean;
}>;

export async function updateUserById(
  id: string,
  data: UserUpdateData
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

export async function deleteUserById(id: string): Promise<User> {
  // Invalidate cache
  const cacheKey = `user:${id}`;
  await redis.del(cacheKey);
  return prisma.user.delete({
    where: { id },
  });
}

// Handle user preferences through Redis for better performance
export async function getUserPreferences(
  userId: string
): Promise<UserPreferences | null> {
  const cacheKey = `user:${userId}:preferences`;
  const cachedPrefs = await redis.get(cacheKey);

  if (cachedPrefs) {
    try {
      return JSON.parse(cachedPrefs);
    } catch (error) {
      console.error('Error parsing cached preferences:', error);
      return null;
    }
  }

  return null;
}

export async function updateUserPreferences(
  userId: string,
  preferences: UserPreferences
): Promise<void> {
  const cacheKey = `user:${userId}:preferences`;

  try {
    await redis.set(cacheKey, JSON.stringify(preferences));
    // Set expiry to 24 hours to ensure preferences are periodically refreshed
    await redis.expire(cacheKey, 24 * 60 * 60);
  } catch (error) {
    console.error('Error updating preferences:', error);
    throw new Error('Failed to update user preferences');
  }
}
