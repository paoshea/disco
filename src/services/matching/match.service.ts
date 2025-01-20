import { Match, MatchPreferences, MatchScore, MatchStatus } from '@/types/match';
import { User } from '@/types/user';
import { MatchAlgorithm } from './match.algorithm';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';
import { LocationService } from '../location/location.service';
import { UserService } from '../user/user.service';

const MATCH_SCORE_CACHE_TTL = 3600; // 1 hour
const NEARBY_USERS_CACHE_TTL = 300; // 5 minutes

export class MatchingService {
  private static instance: MatchingService;
  private algorithm: MatchAlgorithm;
  private locationService: LocationService;
  private userService: UserService;

  private constructor() {
    this.algorithm = new MatchAlgorithm();
    this.locationService = LocationService.getInstance();
    this.userService = UserService.getInstance();
  }

  public static getInstance(): MatchingService {
    if (!MatchingService.instance) {
      MatchingService.instance = new MatchingService();
    }
    return MatchingService.instance;
  }

  /**
   * Find potential matches for a user based on location and preferences
   */
  async findMatches(
    userId: string,
    preferences: MatchPreferences
  ): Promise<Match[]> {
    const user = await this.userService.getUserById(userId);
    if (!user) throw new Error('User not found');

    // Get cached nearby users or fetch new ones
    const cacheKey = `nearby:${userId}:${preferences.maxDistance}`;
    let nearbyUsers: User[] = JSON.parse(
      (await redis.get(cacheKey)) || 'null'
    );

    if (!nearbyUsers) {
      nearbyUsers = await this.locationService.getNearbyUsers(
        user.location.latitude,
        user.location.longitude,
        preferences.maxDistance
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
          const matchPreferences = await this.userService.getUserPreferences(
            potentialMatch.id
          );
          
          // Check if cached score exists
          const scoreCacheKey = `match:score:${userId}:${potentialMatch.id}`;
          let score: MatchScore = JSON.parse(
            (await redis.get(scoreCacheKey)) || 'null'
          );

          if (!score) {
            score = this.algorithm.calculateMatchScore(
              user,
              potentialMatch,
              preferences,
              matchPreferences
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
      .filter(match => this.isQualifiedMatch(match.score, preferences))
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
    return {
      id: user.id,
      name: user.name,
      bio: user.bio,
      age: user.age,
      profileImage: user.profileImage,
      distance: score.distance,
      commonInterests: score.commonInterests,
      lastActive: user.lastActive,
      location: {
        latitude: user.location.latitude,
        longitude: user.location.longitude,
      },
      interests: user.interests,
      connectionStatus: 'pending',
      verificationStatus: user.verificationStatus,
      activityPreferences: user.activityPreferences,
      privacySettings: user.privacySettings,
    };
  }

  /**
   * Update match preferences for a user
   */
  async updatePreferences(
    userId: string,
    preferences: Partial<MatchPreferences>
  ): Promise<void> {
    await this.userService.updatePreferences(userId, preferences);
    
    // Invalidate nearby users cache when preferences change
    const cacheKey = `nearby:${userId}:${preferences.maxDistance}`;
    await redis.del(cacheKey);
  }

  /**
   * Get match status between two users
   */
  async getMatchStatus(userId: string, matchId: string): Promise<MatchStatus> {
    const match = await db.match.findFirst({
      where: {
        OR: [
          { userId_1: userId, userId_2: matchId },
          { userId_1: matchId, userId_2: userId },
        ],
      },
    });

    return match?.status as MatchStatus || 'pending';
  }
}
