import { Match, MatchPreferences, MatchScore, MatchStatus } from '@/types/match';
import { User, UserPreferences } from '@/types/user';
import { MatchAlgorithm } from './match.algorithm';
import { db } from '@/lib/db/client';
import { redis } from '@/lib/redis/client';
import { locationService } from '../location/location.service';
import { userService } from '../user/user.service';

const MATCH_SCORE_CACHE_TTL = 3600; // 1 hour
const NEARBY_USERS_CACHE_TTL = 300; // 5 minutes

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

    const matchPreferences = this.convertToMatchPreferences(preferences);

    // Get cached nearby users or fetch new ones
    const cacheKey = `nearby:${userId}:${matchPreferences.maxDistance}`;
    let nearbyUsers: User[] = JSON.parse(
      (await redis.get(cacheKey)) || 'null'
    );

    if (!nearbyUsers) {
      nearbyUsers = await locationService.getNearbyUsers(
        user.location.latitude,
        user.location.longitude,
        matchPreferences.maxDistance
      );
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
          const userPrefs = await userService.getUserPreferences(
            potentialMatch.id
          );
          const matchPrefs = this.convertToMatchPreferences(userPrefs);
          
          // Check if cached score exists
          const scoreCacheKey = `match:score:${userId}:${potentialMatch.id}`;
          let score: MatchScore = JSON.parse(
            (await redis.get(scoreCacheKey)) || 'null'
          );

          if (!score) {
            score = this.algorithm.calculateMatchScore(
              user,
              potentialMatch,
              matchPreferences,
              matchPrefs
            );
            await redis.setex(
              scoreCacheKey,
              MATCH_SCORE_CACHE_TTL,
              JSON.stringify(score)
            );
          }

          return {
            id: potentialMatch.id,
            user: potentialMatch,
            score,
          };
        })
    );

    // Filter and sort matches
    const qualifiedMatches = scoredMatches
      .filter(match => this.isQualifiedMatch(match.score, matchPreferences))
      .sort((a, b) => b.score.total - a.score.total)
      .map(match => this.createMatchObject(match.user, match.score));

    return qualifiedMatches;
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
  private createMatchObject(user: User, score: MatchScore): Match {
    const lastActive = typeof user.lastActive === 'string' 
      ? user.lastActive 
      : new Date().toISOString();

    return {
      id: user.id,
      name: user.name || '',
      bio: user.bio || '',
      age: user.age || 0,
      profileImage: user.avatar,
      distance: score.distance,
      commonInterests: score.commonInterests,
      lastActive,
      location: {
        latitude: user.location?.latitude || 0,
        longitude: user.location?.longitude || 0,
      },
      interests: user.interests || [],
      connectionStatus: 'pending',
      verificationStatus: user.verificationStatus || 'unverified',
      activityPreferences: user.activityPreferences || {
        type: 'any',
        timeWindow: 'anytime'
      },
      privacySettings: user.privacySettings || {
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
    const match = await db.match.findUnique({
      where: { id: matchId },
      include: { users: true }
    });

    if (!match) {
      throw new Error('Match not found');
    }

    if (!match.users.some(u => u.id === userId)) {
      throw new Error('User not part of match');
    }

    return match.status as MatchStatus;
  }

  /**
   * Accept a match
   */
  async acceptMatch(userId: string, matchId: string): Promise<void> {
    await db.match.update({
      where: { id: matchId },
      data: { status: 'ACCEPTED' }
    });
  }

  /**
   * Reject a match
   */
  async rejectMatch(userId: string, matchId: string): Promise<void> {
    await db.match.update({
      where: { id: matchId },
      data: { status: 'REJECTED' }
    });
  }

  /**
   * Block a match
   */
  async blockMatch(userId: string, matchId: string): Promise<void> {
    await db.match.update({
      where: { id: matchId },
      data: { status: 'BLOCKED' }
    });
  }

  /**
   * Report a match
   */
  async reportMatch(userId: string, matchId: string, reason: string): Promise<void> {
    await db.match.update({
      where: { id: matchId },
      data: { 
        status: 'REPORTED',
        reportReason: reason
      }
    });
  }

  /**
   * Set user preferences for matching
   */
  async setPreferences(userId: string, preferences: UserPreferences): Promise<void> {
    await userService.updatePreferences(userId, preferences);
    
    // Clear any cached match scores for this user
    const cacheKey = `match_scores:${userId}`;
    await redis.del(cacheKey);
  }

}

export const matchingService = MatchingService.getInstance();
