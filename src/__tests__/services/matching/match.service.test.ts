import { jest, describe, beforeEach, it, expect } from '@jest/globals';

// Mock modules before importing the service
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: {
    event: {
      findNearby: jest.fn(),
    },
    $queryRaw: jest.fn(),
  },
}));

jest.mock('@/lib/redis', () => ({
  __esModule: true,
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    expire: jest.fn(),
  },
}));

jest.mock('@/utils/location', () => ({
  calculateDistance: jest.fn(),
  isWithinRadius: jest.fn(),
  formatDistance: jest.fn(),
  reverseGeocode: jest.fn(),
  getLocationFromAddress: jest.fn(),
}));

jest.mock('@/services/location/location.service', () => ({
  LocationService: {
    getInstance: jest.fn().mockReturnValue({
      getUserLocation: jest.fn(),
      updateUserLocation: jest.fn(),
    }),
  },
}));

jest.mock('@/services/user/user.service', () => ({
  UserService: {
    getInstance: jest.fn().mockReturnValue({
      getUserPreferences: jest.fn(),
      updateUserPreferences: jest.fn(),
    }),
  },
}));

jest.mock('@/services/matching/match.algorithm', () => ({
  MatchAlgorithm: jest.fn().mockImplementation(() => ({
    calculateMatchScore: jest.fn(),
  })),
}));

// Now import the service and types
import { MatchingService } from '@/services/matching/match.service';
import { User as PrismaUser, Location as PrismaLocation } from '@prisma/client';
import { LocationPrivacyMode } from '@/types/location';

describe('MatchingService', () => {
  const mockDate = new Date('2025-01-22T01:41:48.108Z');

  const mockPrismaUser: PrismaUser & { locations?: PrismaLocation[] } = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    name: 'Test User',
    emailVerified: mockDate,
    image: null,
    password: 'hashed_password',
    role: 'user',
    verificationToken: null,
    refreshToken: null,
    refreshTokenExpiresAt: null,
    lastLogin: mockDate,
    streakCount: 5,
    lastStreak: mockDate,
    safetyEnabled: true,
    createdAt: mockDate,
    updatedAt: mockDate,
    locations: [
      {
        id: '1',
        userId: '1',
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10,
        privacyMode: 'precise' as LocationPrivacyMode,
        sharingEnabled: true,
        timestamp: mockDate,
      },
    ],
  };

  // Access the private static method using type assertion
  const convertToAppUser = (MatchingService as any)['convertToAppUser'];

  describe('convertToAppUser', () => {
    it('should convert PrismaUser to AppUser with location', () => {
      const appUser = convertToAppUser(mockPrismaUser);

      expect(appUser).toEqual({
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true,
        name: 'Test User',
        verificationStatus: 'verified',
        lastActive: mockDate,
        role: 'user',
        streakCount: 5,
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          accuracy: 10,
          privacyMode: 'precise',
          timestamp: mockDate,
        },
        createdAt: mockDate,
        updatedAt: mockDate,
      });
    });

    it('should convert PrismaUser to AppUser without location', () => {
      const userWithoutLocation = { ...mockPrismaUser, locations: [] };
      const appUser = convertToAppUser(userWithoutLocation);

      expect(appUser).toEqual({
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        emailVerified: true,
        name: 'Test User',
        verificationStatus: 'verified',
        lastActive: mockDate,
        role: 'user',
        streakCount: 5,
        location: undefined,
        createdAt: mockDate,
        updatedAt: mockDate,
      });
    });

    it('should handle null emailVerified field', () => {
      const userWithNullEmail = { ...mockPrismaUser, emailVerified: null };
      const appUser = convertToAppUser(userWithNullEmail);

      expect(appUser.emailVerified).toBe(false);
      expect(appUser.verificationStatus).toBe('pending');
    });

    it('should handle different user roles', () => {
      const adminUser = { ...mockPrismaUser, role: 'admin' };
      const moderatorUser = { ...mockPrismaUser, role: 'moderator' };

      const adminAppUser = convertToAppUser(adminUser);
      const moderatorAppUser = convertToAppUser(moderatorUser);

      expect(adminAppUser.role).toBe('admin');
      expect(moderatorAppUser.role).toBe('moderator');
    });

    it('should handle undefined streakCount', () => {
      const userWithoutStreak = {
        ...mockPrismaUser,
        streakCount: undefined as unknown as number,
      };
      const appUser = convertToAppUser(userWithoutStreak);

      expect(appUser.streakCount).toBe(0);
    });

    it('should handle location without accuracy', () => {
      const userWithLocationNoAccuracy = {
        ...mockPrismaUser,
        locations: [
          {
            ...mockPrismaUser.locations![0],
            accuracy: null,
          },
        ],
      };
      const appUser = convertToAppUser(userWithLocationNoAccuracy);

      expect(appUser.location?.accuracy).toBeUndefined();
    });
  });
});
