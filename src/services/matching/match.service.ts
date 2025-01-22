import {
  Match,
  MatchPreferences,
  MatchScore,
  MatchStatus,
} from '@/types/match';
import type { User as AppUser, UserPreferences } from '@/types/user';
import { User as PrismaUser, Location as PrismaLocation } from '@prisma/client';
import { MatchAlgorithm } from './match.algorithm';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { LocationService } from '@/services/location/location.service';
import { UserService } from '@/services/user/user.service';
import type { LocationPrivacyMode } from '@/types/location';

const MATCH_SCORE_CACHE_TTL = 3600; // 1 hour
const NEARBY_USERS_CACHE_TTL = 1800; // 30 minutes

const locationService = LocationService.getInstance(); // Use getInstance instead of new

export class MatchingService {
  private static instance: MatchingService;
  private algorithm: MatchAlgorithm;
  private userService: UserService;

  private constructor() {
    this.algorithm = new MatchAlgorithm();
    this.userService = UserService.getInstance();
  }

  public static getInstance(): MatchingService {
    if (!MatchingService.instance) {
      MatchingService.instance = new MatchingService();
    }
    return MatchingService.instance;
  }

  // Helper function to convert Prisma User to App User
  private static convertToAppUser(
    prismaUser: PrismaUser & { locations?: PrismaLocation[] }
  ): AppUser {
    const location = prismaUser.locations?.[0];
    return {
      id: prismaUser.id,
      email: prismaUser.email,
      firstName: prismaUser.firstName,
      lastName: prismaUser.lastName,
      emailVerified: prismaUser.emailVerified !== null,
      name: `${prismaUser.firstName} ${prismaUser.lastName}`,
      verificationStatus: prismaUser.emailVerified ? 'verified' : 'pending',
      lastActive: prismaUser.updatedAt,
      role: (prismaUser.role as 'user' | 'admin' | 'moderator') || 'user',
      streakCount: prismaUser.streakCount || 0,
      location: location
        ? {
            latitude: location.latitude,
            longitude: location.longitude,
            accuracy: location.accuracy ?? undefined,
            privacyMode: location.privacyMode as LocationPrivacyMode,
            timestamp: location.timestamp,
          }
        : undefined,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    };
  }

  /**
   * Convert UserPreferences to MatchPreferences
   */
  private convertToMatchPreferences(prefs: UserPreferences): MatchPreferences {
    return {
      maxDistance: prefs.maxDistance,
      minAge: prefs.ageRange.min,
      maxAge: prefs.ageRange.max,
      interests: prefs.interests,
      verifiedOnly: prefs.safety.requireVerifiedMatch,
      withPhoto: true, // Default to requiring photos
      activityType: undefined,
      timeWindow: undefined,
      privacyMode: undefined,
      useBluetoothProximity: false,
    };
  }

