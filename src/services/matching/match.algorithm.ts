import { User } from '@/types/user';
import { MatchScore } from '@/types/match';
import { calculateDistance } from '@/utils/location';

interface WeightedCriteria {
  distance: number;
  interests: number;
  verification: number;
  availability: number;
  preferences: number;
  age: number;
  photo: number;
}

const WEIGHTS: WeightedCriteria = {
  distance: 0.3,
  interests: 0.2,
  verification: 0.1,
  availability: 0.15,
  preferences: 0.15,
  age: 0.05,
  photo: 0.05,
};

export async function calculateMatchScore(
  user: User,
  potentialMatch: User
): Promise<MatchScore | null> {
  if (!user.location || !potentialMatch.location) {
    return null;
  }

  // Calculate distance score
  const distance = calculateDistance(
    user.location.latitude,
    user.location.longitude,
    potentialMatch.location.latitude,
    potentialMatch.location.longitude
  );

  const maxDistance = user.preferences?.maxDistance || 50;
  const distanceScore = Math.max(0, 1 - distance / maxDistance);

  // Calculate verification score
  const verificationScore = potentialMatch.emailVerified ? 1 : 0;

  // Calculate photo score
  const photoScore = potentialMatch.image ? 1 : 0;

  // Calculate availability score
  const userAvailability = user.preferences?.availability || [];
  const matchAvailability = potentialMatch.preferences?.availability || [];
  const commonAvailability = matchAvailability.filter(time =>
    userAvailability.includes(time)
  );
  const availabilityScore =
    userAvailability.length > 0
      ? commonAvailability.length / userAvailability.length
      : 0;

  // Calculate activity preferences score
  const userActivities = user.preferences?.activityTypes || [];
  const matchActivities = potentialMatch.preferences?.activityTypes || [];
  const commonActivities = matchActivities.filter(activity =>
    userActivities.includes(activity)
  );
  const activityScore =
    userActivities.length > 0
      ? commonActivities.length / userActivities.length
      : 0;

  // Calculate preferences match score
  const preferencesScore = calculatePreferencesScore(user, potentialMatch);

  // Calculate age score (placeholder since age is not used)
  const ageScore = 0;

  // Calculate weighted scores
  const weightedScores = {
    distance: distanceScore * WEIGHTS.distance,
    interests: activityScore * WEIGHTS.interests,
    verification: verificationScore * WEIGHTS.verification,
    availability: availabilityScore * WEIGHTS.availability,
    preferences: preferencesScore * WEIGHTS.preferences,
    age: ageScore * WEIGHTS.age,
    photo: photoScore * WEIGHTS.photo,
  };

  // Calculate total score
  const total = Object.values(weightedScores).reduce((sum, score) => sum + score, 0);

  return {
    total: Math.round(total * 100),
    distance: Math.round(weightedScores.distance * 100),
    interests: Math.round(weightedScores.interests * 100),
    availability: Math.round(weightedScores.availability * 100),
    activityTypes: Math.round(weightedScores.interests * 100),
  };
}

function calculatePreferencesScore(user: User, potentialMatch: User): number {
  const userPrefs = user.preferences;
  const matchPrefs = potentialMatch.preferences;

  if (!userPrefs || !matchPrefs) {
    return 0;
  }

  let score = 0;
  let totalCriteria = 0;

  // Check gender preferences
  if (userPrefs.gender.length > 0) {
    totalCriteria++;
    if (userPrefs.gender.includes(matchPrefs.gender[0] || '')) {
      score++;
    }
  }

  // Check relationship type preferences
  if (userPrefs.relationshipType.length > 0) {
    totalCriteria++;
    const commonTypes = matchPrefs.relationshipType.filter(type =>
      userPrefs.relationshipType.includes(type)
    );
    if (commonTypes.length > 0) {
      score++;
    }
  }

  // Check verification preference
  if (userPrefs.verifiedOnly) {
    totalCriteria++;
    if (potentialMatch.emailVerified) {
      score++;
    }
  }

  // Check photo preference
  if (userPrefs.withPhoto) {
    totalCriteria++;
    if (potentialMatch.image) {
      score++;
    }
  }

  return totalCriteria > 0 ? score / totalCriteria : 0;
}
