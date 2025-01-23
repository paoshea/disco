import { User } from '@/types/user';
import { WeightedCriteria, MatchScore } from '@/types/match';
import { calculateDistance } from '@/utils/location';

const WEIGHTS: WeightedCriteria = {
  distance: 0.3,
  interests: 0.2,
  verification: 0.1,
  availability: 0.15,
  preferences: 0.15,
  age: 0.05,
  photo: 0.05,
};

export async function calculateMatchScore(user: User, potentialMatch: User): Promise<MatchScore | null> {
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
  const availabilityScore = userAvailability.length > 0 
    ? commonAvailability.length / userAvailability.length 
    : 0;

  // Calculate activity preferences score
  const userActivities = user.preferences?.activityTypes || [];
  const matchActivities = potentialMatch.preferences?.activityTypes || [];
  const commonActivities = matchActivities.filter(activity => 
    userActivities.includes(activity)
  );
  const activityScore = userActivities.length > 0 
    ? commonActivities.length / userActivities.length 
    : 0;

  // Calculate preferences match score
  const preferencesScore = calculatePreferencesScore(user, potentialMatch);

  // Calculate age score (placeholder since age is not used)
  const ageScore = 0;

  // Calculate weighted scores
  const weightedScores: WeightedCriteria = {
    distance: distanceScore,
    interests: activityScore,
    verification: verificationScore,
    availability: availabilityScore,
    preferences: preferencesScore,
    age: ageScore,
    photo: photoScore,
  };

  // Calculate total score
  const total = Object.entries(WEIGHTS).reduce(
    (sum, [key, weight]) => sum + weightedScores[key as keyof WeightedCriteria] * weight,
    0
  );

  return {
    total,
    criteria: weightedScores,
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

  // Gender preferences
  if (userPrefs.gender.length > 0 && matchPrefs.gender.length > 0) {
    const genderMatch = userPrefs.gender.some(g => matchPrefs.gender.includes(g));
    if (genderMatch) score++;
    totalCriteria++;
  }

  // Looking for preferences
  if (userPrefs.lookingFor.length > 0 && matchPrefs.lookingFor.length > 0) {
    const lookingForMatch = userPrefs.lookingFor.some(l => matchPrefs.lookingFor.includes(l));
    if (lookingForMatch) score++;
    totalCriteria++;
  }

  // Relationship type preferences
  if (userPrefs.relationshipType.length > 0 && matchPrefs.relationshipType.length > 0) {
    const relationshipMatch = userPrefs.relationshipType.some(r => matchPrefs.relationshipType.includes(r));
    if (relationshipMatch) score++;
    totalCriteria++;
  }

  return totalCriteria > 0 ? score / totalCriteria : 0;
}
