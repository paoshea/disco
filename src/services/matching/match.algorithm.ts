import { Match, MatchPreferences, MatchScore } from '@/types/match';
import { User } from '@/types/user';
import { calculateDistance } from '@/utils/location';

interface WeightedCriteria {
  distance: number;
  interests: number;
  activityPreference: number;
  timeWindow: number;
  verificationStatus: number;
  responseRate: number;
  meetupSuccess: number;
}

const DEFAULT_WEIGHTS: WeightedCriteria = {
  distance: 0.3,
  interests: 0.25,
  activityPreference: 0.15,
  timeWindow: 0.1,
  verificationStatus: 0.1,
  responseRate: 0.05,
  meetupSuccess: 0.05,
};

export class MatchAlgorithm {
  private weights: WeightedCriteria;

  constructor(weights: Partial<WeightedCriteria> = {}) {
    this.weights = { ...DEFAULT_WEIGHTS, ...weights };
  }

  /**
   * Calculate match score between a user and potential match
   */
  calculateMatchScore(
    user: User,
    potentialMatch: User,
    userPrefs: MatchPreferences,
    matchPrefs: MatchPreferences
  ): MatchScore {
    const scores: Partial<Record<keyof WeightedCriteria, number>> = {};

    // Distance score (inverse relationship - closer is better)
    const distance = calculateDistance(
      user.location.latitude,
      user.location.longitude,
      potentialMatch.location.latitude,
      potentialMatch.location.longitude
    );
    const maxDistance = Math.max(userPrefs.maxDistance, matchPrefs.maxDistance);
    scores.distance = 1 - Math.min(distance / maxDistance, 1);

    // Interest overlap score
    const userInterests = new Set(user.interests || []);
    const matchInterests = new Set(potentialMatch.interests || []);
    const commonInterests = Array.from(userInterests).filter(x => matchInterests.has(x));
    scores.interests = commonInterests.length / Math.max(userInterests.size, matchInterests.size);

    // Activity preference match
    scores.activityPreference = this.calculateActivityScore(
      userPrefs.activityType,
      matchPrefs.activityType
    );

    // Time window compatibility
    scores.timeWindow = this.calculateTimeWindowScore(
      userPrefs.timeWindow,
      matchPrefs.timeWindow
    );

    // Verification status
    scores.verificationStatus = this.calculateVerificationScore(
      user.verificationStatus,
      potentialMatch.verificationStatus,
      userPrefs.verifiedOnly
    );

    // Response rate score
    scores.responseRate = potentialMatch.stats?.responseRate ?? 0.5;

    // Meetup success score
    scores.meetupSuccess = potentialMatch.stats?.meetupSuccessRate ?? 0.5;

    // Calculate weighted average
    const totalScore = Object.entries(scores).reduce((sum, [key, score]) => {
      const weight = this.weights[key as keyof WeightedCriteria];
      return sum + score * weight;
    }, 0);

    return {
      total: totalScore,
      criteria: scores as Record<keyof WeightedCriteria, number>,
      commonInterests: Array.from(commonInterests),
      distance,
    };
  }

  /**
   * Calculate compatibility score for activity preferences
   */
  private calculateActivityScore(
    userActivity?: string,
    matchActivity?: string
  ): number {
    if (!userActivity || !matchActivity) return 0.5;
    if (userActivity === matchActivity) return 1;
    
    // Define activity compatibility groups
    const socialActivities = new Set(['coffee', 'lunch', 'dinner']);
    const professionalActivities = new Set(['networking', 'coworking', 'mentoring']);
    const leisureActivities = new Set(['sports', 'games', 'entertainment']);

    const activityGroups = [socialActivities, professionalActivities, leisureActivities];
    
    // Check if activities are in the same group
    const inSameGroup = activityGroups.some(group => 
      group.has(userActivity) && group.has(matchActivity)
    );

    return inSameGroup ? 0.7 : 0.3;
  }

  /**
   * Calculate compatibility score for time windows
   */
  private calculateTimeWindowScore(
    userWindow?: string,
    matchWindow?: string
  ): number {
    if (!userWindow || !matchWindow) return 0.5;
    if (userWindow === matchWindow) return 1;
    if (userWindow === 'anytime' || matchWindow === 'anytime') return 0.8;

    const timeWindows = ['now', '15min', '30min', '1hour', 'today'];
    const userIdx = timeWindows.indexOf(userWindow);
    const matchIdx = timeWindows.indexOf(matchWindow);

    if (userIdx === -1 || matchIdx === -1) return 0.5;

    // Calculate score based on how far apart the time windows are
    const difference = Math.abs(userIdx - matchIdx);
    return 1 - difference * 0.2;
  }

  /**
   * Calculate verification status compatibility
   */
  private calculateVerificationScore(
    userStatus: string,
    matchStatus: string,
    verifiedOnly: boolean
  ): number {
    if (verifiedOnly && matchStatus !== 'verified') return 0;
    if (userStatus === matchStatus) return 1;
    if (matchStatus === 'verified') return 0.8;
    return 0.4;
  }
}
