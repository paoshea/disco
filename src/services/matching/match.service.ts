import { User as PrismaUser, Location as PrismaLocation, UserMatch as PrismaMatch, Prisma } from '@prisma/client';
import { Match, MatchPreferences, MatchScore, MatchLocation } from '@/types/match';
import { User as AppUser, UserPreferences, NotificationPreferences } from '@/types/user';
import { AppLocationPrivacyMode, LocationPrivacyMode } from '@/types/location';
import { convertLocationPrivacyMode, convertToPrismaPrivacyMode } from '@/utils/location';

import { calculateMatchScore } from './match.algorithm';
import { convertToMatchPreferences, getDefaultMatchPreferences } from './match.preferences';

import { prisma } from '@/lib/prisma';
import { UserService } from '@/services/user/user.service';

const MATCH_SCORE_CACHE_TTL = 3600; // 1 hour
const NEARBY_USERS_CACHE_TTL = 1800; // 30 minutes
const MATCH_UPDATE_INTERVAL = 5000; // 5 seconds

const userService = UserService.getInstance();

type PrismaUserWithRelations = PrismaUser & {
  locations?: PrismaLocation[];
  notificationPreferences?: {
    id: string;
    userId: string;
    pushEnabled: boolean;
    emailEnabled: boolean;
    inAppEnabled: boolean;
    categories: Prisma.JsonValue;
    quiet_hours: Prisma.JsonValue;
    createdAt: Date;
    updatedAt: Date;
  } | null;
};

type PrismaMatchWithRelations = PrismaMatch & {
  user: PrismaUserWithRelations;
  matchedUser: PrismaUserWithRelations;
};

const userInclude = {
  locations: true,
  notificationPreferences: true,
} as const;

const DEFAULT_NOTIFICATION_PREFS: NotificationPreferences = {
  push: true,
  email: true,
  inApp: true,
  matches: true,
  messages: true,
  events: true,
  safety: true,
};

export class MatchingService {
  private static instance: MatchingService;

  private constructor() {}

  public static getInstance(): MatchingService {
    if (!MatchingService.instance) {
      MatchingService.instance = new MatchingService();
    }
    return MatchingService.instance;
  }

  async acceptMatch(userId: string, matchId: string): Promise<void> {
    await this.updateMatchStatus(userId, matchId, 'accepted');
  }

  async rejectMatch(userId: string, matchId: string): Promise<void> {
    await this.updateMatchStatus(userId, matchId, 'rejected');
  }

  async blockMatch(userId: string, matchId: string): Promise<void> {
    await this.updateMatchStatus(userId, matchId, 'blocked');
  }

