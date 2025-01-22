import { jest } from '@jest/globals';
import type { UserPreferences } from '@/types/preferences';

const mockPreferences: UserPreferences = {
  theme: 'light',
  notifications: true,
  language: 'en',
};

export const mockPreferencesService = {
  getPreferences: jest.fn().mockResolvedValue(mockPreferences),
  updatePreferences: jest.fn().mockResolvedValue(mockPreferences),
  resetPreferences: jest.fn().mockResolvedValue(mockPreferences),
};

jest.mock('@/services/preferences/preferences.service', () => ({
  preferencesService: mockPreferencesService,
}));

describe('Preferences Service Mock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mock getPreferences', async () => {
    const prefs = await mockPreferencesService.getPreferences();
    expect(prefs).toEqual(mockPreferences);
    expect(mockPreferencesService.getPreferences).toHaveBeenCalled();
  });

  it('should mock updatePreferences', async () => {
    const newPrefs = { ...mockPreferences, theme: 'dark' };
    mockPreferencesService.updatePreferences.mockResolvedValueOnce(newPrefs);
    
    const prefs = await mockPreferencesService.updatePreferences(newPrefs);
    expect(prefs).toEqual(newPrefs);
    expect(mockPreferencesService.updatePreferences).toHaveBeenCalledWith(newPrefs);
  });
});

export { mockPreferences, mockPreferencesService };
