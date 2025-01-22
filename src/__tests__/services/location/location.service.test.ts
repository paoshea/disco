import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import type { Location as PrismaLocation, User as PrismaUser } from '@prisma/client';

// Mock modules before importing the service
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: {
    location: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Now import the service and types
import { LocationService } from '@/services/location/location.service';
import { Location, LocationPrivacyMode } from '@/types/location';
import { prisma } from '@/lib/prisma';
import type { ServiceResponse } from '@/types/api';
import type { User } from '@/types/user';

describe('LocationService', () => {
  let locationService: LocationService;
  const mockDate = new Date('2025-01-22T01:41:48.108Z');

  const mockLocation: PrismaLocation = {
    id: '1',
    userId: 'user1',
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 10,
    timestamp: mockDate,
    privacyMode: 'precise',
    sharingEnabled: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    locationService = LocationService.getInstance();
  });

  describe('getLocation', () => {
    it('should return the most recent location for a user', async () => {
      const mockFindFirst = prisma.location.findFirst as jest.MockedFunction<typeof prisma.location.findFirst>;
      mockFindFirst.mockResolvedValue(mockLocation);

      const result = await locationService.getLocation('user1');

      expect(result).toEqual(mockLocation);
      expect(mockFindFirst).toHaveBeenCalledWith({
        where: { userId: 'user1' },
        orderBy: { timestamp: 'desc' },
      });
    });

    it('should return null if no location exists', async () => {
      const mockFindFirst = prisma.location.findFirst as jest.MockedFunction<typeof prisma.location.findFirst>;
      mockFindFirst.mockResolvedValue(null);

      const result = await locationService.getLocation('user1');

      expect(result).toBeNull();
    });
  });

  describe('updateLocation', () => {
    const newLocation = {
      latitude: 37.7749,
      longitude: -122.4194,
      accuracy: 10,
      privacyMode: 'precise' as LocationPrivacyMode,
      sharingEnabled: true,
    };

    it('should create a new location entry', async () => {
      const mockResponse: PrismaLocation = {
        ...mockLocation,
        ...newLocation,
      };

      const mockUpsert = prisma.location.upsert as jest.MockedFunction<typeof prisma.location.upsert>;
      mockUpsert.mockResolvedValue(mockResponse);

      const result = await locationService.updateLocation('user1', newLocation);

      expect(result).toEqual({
        success: true,
        data: expect.objectContaining(newLocation),
      });
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({
          create: expect.objectContaining({
            userId: 'user1',
            ...newLocation,
          }),
        })
      );
    });

    it('should handle privacy modes correctly', async () => {
      const approximateLocation = {
        ...newLocation,
        privacyMode: 'approximate' as LocationPrivacyMode,
      };

      const mockResponse: PrismaLocation = {
        ...mockLocation,
        ...approximateLocation,
      };

      const mockUpsert = prisma.location.upsert as jest.MockedFunction<typeof prisma.location.upsert>;
      mockUpsert.mockResolvedValue(mockResponse);

      const result = await locationService.updateLocation('user1', approximateLocation);

      expect(result.success).toBe(true);
      expect(result.data?.privacyMode).toBe('approximate');
    });

    it('should handle errors gracefully', async () => {
      const mockUpsert = prisma.location.upsert as jest.MockedFunction<typeof prisma.location.upsert>;
      mockUpsert.mockRejectedValue(new Error('Database error'));

      const result = await locationService.updateLocation('user1', newLocation);

      expect(result).toEqual({
        success: false,
        error: 'Failed to update location',
      });
    });
  });

  describe('getNearbyUsers', () => {
    const mockUsers: (PrismaUser & { locations: PrismaLocation[] })[] = [
      {
        id: 'user2',
        firstName: 'John',
        lastName: 'Doe',
        name: 'John Doe',
        email: 'john@example.com',
        updatedAt: mockDate,
        createdAt: mockDate,
        emailVerified: mockDate,
        image: null,
        password: 'hashedpassword',
        role: 'user',
        streakCount: 0,
        verificationToken: null,
        refreshToken: null,
        refreshTokenExpiresAt: null,
        lastLogin: mockDate,
        lastStreak: mockDate,
        safetyEnabled: true,
        locations: [
          {
            ...mockLocation,
            id: '2',
            userId: 'user2',
            latitude: 37.7833,
            longitude: -122.4167,
          },
        ],
      },
    ];

    beforeEach(() => {
      const mockFindMany = prisma.user.findMany as jest.MockedFunction<typeof prisma.user.findMany>;
      mockFindMany.mockResolvedValue(mockUsers);
    });

    it('should find users within specified radius', async () => {
      const result = await locationService.getNearbyUsers(
        {
          latitude: 37.7749,
          longitude: -122.4194,
        },
        5000 // 5km
      );

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('user2');
      expect(result[0].name).toBe('John Doe');
      expect(result[0].verificationStatus).toBe('verified');
      expect(result[0].location).toBeDefined();
    });

    it('should handle users without locations', async () => {
      const usersWithoutLocation: (PrismaUser & { locations: PrismaLocation[] })[] = [
        {
          ...mockUsers[0],
          locations: [],
        },
      ];

      const mockFindMany = prisma.user.findMany as jest.MockedFunction<typeof prisma.user.findMany>;
      mockFindMany.mockResolvedValue(usersWithoutLocation);

      const result = await locationService.getNearbyUsers(
        {
          latitude: 37.7749,
          longitude: -122.4194,
        },
        5000
      );

      expect(result[0].location).toBeUndefined();
    });

    it('should handle no nearby users', async () => {
      const mockFindMany = prisma.user.findMany as jest.MockedFunction<typeof prisma.user.findMany>;
      mockFindMany.mockResolvedValue([]);

      const result = await locationService.getNearbyUsers(
        {
          latitude: 37.7749,
          longitude: -122.4194,
        },
        5000
      );

      expect(result).toHaveLength(0);
    });
  });

  describe('toggleLocationSharing', () => {
    it('should toggle location sharing', async () => {
      const currentLocation: PrismaLocation = { ...mockLocation, sharingEnabled: false };
      const updatedLocation: PrismaLocation = { ...mockLocation, sharingEnabled: true };

      const mockFindFirst = prisma.location.findFirst as jest.MockedFunction<typeof prisma.location.findFirst>;
      const mockUpdate = prisma.location.update as jest.MockedFunction<typeof prisma.location.update>;
      
      mockFindFirst.mockResolvedValue(currentLocation);
      mockUpdate.mockResolvedValue(updatedLocation);

      const result = await locationService.toggleLocationSharing('user1');

      expect(result).toEqual(updatedLocation);
      expect(mockUpdate).toHaveBeenCalledWith({
        where: { id: currentLocation.id },
        data: { sharingEnabled: true },
      });
    });

    it('should return null if no location exists', async () => {
      const mockFindFirst = prisma.location.findFirst as jest.MockedFunction<typeof prisma.location.findFirst>;
      mockFindFirst.mockResolvedValue(null);

      const result = await locationService.toggleLocationSharing('user1');

      expect(result).toBeNull();
    });
  });
});
