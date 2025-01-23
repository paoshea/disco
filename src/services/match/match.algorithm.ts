import { MatchScore, MatchPreferences } from '@/types/match';
import { User } from '@/types/user';

interface WeightedCriteria {
  distance: number;
  activityTypes: number;
  availability: number;
}

const DEFAULT_WEIGHTS: WeightedCriteria = {
  distance: 0.3,
  activityTypes: 0.3,
  availability: 0.2,
};

export function calculateMatchScore(
  user1: User,
  user2: User,
  distance: number | null,
  weights: WeightedCriteria = DEFAULT_WEIGHTS
): MatchScore {
  const distanceScore = calculateDistanceScore(distance);
  const activityTypesScore = calculateActivityTypesScore(user1, user2);
  const availabilityScore = calculateAvailabilityScore(user1, user2);

  const total = Math.round(
    distanceScore * weights.distance +
    activityTypesScore * weights.activityTypes +
    availabilityScore * weights.availability
  );

  return {
    total,
    distance: Math.round(distanceScore * weights.distance),
    interests: Math.round(activityTypesScore * weights.activityTypes),
    availability: Math.round(availabilityScore * weights.availability),
    activityTypes: Math.round(activityTypesScore * weights.activityTypes),
  };
}

function calculateDistanceScore(distance: number | null): number {
  if (distance === null) return 50;
  if (distance <= 1) return 100;
  if (distance >= 50) return 0;
  return Math.round(100 - (distance / 50) * 100);
}

function calculateActivityTypesScore(user1: User, user2: User): number {
  const activityTypes1 = new Set(user1.preferences?.activityTypes || []);
  const activityTypes2 = new Set(user2.preferences?.activityTypes || []);

  if (activityTypes1.size === 0 || activityTypes2.size === 0) return 50;

  const commonTypes = Array.from(activityTypes1).filter(type =>
    activityTypes2.has(type)
  );

  const uniqueTypes = Array.from(
    new Set([...Array.from(activityTypes1), ...Array.from(activityTypes2)])
  );

  return Math.round((commonTypes.length / uniqueTypes.length) * 100);
}

function calculateAvailabilityScore(user1: User, user2: User): number {
  const availability1 = new Set(user1.preferences?.availability || []);
  const availability2 = new Set(user2.preferences?.availability || []);

  if (availability1.size === 0 || availability2.size === 0) return 50;

  const commonTimes = Array.from(availability1).filter(time =>
    availability2.has(time)
  );

  return Math.round((commonTimes.length / Math.max(availability1.size, availability2.size)) * 100);
}
