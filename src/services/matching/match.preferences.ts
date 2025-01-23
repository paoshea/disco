import { MatchPreferences } from '@/types/match';
import { UserPreferences } from '@/types/user';
import { AppLocationPrivacyMode } from '@/types/location';

export function convertToMatchPreferences(
  userPrefs: UserPreferences
): MatchPreferences {
  return {
    maxDistance: userPrefs.maxDistance,
    ageRange: userPrefs.ageRange,
    activityTypes: userPrefs.activityTypes || [],
    availability: userPrefs.availability || [],
    gender: userPrefs.gender || [],
    lookingFor: userPrefs.lookingFor || [],
    relationshipType: userPrefs.relationshipType || [],
    verifiedOnly: userPrefs.verifiedOnly || false,
    withPhoto: userPrefs.withPhoto || true,
    privacyMode: userPrefs.privacy.location,
    timeWindow: 'anytime',
    useBluetoothProximity: false,
  };
}

export function getDefaultMatchPreferences(): MatchPreferences {
  return {
    maxDistance: 50,
    ageRange: {
      min: 18,
      max: 99,
    },
    activityTypes: [],
    availability: [],
    gender: [],
    lookingFor: [],
    relationshipType: [],
    verifiedOnly: false,
    withPhoto: true,
    privacyMode: 'standard' as AppLocationPrivacyMode,
    timeWindow: 'anytime',
    useBluetoothProximity: false,
  };
}
