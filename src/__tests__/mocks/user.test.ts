import { describe, it, expect } from '@jest/globals';
import { mockUser } from './user';

describe('User Mock', () => {
  it('should have all required user properties', () => {
    expect(mockUser).toHaveProperty('id');
    expect(mockUser).toHaveProperty('email');
    expect(mockUser).toHaveProperty('firstName');
    expect(mockUser).toHaveProperty('lastName');
    expect(mockUser).toHaveProperty('name');
    expect(mockUser).toHaveProperty('role');
    expect(mockUser).toHaveProperty('streakCount');
    expect(mockUser).toHaveProperty('emailVerified');
    expect(mockUser).toHaveProperty('verificationStatus');
    expect(mockUser).toHaveProperty('lastActive');
    expect(mockUser).toHaveProperty('createdAt');
    expect(mockUser).toHaveProperty('updatedAt');
  });

  it('should have valid property values', () => {
    expect(typeof mockUser.id).toBe('string');
    expect(typeof mockUser.email).toBe('string');
    expect(typeof mockUser.firstName).toBe('string');
    expect(typeof mockUser.lastName).toBe('string');
    expect(typeof mockUser.name).toBe('string');
    expect(typeof mockUser.role).toBe('string');
    expect(typeof mockUser.streakCount).toBe('number');
    expect(typeof mockUser.emailVerified).toBe('boolean');
    expect(typeof mockUser.verificationStatus).toBe('string');
    expect(mockUser.lastActive instanceof Date).toBe(true);
    expect(mockUser.createdAt instanceof Date).toBe(true);
    expect(mockUser.updatedAt instanceof Date).toBe(true);
  });
});
