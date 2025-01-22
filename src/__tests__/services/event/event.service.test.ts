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
      findUnique: jest.fn(),
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
import type { Event, EventWithParticipants } from '@/types/event';
import { prisma } from '@/lib/prisma';
import type { ServiceResponse } from '@/types/service';

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

  const mockEvent: Event = {
    id: 'event1',
    title: 'Test Event',
    description: 'A test event',
    type: 'social',
    eventType: 'social',
    creatorId: 'user1',
    creator: {
      id: 'user1',
      name: 'John Doe',
    },
    location: {
      latitude: 37.7749,
      longitude: -122.4194,
    },
    startTime: mockDate,
    endTime: new Date(mockDate.getTime() + 3600000),
    maxParticipants: 10,
    currentParticipants: 1,
    participants: [],
    tags: ['test'],
    createdAt: mockDate,
    updatedAt: mockDate,
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
      type: 'social' as const,
      maxParticipants: 10,
      latitude: 37.7749,
      longitude: -122.4194,
      creatorId: 'user1',
      tags: ['test'],
    };

    it('should create a new event successfully', async () => {
      const mockCreate = prisma.event.create as jest.MockedFunction<typeof prisma.event.create>;
      mockCreate.mockResolvedValue({
        id: 'event1',
        title: eventData.title,
        description: eventData.description,
        type: eventData.type,
        latitude: eventData.latitude,
        longitude: eventData.longitude,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        maxParticipants: eventData.maxParticipants,
        tags: eventData.tags,
        creatorId: eventData.creatorId,
        createdAt: mockDate,
        updatedAt: mockDate,
        creator: {
          id: 'user1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
        participants: [],
      } as any);

      const result = await eventService.createEvent(eventData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(expect.objectContaining({
          title: eventData.title,
          description: eventData.description,
          creatorId: eventData.creatorId,
          type: eventData.type,
          location: {
            latitude: eventData.latitude,
            longitude: eventData.longitude,
          },
        }));
      }
    });

    it('should validate event data', async () => {
      const mockCreate = prisma.event.create as jest.MockedFunction<typeof prisma.event.create>;
      mockCreate.mockRejectedValue(new Error('Start time must be in the future'));

      const invalidEventData = {
        ...eventData,
        startTime: new Date(mockDate.getTime() - 3600000), // Start time in past
      };

      const result = await eventService.createEvent(invalidEventData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Failed to create event');
      }
    });
  });

  describe('getNearbyEvents', () => {
    it('should find events within radius', async () => {
      const mockFindMany = prisma.event.findMany as jest.MockedFunction<typeof prisma.event.findMany>;
      mockFindMany.mockResolvedValue([{
        id: 'event1',
        title: 'Test Event',
        description: 'A test event',
        type: 'social',
        latitude: 37.7749,
        longitude: -122.4194,
        startTime: mockDate,
        endTime: new Date(mockDate.getTime() + 3600000),
        maxParticipants: 10,
        tags: ['test'],
        creatorId: 'user1',
        createdAt: mockDate,
        updatedAt: mockDate,
        creator: {
          id: 'user1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
        participants: [],
      }] as any);

      const result = await eventService.getNearbyEvents(
        37.7749,
        -122.4194,
        5000, // 5km
      );

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.length).toBeGreaterThan(0);
        expect(result.data[0].id).toBe('event1');
      }
    });

    it('should handle no events found', async () => {
      const mockFindMany = prisma.event.findMany as jest.MockedFunction<typeof prisma.event.findMany>;
      mockFindMany.mockResolvedValue([]);

      const result = await eventService.getNearbyEvents(
        37.7749,
        -122.4194,
        5000,
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toHaveLength(0);
      }
    });
  });

  describe('updateEvent', () => {
    const updateData = {
      title: 'Updated Event',
      description: 'Updated description',
    };

    it('should update event successfully', async () => {
      const mockFindUnique = prisma.event.findUnique as jest.MockedFunction<typeof prisma.event.findUnique>;
      const mockUpdate = prisma.event.update as jest.MockedFunction<typeof prisma.event.update>;

      mockFindUnique.mockResolvedValue(mockEvent as any);
      mockUpdate.mockResolvedValue({
        ...mockEvent,
        ...updateData,
      } as any);

      const result = await eventService.updateEvent('event1', updateData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(expect.objectContaining(updateData));
      }
    });

    it('should fail if event not found', async () => {
      const mockFindUnique = prisma.event.findUnique as jest.MockedFunction<typeof prisma.event.findUnique>;
      mockFindUnique.mockResolvedValue(null);

      const result = await eventService.updateEvent('event1', updateData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Event not found');
      }
    });
  });

  describe('joinEvent', () => {
    it('should allow user to join event', async () => {
      const mockFindUnique = prisma.event.findUnique as jest.MockedFunction<typeof prisma.event.findUnique>;
      const mockUpdate = prisma.event.update as jest.MockedFunction<typeof prisma.event.update>;

      mockFindUnique.mockResolvedValue({
        ...mockEvent,
        participants: [],
      } as any);

      mockUpdate.mockResolvedValue({
        ...mockEvent,
        participants: [
          {
            id: 'participant1',
            userId: 'user2',
            eventId: 'event1',
            createdAt: mockDate,
            updatedAt: mockDate,
            user: {
              id: 'user2',
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane@example.com',
            },
          },
        ],
      } as any);

      const result = await eventService.joinEvent('event1', 'user2');

      expect(result.success).toBe(true);
      if (result.success && result.data) {
        expect(result.data.participants.length).toBe(1);
        expect(result.data.participants[0].userId).toBe('user2');
      }
    });

    it('should prevent joining full events', async () => {
      const mockFindUnique = prisma.event.findUnique as jest.MockedFunction<typeof prisma.event.findUnique>;

      const fullEvent = {
        ...mockEvent,
        maxParticipants: 2,
        participants: [
          {
            id: 'participant1',
            userId: 'user2',
            eventId: 'event1',
            createdAt: mockDate,
            updatedAt: mockDate,
            user: {
              id: 'user2',
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane@example.com',
            },
          },
          {
            id: 'participant2',
            userId: 'user3',
            eventId: 'event1',
            createdAt: mockDate,
            updatedAt: mockDate,
            user: {
              id: 'user3',
              firstName: 'Bob',
              lastName: 'Smith',
              email: 'bob@example.com',
            },
          },
        ],
      };

      mockFindUnique.mockResolvedValue(fullEvent as any);

      const result = await eventService.joinEvent('event1', 'user4');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Event is full');
      }
    });

    it('should prevent creator from joining their own event', async () => {
      const mockFindUnique = prisma.event.findUnique as jest.MockedFunction<typeof prisma.event.findUnique>;
      mockFindUnique.mockResolvedValue(mockEvent as any);

      const result = await eventService.joinEvent('event1', mockEvent.creatorId);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe('Cannot join your own event');
      }
    });
  });
});
