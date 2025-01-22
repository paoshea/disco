import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import mockPreferencesService from './preferencesService';

describe('Preferences Service Mock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mock getPreferences', async () => {
    const mockPrefs = { theme: 'dark' };
    mockPreferencesService.getPreferences.mockResolvedValue(mockPrefs);

    const result = await mockPreferencesService.getPreferences();
    expect(result).toEqual(mockPrefs);
    expect(mockPreferencesService.getPreferences).toHaveBeenCalled();
  });

  it('should mock updatePreferences', async () => {
    const mockPrefs = { theme: 'light' };
    mockPreferencesService.updatePreferences.mockResolvedValue(mockPrefs);

    const result = await mockPreferencesService.updatePreferences(mockPrefs);
    expect(result).toEqual(mockPrefs);
    expect(mockPreferencesService.updatePreferences).toHaveBeenCalledWith(mockPrefs);
  });
});
