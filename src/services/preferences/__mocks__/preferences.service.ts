import type { UserPreferences } from '@/types/user';

const mockPreferences: UserPreferences = {
  maxDistance: 50,
  ageRange: {
    min: 18,
    max: 100,
  },
  interests: [],
  gender: [],
  lookingFor: [],
  relationshipType: [],
  notifications: {
    matches: true,
    messages: true,
    events: true,
    safety: true,
  },
  privacy: {
    showOnlineStatus: true,
    showLastSeen: true,
    showLocation: true,
    showAge: true,
  },
  safety: {
    requireVerifiedMatch: true,
    meetupCheckins: true,
    emergencyContactAlerts: true,
  },
  language: 'en',
  timezone: 'UTC',
};

const mockPreferencesService = {
  getPreferences: jest.fn().mockResolvedValue(mockPreferences),
  updatePreferences: jest.fn().mockImplementation((prefs: Partial<UserPreferences>) => 
    Promise.resolve({ ...mockPreferences, ...prefs })),
  resetPreferences: jest.fn().mockResolvedValue(mockPreferences),
};

export const setMockPreferences = (newPrefs: Partial<UserPreferences>) => {
  const updatedPrefs = { ...mockPreferences, ...newPrefs };
  mockPreferencesService.getPreferences.mockResolvedValueOnce(updatedPrefs);
  mockPreferencesService.updatePreferences.mockResolvedValueOnce(updatedPrefs);
  mockPreferencesService.resetPreferences.mockResolvedValueOnce(updatedPrefs);
};

export { mockPreferences };
export default mockPreferencesService;
