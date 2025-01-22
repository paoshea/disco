import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import type { Event as PrismaEvent, User as PrismaUser, Location as PrismaLocation } from '@prisma/client';

// Mock modules before importing the service
jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: {
    event: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    location: {
      findFirst: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

// Import services and types
import { EventService } from '@/services/event/event.service';
import { Event, EventPrivacyMode, EventStatus } from '@/types/event';
import { prisma } from '@/lib/prisma';
import type { ServiceResponse } from '@/types/api';

describe('EventService', () => {
  let eventService: EventService;
  const mockDate = new Date('2025-01-22T01:41:48.108Z');

  const mockUser: PrismaUser = {
    id: 'user1',
    firstName: 'John',
    lastName: 'Doe',
    name: 'John Doe',
    email: 'john@example.com',
    password: 'hashedpassword',
    role: 'user',
    streakCount: 0,
    emailVerified: mockDate,
    verificationToken: null,
    refreshToken: null,
    refreshTokenExpiresAt: null,
    lastLogin: mockDate,
    lastStreak: mockDate,
    safetyEnabled: true,
    image: null,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockLocation: PrismaLocation = {
    id: 'loc1',
    userId: 'user1',
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 10,
    timestamp: mockDate,
    privacyMode: 'precise',
    sharingEnabled: true,
  };

  const mockEvent: PrismaEvent = {
    id: 'event1',
    title: 'Test Event',
    description: 'A test event',
    startTime: mockDate,
    endTime: new Date(mockDate.getTime() + 3600000), // 1 hour later
    locationId: 'loc1',
    hostId: 'user1',
    status: 'active',
    privacyMode: 'public',
    maxParticipants: 10,
    currentParticipants: 1,
    createdAt: mockDate,
    updatedAt: mockDate,
    category: 'social',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    eventService = EventService.getInstance();
  });

  describe('createEvent', () => {
    const eventData = {
      title: 'New Event',
      description: 'A new test event',
      startTime: mockDate,
      endTime: new Date(mockDate.getTime() + 3600000),
      privacyMode: 'public' as EventPrivacyMode,
      maxParticipants: 10,
      category: 'social',
    };

    it('should create a new event successfully', async () => {
      const mockFindFirst = prisma.location.findFirst as jest.MockedFunction<typeof prisma.location.findFirst>;
      const mockCreate = prisma.event.create as jest.MockedFunction<typeof prisma.event.create>;

      mockFindFirst.mockResolvedValue(mockLocation);
      mockCreate.mockResolvedValue(mockEvent);

      const result = await eventService.createEvent('user1', eventData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expect.objectContaining({
        title: eventData.title,
        description: eventData.description,
        hostId: 'user1',
      }));
    });

    it('should fail if user has no location', async () => {
      const mockFindFirst = prisma.location.findFirst as jest.MockedFunction<typeof prisma.location.findFirst>;
      mockFindFirst.mockResolvedValue(null);

      const result = await eventService.createEvent('user1', eventData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User location not found');
    });

    it('should validate event data', async () => {
      const invalidEventData = {
        ...eventData,
        startTime: new Date(mockDate.getTime() - 3600000), // Start time in past
      };

      const result = await eventService.createEvent('user1', invalidEventData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Start time must be in the future');
    });
  });

  describe('getNearbyEvents', () => {
    it('should find events within radius', async () => {
      const mockFindMany = prisma.event.findMany as jest.MockedFunction<typeof prisma.event.findMany>;
      mockFindMany.mockResolvedValue([mockEvent]);

      const result = await eventService.getNearbyEvents({
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 5000, // 5km
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(mockEvent.id);
    });

    it('should filter by privacy mode', async () => {
      const privateEvent = { ...mockEvent, privacyMode: 'private' as EventPrivacyMode };
      const mockFindMany = prisma.event.findMany as jest.MockedFunction<typeof prisma.event.findMany>;
      mockFindMany.mockResolvedValue([privateEvent]);

      const result = await eventService.getNearbyEvents({
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 5000,
        privacyMode: 'public',
      });

      expect(result).toHaveLength(0);
    });

    it('should handle no events found', async () => {
      const mockFindMany = prisma.event.findMany as jest.MockedFunction<typeof prisma.event.findMany>;
      mockFindMany.mockResolvedValue([]);

      const result = await eventService.getNearbyEvents({
        latitude: 37.7749,
        longitude: -122.4194,
        radius: 5000,
      });

      expect(result).toHaveLength(0);
    });
  });

  describe('updateEvent', () => {
    const updateData = {
      title: 'Updated Event',
      description: 'Updated description',
    };

    it('should update event successfully', async () => {
      const updatedEvent = { ...mockEvent, ...updateData };
      const mockUpdate = prisma.event.update as jest.MockedFunction<typeof prisma.event.update>;
      mockUpdate.mockResolvedValue(updatedEvent);

      const result = await eventService.updateEvent('event1', 'user1', updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(expect.objectContaining(updateData));
    });

    it('should fail if user is not host', async () => {
      const mockFindFirst = prisma.event.findFirst as jest.MockedFunction<typeof prisma.event.findFirst>;
      mockFindFirst.mockResolvedValue({ ...mockEvent, hostId: 'otherUser' });

      const result = await eventService.updateEvent('event1', 'user1', updateData);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not authorized');
    });
  });

  describe('joinEvent', () => {
    it('should allow user to join event', async () => {
      const mockFindFirst = prisma.event.findFirst as jest.MockedFunction<typeof prisma.event.findFirst>;
      const mockUpdate = prisma.event.update as jest.MockedFunction<typeof prisma.event.update>;

      mockFindFirst.mockResolvedValue(mockEvent);
      mockUpdate.mockResolvedValue({
        ...mockEvent,
        currentParticipants: mockEvent.currentParticipants + 1,
      });

      const result = await eventService.joinEvent('event1', 'user2');

      expect(result.success).toBe(true);
      expect(result.data.currentParticipants).toBe(mockEvent.currentParticipants + 1);
    });

    it('should prevent joining full events', async () => {
      const fullEvent = { ...mockEvent, currentParticipants: mockEvent.maxParticipants };
      const mockFindFirst = prisma.event.findFirst as jest.MockedFunction<typeof prisma.event.findFirst>;
      mockFindFirst.mockResolvedValue(fullEvent);

      const result = await eventService.joinEvent('event1', 'user2');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Event is full');
    });

    it('should prevent host from joining their own event', async () => {
      const mockFindFirst = prisma.event.findFirst as jest.MockedFunction<typeof prisma.event.findFirst>;
      mockFindFirst.mockResolvedValue(mockEvent);

      const result = await eventService.joinEvent('event1', mockEvent.hostId);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Cannot join your own event');
    });
  });

  describe('cancelEvent', () => {
    it('should allow host to cancel event', async () => {
      const mockFindFirst = prisma.event.findFirst as jest.MockedFunction<typeof prisma.event.findFirst>;
      const mockUpdate = prisma.event.update as jest.MockedFunction<typeof prisma.event.update>;

      mockFindFirst.mockResolvedValue(mockEvent);
      mockUpdate.mockResolvedValue({ ...mockEvent, status: 'cancelled' as EventStatus });

      const result = await eventService.cancelEvent('event1', 'user1');

      expect(result.success).toBe(true);
      expect(result.data.status).toBe('cancelled');
    });

    it('should prevent non-host from cancelling event', async () => {
      const mockFindFirst = prisma.event.findFirst as jest.MockedFunction<typeof prisma.event.findFirst>;
      mockFindFirst.mockResolvedValue(mockEvent);

      const result = await eventService.cancelEvent('event1', 'user2');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Not authorized');
    });
  });
});
