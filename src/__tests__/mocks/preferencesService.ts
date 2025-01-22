import { jest } from '@jest/globals';

const mockPreferencesService = {
  getPreferences: jest.fn(),
  updatePreferences: jest.fn(),
};

export default mockPreferencesService;
