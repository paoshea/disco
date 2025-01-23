import {
  User as PrismaUser,
  Location as PrismaLocation,
  UserMatch as PrismaUserMatch,
  PrismaClient,
  Prisma,
  UserPreferences,
} from '@prisma/client';
import type { Match, MatchLocation, MatchPreferences, MatchScore } from '@/types/match';
import type { User, NotificationPreferences, UserPreferences as AppUserPreferences, SafetyPreferences, PrivacyPreferences } from '@/types/user';
import { AppLocationPrivacyMode } from '@/types/location';
import { prisma } from '@/lib/db/client';

export class MatchDbClient {
  private static instance: MatchDbClient;
  private prismaClient: PrismaClient;

  private constructor() {
    this.prismaClient = prisma;
  }

  public static getInstance(): MatchDbClient {
    if (!MatchDbClient.instance) {
      MatchDbClient.instance = new MatchDbClient();
    }
    return MatchDbClient.instance;
  }

  async getMatch(matchId: string): Promise<Match | null> {
    const match = await this.prismaClient.userMatch.findUnique({
      where: { id: matchId },
      include: {
        user: {
          include: {
            locations: true,
            notificationPrefs: true,
            preferences: true,
          },
        },
        matchedUser: {
          include: {
            locations: true,
            notificationPrefs: true,
            preferences: true,
          },
        },
      },
    });

    if (!match) return null;

    return this.convertToMatch(match);
  }

  async findMatches(userId: string): Promise<Match[]> {
    const matches = await this.prismaClient.userMatch.findMany({
      where: { userId },
      include: {
        user: {
          include: {
            locations: true,
            notificationPrefs: true,
            preferences: true,
          },
        },
        matchedUser: {
          include: {
            locations: true,
            notificationPrefs: true,
            preferences: true,
          },
        },
      },
    });

    return matches.map(match => this.convertToMatch(match));
  }

  async updatePreferences(userId: string, preferences: Omit<MatchPreferences, 'userId'>): Promise<void> {
    const preferenceData = {
      maxDistance: preferences.maxDistance,
      ageRange: preferences.ageRange,
      activityTypes: preferences.activityTypes,
      availability: preferences.availability,
      gender: preferences.gender,
      lookingFor: preferences.lookingFor,
      relationshipType: preferences.relationshipType,
      verifiedOnly: preferences.verifiedOnly,
      withPhoto: preferences.withPhoto,
      privacyMode: preferences.privacyMode,
      timeWindow: preferences.timeWindow,
      useBluetoothProximity: preferences.useBluetoothProximity,
    };

    await this.prismaClient.userPreferences.upsert({
      where: { userId },
      create: {
        ...preferenceData,
        user: { connect: { id: userId } }
      },
      update: preferenceData,
    });
  }

  async saveMatch(match: Match): Promise<void> {
    const { user, matchedUser, score, location, ...matchData } = match;

    // First ensure both users exist
    const [userExists, matchedUserExists] = await Promise.all([
      this.prismaClient.user.findUnique({ 
        where: { id: match.userId },
        include: {
          locations: true,
          notificationPrefs: true,
          preferences: true,
        }
      }),
      this.prismaClient.user.findUnique({ 
        where: { id: match.matchedUserId },
        include: {
          locations: true,
          notificationPrefs: true,
          preferences: true,
        }
      })
    ]);

    if (!userExists || !matchedUserExists) {
      throw new Error('One or both users do not exist');
    }

    const createData: Prisma.UserMatchCreateInput = {
      id: match.id,
      status: match.status,
      score: score.total,
      reportReason: null,
      createdAt: match.createdAt,
      updatedAt: match.updatedAt,
      user: { connect: { id: match.userId } },
      matchedUser: { connect: { id: match.matchedUserId } },
    };

    const updateData: Prisma.UserMatchUpdateInput = {
      status: match.status,
      score: score.total,
      updatedAt: match.updatedAt,
    };

    await this.prismaClient.userMatch.upsert({
      where: { id: match.id },
      create: createData,
      update: updateData,
    });
  }

  private convertToMatch(prismaMatch: PrismaUserMatch & {
    user: PrismaUser & {
      locations: PrismaLocation[];
      notificationPrefs: any;
      preferences: UserPreferences | null;
    };
    matchedUser: PrismaUser & {
      locations: PrismaLocation[];
      notificationPrefs: any;
      preferences: UserPreferences | null;
    };
  }): Match {
    const userLocation = prismaMatch.user.locations[0];
    const matchedUserLocation = prismaMatch.matchedUser.locations[0];

    const user = this.convertToUser(prismaMatch.user);
    const matchedUser = this.convertToUser(prismaMatch.matchedUser);

    return {
      id: prismaMatch.id,
      userId: prismaMatch.userId,
      matchedUserId: prismaMatch.matchedUserId,
      status: prismaMatch.status as Match['status'],
      score: {
        total: prismaMatch.score,
        distance: 0,
        interests: 0,
        availability: 0,
        activityTypes: 0,
      },
      createdAt: prismaMatch.createdAt,
      updatedAt: prismaMatch.updatedAt,
      user,
      matchedUser,
      location: userLocation ? {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude,
        accuracy: userLocation.accuracy === null ? undefined : userLocation.accuracy,
        privacyMode: userLocation.privacyMode as AppLocationPrivacyMode,
        timestamp: userLocation.timestamp,
      } : undefined,
    };
  }

  private convertToUser(prismaUser: PrismaUser & {
    notificationPrefs: any;
    preferences: UserPreferences | null;
  }): User {
    const notificationPrefs: NotificationPreferences = prismaUser.notificationPrefs ?? {
      matches: true,
      messages: true,
      events: true,
      safety: true,
      push: true,
      email: true,
      inApp: true,
      marketing: false,
      friendRequests: true,
      comments: true,
      likes: true,
      visits: true,
    };

    const defaultPreferences: AppUserPreferences = {
      maxDistance: 50,
      ageRange: { min: 18, max: 99 },
      activityTypes: [],
      availability: [],
      gender: [],
      lookingFor: [],
      relationshipType: [],
      verifiedOnly: false,
      withPhoto: true,
      notifications: notificationPrefs,
      privacy: {
        profile: 'public',
        location: AppLocationPrivacyMode.PUBLIC,
        showOnlineStatus: true,
        showLastSeen: true,
        showLocation: true,
        showAge: true,
      },
      safety: {
        blockedUsers: [],
        reportedUsers: [],
        requireVerifiedMatch: false,
        meetupCheckins: false,
        emergencyContactAlerts: true,
      },
      language: 'en',
      timezone: 'UTC',
    };

    const preferences = prismaUser.preferences ? 
      {...defaultPreferences, ...prismaUser.preferences} : 
      defaultPreferences;

    return {
      id: prismaUser.id,
      name: prismaUser.name ?? '',
      email: prismaUser.email,
      firstName: prismaUser.firstName ?? '',
      lastName: prismaUser.lastName ?? '',
      image: prismaUser.image ?? null,
      emailVerified: prismaUser.emailVerified !== null,
      preferences,
      notificationPrefs,
      verificationStatus: 'pending',
      role: prismaUser.role,
      lastLogin: prismaUser.lastLogin ?? null,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      safetyEnabled: prismaUser.safetyEnabled,
      streakCount: 0,
      password: prismaUser.password,
    };
  }
}
