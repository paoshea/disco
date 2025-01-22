import { describe, it, expect } from '@jest/globals';
import { mockUser } from '../__mocks__/user';

describe('User Mock', () => {
  it('should have all required user properties', () => {
    expect(mockUser).toHaveProperty('id');
    expect(mockUser).toHaveProperty('name');
    expect(mockUser).toHaveProperty('email');
    expect(mockUser).toHaveProperty('preferences');
    
    // Check preferences structure
    expect(mockUser.preferences).toHaveProperty('maxDistance');
    expect(mockUser.preferences).toHaveProperty('ageRange');
    expect(mockUser.preferences).toHaveProperty('interests');
    expect(mockUser.preferences).toHaveProperty('gender');
    expect(mockUser.preferences).toHaveProperty('lookingFor');
    expect(mockUser.preferences).toHaveProperty('relationshipType');
    expect(mockUser.preferences).toHaveProperty('notifications');
    expect(mockUser.preferences).toHaveProperty('privacy');
    expect(mockUser.preferences).toHaveProperty('safety');
    expect(mockUser.preferences).toHaveProperty('theme');
    expect(mockUser.preferences).toHaveProperty('language');
    expect(mockUser.preferences).toHaveProperty('timezone');
  });

  it('should have valid preference values', () => {
    const { preferences } = mockUser;
    
    expect(typeof preferences.maxDistance).toBe('number');
    expect(preferences.ageRange).toHaveProperty('min');
    expect(preferences.ageRange).toHaveProperty('max');
    expect(Array.isArray(preferences.interests)).toBe(true);
    expect(Array.isArray(preferences.gender)).toBe(true);
    expect(Array.isArray(preferences.lookingFor)).toBe(true);
    expect(Array.isArray(preferences.relationshipType)).toBe(true);
    expect(typeof preferences.theme).toBe('string');
    expect(typeof preferences.language).toBe('string');
    expect(typeof preferences.timezone).toBe('string');
  });
});