  /**
   * Find potential matches for a user based on location and preferences
   */
  async findMatches(userId: string): Promise<Match[]> {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new Error('User not found');

    const userPreferences = await this.userService.getUserPreferences(userId);
    if (!userPreferences) {
      throw new Error('User preferences not found');
    }

    const matchPreferences = this.convertToMatchPreferences(userPreferences);

    // Get cached nearby users or fetch new ones
    const cacheKey = `nearby:${userId}:${matchPreferences.maxDistance}`;
    let nearbyUsers: AppUser[] | null = null;

    if (redis) {
      const cachedUsers = await redis.get(cacheKey);
      if (cachedUsers) {
        try {
          nearbyUsers = JSON.parse(cachedUsers) as AppUser[];
        } catch (error) {
          console.error('Error parsing cached users:', error);
        }
      }
    }

    if (!nearbyUsers) {
      const nearbyPrismaUsers = await this.getNearbyUsers(
        userId,
        matchPreferences.maxDistance
      );

      nearbyUsers = await Promise.all(
        nearbyPrismaUsers.map(async user => {
          const appUser = MatchingService.convertToAppUser(user);
          const prefs = await this.userService.getUserPreferences(user.id);
          return { ...appUser, preferences: prefs || undefined };
        })
      );

      // Cache nearby users if Redis is available
      if (redis) {
        try {
          await redis.setex(
            cacheKey,
            NEARBY_USERS_CACHE_TTL,
            JSON.stringify(nearbyUsers)
          );
        } catch (error) {
          console.error('Error caching nearby users:', error);
        }
      }
    }

    // Calculate scores for each potential match
    const scoredMatches = await Promise.all(
      nearbyUsers
        .filter(potentialMatch => potentialMatch.id !== userId)
        .map(async potentialMatch => {
          const potentialMatchUser = await this.userService.getUserById(
            potentialMatch.id
          );
          if (!potentialMatchUser) {
            return null;
          }

          const userPrefs = await this.userService.getUserPreferences(
            potentialMatch.id
          );
          if (!userPrefs) {
            return null;
          }
          const matchPrefs = this.convertToMatchPreferences(userPrefs);

          // Check if cached score exists
          let matchScore: MatchScore | null = null;

          if (redis) {
            const scoreCacheKey = `match_score:${userId}:${potentialMatch.id}`;
            try {
              const cachedScore = await redis.get(scoreCacheKey);
              if (cachedScore) {
                matchScore = JSON.parse(cachedScore) as MatchScore;
              }
            } catch (error) {
              console.error('Error getting cached score:', error);
            }
          }

          if (!matchScore) {
            const appUser = MatchingService.convertToAppUser(user);
            const appPotentialMatch =
              MatchingService.convertToAppUser(potentialMatchUser);
            matchScore = this.algorithm.calculateMatchScore(
              appUser,
              appPotentialMatch,
              matchPreferences,
              matchPrefs
            );

            if (redis) {
              try {
                const scoreCacheKey = `match_score:${userId}:${potentialMatch.id}`;
                await redis.setex(
                  scoreCacheKey,
                  MATCH_SCORE_CACHE_TTL,
                  JSON.stringify(matchScore)
                );
              } catch (error) {
                console.error('Error caching match score:', error);
              }
            }
          }

          return this.createMatchObject(potentialMatchUser, matchScore);
        })
    );

    // Filter out null values and sort matches
    return scoredMatches
      .filter((match): match is Match => match !== null)
      .sort((a, b) => b.matchScore.total - a.matchScore.total);
  }

  /**
   * Check if a match meets the minimum quality threshold
   */
  private isQualifiedMatch(
    score: MatchScore,
    preferences: MatchPreferences
  ): boolean {
    // Basic qualification checks
    if (preferences.verifiedOnly && score.criteria.verificationStatus < 1) {
      return false;
    }

    // Minimum score thresholds
    const minTotalScore = 0.6; // 60% overall match
    const minDistanceScore = 0.4; // Must be within 40% of max distance
    const minInterestScore = 0.3; // Must have at least 30% interest overlap

    return (
      score.total >= minTotalScore &&
      score.criteria.distance >= minDistanceScore &&
      score.criteria.interests >= minInterestScore
    );
  }

  /**
   * Create a Match object from a user and score
   */
  async createMatchObject(user: PrismaUser, score: MatchScore): Promise<Match> {
    const appUser = MatchingService.convertToAppUser(user);
    const matchLocation = appUser.location
      ? {
          latitude: appUser.location.latitude,
          longitude: appUser.location.longitude,
        }
      : await this.getMatchLocation(user.id);

    return {
      id: crypto.randomUUID(),
      name: appUser.name,
      bio: '',
      age: 0,
      profileImage: undefined,
      distance: score.distance,
      commonInterests: score.commonInterests,
      lastActive: appUser.lastActive.toISOString(),
      location: matchLocation,
      interests: [],
      connectionStatus: 'pending',
      verificationStatus:
        appUser.verificationStatus === 'verified' ? 'verified' : 'unverified',
      activityPreferences: {
        type: 'any',
        timeWindow: 'anytime',
      },
      privacySettings: {
        mode: 'standard',
        bluetoothEnabled: false,
      },
      matchScore: score,
    };
  }

