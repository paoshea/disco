import { Match, MatchPreferences, MatchScore, MatchStatus } from '@/types/match';
import type { User as AppUser, UserPreferences } from '@/types/user';
import { PrismaClient, User as PrismaUser } from '@prisma/client';
import { MatchAlgorithm } from './match.algorithm';
import { db } from '@/lib/db/client';
import { redis } from '@/lib/redis/client';
import { locationService } from '../location/location.service';
import * as userService from '../user/user.service';

const MATCH_SCORE_CACHE_TTL = 3600; // 1 hour
const NEARBY_USERS_CACHE_TTL = 300; // 5 minutes

// Helper function to convert Prisma User to App User
function convertToAppUser(prismaUser: PrismaUser): AppUser {
  return {
    id: prismaUser.id,
    email: prismaUser.email,
    firstName: prismaUser.firstName,
    lastName: prismaUser.lastName,
    emailVerified: prismaUser.emailVerified,
    name: `${prismaUser.firstName} ${prismaUser.lastName}`,
    verificationStatus: prismaUser.emailVerified ? 'verified' : 'unverified',
    lastActive: prismaUser.updatedAt.toISOString(),
    location: { 
      latitude: 0, 
      longitude: 0,
      lastUpdated: new Date()
    },
    createdAt: prismaUser.createdAt.toISOString(),
    updatedAt: prismaUser.updatedAt.toISOString()
  };
}

export class MatchingService {
  private static instance: MatchingService;
  private algorithm: MatchAlgorithm;

  private constructor() {
    this.algorithm = new MatchAlgorithm();
  }

  public static getInstance(): MatchingService {
    if (!MatchingService.instance) {
      MatchingService.instance = new MatchingService();
    }
    return MatchingService.instance;
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
      useBluetoothProximity: false
    };
  }

  /**
   * Find potential matches for a user based on location and preferences
   */
  async findMatches(
    userId: string,
    preferences: UserPreferences
  ): Promise<Match[]> {
    const user = await userService.getUserById(userId);
    if (!user) throw new Error('User not found');

    const userPreferences = await userService.getUserPreferences(userId);
    if (!userPreferences) {
      throw new Error('User preferences not found');
    }

    const matchPreferences = this.convertToMatchPreferences(userPreferences);

    // Get cached nearby users or fetch new ones
    const cacheKey = `nearby:${userId}:${matchPreferences.maxDistance}`;
    let nearbyUsers: AppUser[] = JSON.parse(
      (await redis.get(cacheKey)) || 'null'
    );

    if (!nearbyUsers) {
      const nearbyPrismaUsers = await this.getNearbyUsers(userId);
      nearbyUsers = nearbyPrismaUsers.map(convertToAppUser);
      await redis.setex(
        cacheKey,
        NEARBY_USERS_CACHE_TTL,
        JSON.stringify(nearbyUsers)
      );
    }

    // Calculate scores for each potential match
    const scoredMatches = await Promise.all(
      nearbyUsers
        .filter(potentialMatch => potentialMatch.id !== userId)
        .map(async potentialMatch => {
          const potentialMatchUser = await userService.getUserById(potentialMatch.id);
          if (!potentialMatchUser) {
            return null;
          }

          const userPrefs = await userService.getUserPreferences(potentialMatch.id);
          if (!userPrefs) {
            return null;
          }
          const matchPrefs = this.convertToMatchPreferences(userPrefs);
          
          // Check if cached score exists
          const scoreCacheKey = `match_score:${userId}:${potentialMatch.id}`;
          let matchScore: MatchScore | null = null;
          const cachedScore = await redis.get(scoreCacheKey);

          if (cachedScore) {
            try {
              matchScore = JSON.parse(cachedScore) as MatchScore;
            } catch (error) {
              console.error('Error parsing cached score:', error);
            }
          }

          if (!matchScore) {
            const appUser = convertToAppUser(user);
            const appPotentialMatch = convertToAppUser(potentialMatchUser);
            matchScore = this.algorithm.calculateMatchScore(
              appUser,
              appPotentialMatch,
              matchPreferences,
              matchPrefs
            );
            await redis.set(
              scoreCacheKey,
              JSON.stringify(matchScore),
              'EX',
              MATCH_SCORE_CACHE_TTL
            );
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
  private async createMatchObject(user: PrismaUser, score: MatchScore): Promise<Match> {
    const appUser = convertToAppUser(user);
    return {
      id: crypto.randomUUID(),
      name: appUser.name,
      bio: '',
      age: 0,
      profileImage: undefined,
      distance: score.distance,
      commonInterests: score.commonInterests,
      lastActive: appUser.lastActive,
      location: appUser.location,
      interests: [],
      connectionStatus: 'pending',
      verificationStatus: appUser.verificationStatus,
      activityPreferences: {
        type: 'any',
        timeWindow: 'anytime'
      },
      privacySettings: {
        mode: 'standard',
        bluetoothEnabled: false
      },
      matchScore: score
    };
  }

  /**
   * Get the status of a match
   */
  async getMatchStatus(userId: string, matchId: string): Promise<MatchStatus> {
    const match = await db.$queryRaw<{ status: MatchStatus }[]>`
      SELECT status FROM "UserMatch"
      WHERE id = ${matchId}
      AND (user_id = ${userId} OR matched_user_id = ${userId})
      LIMIT 1
    `;

    if (!match || match.length === 0) {
      throw new Error('Match not found');
    }

    return match[0].status;
  }

  /**
   * Accept a match
   */
  async acceptMatch(userId: string, matchId: string): Promise<void> {
    await db.$executeRaw`
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
    await db.$executeRaw`
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
    await db.$executeRaw`
      UPDATE "UserMatch"
      SET status = 'BLOCKED'
      WHERE id = ${matchId}
      AND (user_id = ${userId} OR matched_user_id = ${userId})
    `;
  }

  /**
   * Report a match
   */
  async reportMatch(userId: string, matchId: string, reason: string): Promise<void> {
    await db.$executeRaw`
      UPDATE "UserMatch"
      SET status = 'REPORTED',
          report_reason = ${reason}
      WHERE id = ${matchId}
      AND (user_id = ${userId} OR matched_user_id = ${userId})
    `;
  }

  private async getNearbyUsers(userId: string): Promise<PrismaUser[]> {
    const users = await db.user.findMany({
      where: {
        id: { not: userId },
        locations: {
          some: {
            sharingEnabled: true,
            timestamp: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
            }
          }
        }
      },
      include: {
        locations: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    return users;
  }

  /**
   * Set user preferences for matching
   */
  async setPreferences(userId: string, preferences: UserPreferences): Promise<void> {
    await userService.updateUserPreferences(userId, preferences);
    
    // Clear any cached match scores for this user
    const cacheKey = `match_scores:${userId}`;
    await redis.del(cacheKey);
  }

}

export const matchingService = MatchingService.getInstance();