  private static convertToAppUser(prismaUser: PrismaUserWithRelations): AppUser {
    const mapPrismaUserToUser = (prismaUser: PrismaUserWithRelations): AppUser => ({
      id: prismaUser.id,
      email: prismaUser.email,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      name: prismaUser.name || null,
      image: prismaUser.image,
      emailVerified: prismaUser.emailVerified ? true : null,
      lastLogin: prismaUser.lastLogin,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
      verificationStatus: prismaUser.emailVerified ? 'verified' as const : 'pending' as const,
      role: prismaUser.role,
      streakCount: prismaUser.streakCount,
      password: prismaUser.password,
      safetyEnabled: prismaUser.safetyEnabled,
      notificationPrefs: prismaUser.notificationPreferences ? {
        push: prismaUser.notificationPreferences.pushEnabled,
        email: prismaUser.notificationPreferences.emailEnabled,
        inApp: prismaUser.notificationPreferences.inAppEnabled,
        matches: true,
        messages: true,
        events: true,
        safety: true,
        ...(prismaUser.notificationPreferences.categories as Record<string, boolean>),
      } : DEFAULT_NOTIFICATION_PREFS,
    });

    const location = prismaUser.locations?.[0];
    const appUser = mapPrismaUserToUser(prismaUser);
    return {
      ...appUser,
      location: location
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy ?? undefined,
            privacyMode: convertLocationPrivacyMode(location.privacyMode),
            timestamp: location.timestamp,
          }
        : undefined,
    };
  }

  async findMatches(userId: string): Promise<Match[]> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: userInclude,
      });

      if (!user) {
        throw new Error('User not found');
      }

      const userPrefs = await userService.getUserPreferences(userId);
      const matchPrefs = userPrefs ? convertToMatchPreferences(userPrefs) : getDefaultMatchPreferences();

      const potentialMatches = await prisma.user.findMany({
        where: {
          AND: [
            { id: { not: userId } },
            { emailVerified: { not: null } },
            matchPrefs.verifiedOnly ? { emailVerified: { not: null } } : {},
            matchPrefs.withPhoto ? { image: { not: null } } : {},
          ],
        },
        include: userInclude,
      });

      const matches: Match[] = [];

      for (const match of potentialMatches) {
        const matchPrefs = await userService.getUserPreferences(match.id);
        if (!matchPrefs) continue;

        const appUser = MatchingService.convertToAppUser(user as PrismaUserWithRelations);
        const appMatch = MatchingService.convertToAppUser(match as PrismaUserWithRelations);

        const matchScore = await calculateMatchScore(appUser, appMatch);
        if (!matchScore) continue;

        const matchLocation: MatchLocation | undefined = match.locations?.[0] ? {
          latitude: match.locations[0].latitude,
          longitude: match.locations[0].longitude,
          privacyMode: convertLocationPrivacyMode(match.locations[0].privacyMode),
          timestamp: match.locations[0].timestamp.toISOString(),
        } : undefined;

        matches.push({
          id: match.id,
          userId: match.id,
          name: match.name || '',
          image: match.image,
          distance: matchScore.criteria.distance,
          matchScore: {
            total: matchScore.total,
            criteria: {
              distance: matchScore.criteria.distance,
              interests: matchScore.criteria.interests,
              verification: matchScore.criteria.verification,
              availability: matchScore.criteria.availability,
              preferences: matchScore.criteria.preferences,
              age: 0,
              photo: match.image ? 1 : 0,
            },
          },
          lastActive: match.updatedAt.toISOString(),
          verificationStatus: match.emailVerified ? 'verified' as const : 'pending' as const,
          interests: matchPrefs.activityTypes || [],
          bio: '',
          location: matchLocation,
          preferences: convertToMatchPreferences(matchPrefs),
          connectionStatus: await this.getMatchStatus(userId, match.id),
          activityPreferences: {
            type: 'any',
            timeWindow: 'anytime',
            location: '',
            mode: 'standard' as AppLocationPrivacyMode,
            bluetoothEnabled: false,
          },
        });
      }

      return matches.sort((a, b) => b.matchScore.total - a.matchScore.total);
    } catch (error) {
      console.error('Error finding matches:', error);
      throw error;
    }
  }

  async getMatchStatus(userId: string, matchId: string): Promise<'pending' | 'accepted' | 'rejected' | 'blocked'> {
    const match = await prisma.userMatch.findFirst({
      where: {
        OR: [
          { userId, matchedUserId: matchId },
          { userId: matchId, matchedUserId: userId },
        ],
      },
    });

    return (match?.status.toLowerCase() as 'pending' | 'accepted' | 'rejected' | 'blocked') || 'pending';
  }

  async updateMatchStatus(userId: string, matchId: string, status: 'accepted' | 'rejected' | 'blocked'): Promise<void> {
    const match = await prisma.userMatch.findFirst({
      where: {
        OR: [
          { userId, matchedUserId: matchId },
          { userId: matchId, matchedUserId: userId },
        ],
      },
    });

    if (match) {
      await prisma.userMatch.update({
        where: { id: match.id },
        data: { status: status.toUpperCase() },
      });
    } else {
      await prisma.userMatch.create({
        data: {
          userId,
          matchedUserId: matchId,
          status: status.toUpperCase(),
          score: 0,
        },
      });
    }

    // If both users accept, create a chat room
    if (status === 'accepted') {
      const otherMatch = await prisma.userMatch.findFirst({
        where: {
          userId: matchId,
          matchedUserId: userId,
          status: 'ACCEPTED',
        },
      });

      if (otherMatch) {
        await prisma.chatRoom.create({
          data: {
            creatorId: userId,
            participantId: matchId,
          },
        });
      }
    }
  }

  async getMatchId(userId: string, matchId: string): Promise<string> {
    const match = await prisma.userMatch.findFirst({
      where: {
        OR: [
          { userId, matchedUserId: matchId },
          { userId: matchId, matchedUserId: userId },
        ],
      },
      select: { id: true },
    });
    return match?.id || `${userId}_${matchId}`;
  }

  async sendMatchRequest(userId: string, matchId: string): Promise<void> {
    await prisma.userMatch.create({
      data: {
        userId,
        matchedUserId: matchId,
        status: 'PENDING',
        score: 0,
      },
    });
  }

  async getMatchUpdates(userId: string, callback: (match: Match) => void): Promise<() => void> {
    const checkForUpdates = async () => {
      try {
        const recentMatches = await prisma.userMatch.findMany({
          where: {
            OR: [
              { userId },
              { matchedUserId: userId },
            ],
            updatedAt: {
              gt: new Date(Date.now() - 30000), // Last 30 seconds
            },
          },
          include: {
            user: {
              include: userInclude,
            },
            matchedUser: {
              include: userInclude,
            },
          },
        }) as PrismaMatchWithRelations[];

        // Process updates
        for (const match of recentMatches) {
          const otherUser = match.userId === userId ? match.matchedUser : match.user;
          if (!otherUser) continue;

          const matchPrefs = await userService.getUserPreferences(otherUser.id);
          if (!matchPrefs) continue;

          callback({
            id: otherUser.id,
            userId: otherUser.id,
            name: otherUser.name || '',
            image: otherUser.image,
            distance: 0, // Would need to calculate
            matchScore: {
              total: match.score,
              criteria: {
                distance: 0,
                interests: 0,
                verification: otherUser.emailVerified ? 1 : 0,
                availability: 0,
                preferences: 0,
                age: 0,
                photo: otherUser.image ? 1 : 0,
              },
            },
            lastActive: otherUser.updatedAt.toISOString(),
            verificationStatus: otherUser.emailVerified ? 'verified' as const : 'pending' as const,
            interests: matchPrefs.activityTypes || [],
            bio: '',
            location: otherUser.locations?.[0] ? {
              latitude: otherUser.locations[0].latitude,
              longitude: otherUser.locations[0].longitude,
              privacyMode: convertLocationPrivacyMode(otherUser.locations[0].privacyMode),
              timestamp: otherUser.locations[0].timestamp.toISOString(),
            } : undefined,
            preferences: convertToMatchPreferences(matchPrefs),
            connectionStatus: match.status.toLowerCase() as 'pending' | 'accepted' | 'rejected' | 'blocked',
            activityPreferences: {
              type: 'any',
              timeWindow: 'anytime',
              location: '',
              mode: 'standard' as AppLocationPrivacyMode,
              bluetoothEnabled: false,
            },
          });
        }
      } catch (error) {
        console.error('Error checking for match updates:', error);
      }
    };

    const interval = setInterval(checkForUpdates, MATCH_UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }
}