  /**
   * Get the status of a match
   */
  async getMatchStatus(userId: string, matchId: string): Promise<MatchStatus> {
    const cacheKey = `match_status:${userId}:${matchId}`;
    let status: MatchStatus | null = null;

    if (redis) {
      try {
        const cachedStatus = await redis.get(cacheKey);
        if (cachedStatus) {
          status = JSON.parse(cachedStatus) as MatchStatus;
        }
      } catch (error) {
        console.error('Error getting cached match status:', error);
      }
    }

    if (!status) {
      // Fetch status from database
      const match = await prisma.userMatch.findFirst({
        where: {
          OR: [
            { userId: userId, matchedUserId: matchId },
            { userId: matchId, matchedUserId: userId },
          ],
        },
      });

      status = (match?.status as MatchStatus) || 'pending';

      // Cache the status if Redis is available
      if (redis) {
        try {
          await redis.setex(cacheKey, 3600, JSON.stringify(status));
        } catch (error) {
          console.error('Error caching match status:', error);
        }
      }
    }

    return status;
  }

  /**
   * Accept a match
   */
  async acceptMatch(userId: string, matchId: string): Promise<void> {
    await prisma.$executeRaw`
      UPDATE "UserMatch"
      SET status = 'ACCEPTED'
      WHERE id = ${matchId}
      AND (user_id = ${userId} OR matched_user_id = ${userId})
    `;
  }

  /**
   * Reject a match
   */
  async rejectMatch(userId: string, matchId: string): Promise<void> {
    await prisma.$executeRaw`
      UPDATE "UserMatch"
      SET status = 'REJECTED'
      WHERE id = ${matchId}
      AND (user_id = ${userId} OR matched_user_id = ${userId})
    `;
  }

  /**
   * Block a match
   */
  async blockMatch(userId: string, matchId: string): Promise<void> {
    await prisma.$executeRaw`
      UPDATE "UserMatch"
      SET status = 'BLOCKED'
      WHERE id = ${matchId}
      AND (user_id = ${userId} OR matched_user_id = ${userId})
    `;
  }

  /**
   * Report a match
   */
  async reportMatch(
    userId: string,
    matchId: string,
    reason: string
  ): Promise<void> {
    await prisma.$executeRaw`
      UPDATE "UserMatch"
      SET status = 'REPORTED',
          report_reason = ${reason}
      WHERE id = ${matchId}
      AND (user_id = ${userId} OR matched_user_id = ${userId})
    `;
  }

  private async getNearbyUsers(
    userId: string,
    maxDistance: number
  ): Promise<PrismaUser[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw new Error('User not found');

    const userLocation = await locationService.getLocation(userId);
    if (!userLocation?.latitude || !userLocation?.longitude) {
      return [];
    }

    const nearbyUsers = await prisma.user.findMany({
      where: {
        NOT: {
          id: userId,
        },
        locations: {
          some: {
            latitude: {
              gte: userLocation.latitude - maxDistance / 111000,
              lte: userLocation.latitude + maxDistance / 111000,
            },
            longitude: {
              gte:
                userLocation.longitude -
                maxDistance /
                  (111000 * Math.cos((userLocation.latitude * Math.PI) / 180)),
              lte:
                userLocation.longitude +
                maxDistance /
                  (111000 * Math.cos((userLocation.latitude * Math.PI) / 180)),
            },
            sharingEnabled: true,
          },
        },
      },
    });

    return nearbyUsers;
  }

  /**
   * Set user preferences for matching
   */
  async setPreferences(
    userId: string,
    preferences: UserPreferences
  ): Promise<void> {
    await this.userService.updateUserPreferences(userId, preferences);

    // Clear any cached match scores for this user
    const cacheKey = `match_scores:${userId}`;
    if (redis) {
      await redis.del(cacheKey);
    }
  }

  private async getMatchLocation(
    userId: string
  ): Promise<{ latitude: number; longitude: number }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { locations: true },
    });

    const location = user?.locations?.[0];
    if (!location) {
      throw new Error('User location not found');
    }

    return {
      latitude: location.latitude,
      longitude: location.longitude,
    };
  }

  private async buildLocationWhereInput(userId: string, maxDistance: number) {
    const location = await this.getMatchLocation(userId);
    return {
      locations: {
        some: {
          latitude: location.latitude,
          longitude: location.longitude,
          maxDistance,
        },
      },
    };
  }
}

export const matchingService = MatchingService.getInstance();
