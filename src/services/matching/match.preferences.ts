import { MatchPreferences } from '@/types/match';
import { UserPreferences } from '@/types/user';
import { AppLocationPrivacyMode } from '@/types/location';

export function convertToMatchPreferences(userPrefs: UserPreferences): MatchPreferences {
  return {
    maxDistance: userPrefs.maxDistance,
    ageRange: userPrefs.ageRange,
    activityTypes: userPrefs.activityTypes,
    availability: userPrefs.availability,
    gender: userPrefs.gender,
    lookingFor: userPrefs.lookingFor,
    relationshipType: userPrefs.relationshipType,
    verifiedOnly: userPrefs.verifiedOnly,
    withPhoto: userPrefs.withPhoto,
    privacyMode: userPrefs.privacy.location,
    timeWindow: 'anytime', // Default since not in UserPreferences
    useBluetoothProximity: false, // Default since not in UserPreferences
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
