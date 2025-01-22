import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { mockPreferencesService } from '../__mocks__/preferences.service';

jest.mock('../preferences.service', () => ({
  preferencesService: mockPreferencesService,
}));

describe('Preferences Service Mock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mock getPreferences', async () => {
    const preferences = await mockPreferencesService.getPreferences();
    expect(preferences).toBeDefined();
    expect(mockPreferencesService.getPreferences).toHaveBeenCalled();
  });

  it('should mock updatePreferences', async () => {
    const newPreferences = {
      theme: 'dark',
      notifications: false,
      language: 'es',
      timezone: 'UTC',
    };
    const updatedPreferences = await mockPreferencesService.updatePreferences(newPreferences);
    expect(updatedPreferences).toBeDefined();
    expect(mockPreferencesService.updatePreferences).toHaveBeenCalledWith(newPreferences);
  });
});
