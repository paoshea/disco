import { PrismaClient, Event, User, PrivacyZone, Notification, Match } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

interface FindNearbyParams {
  lat: number;
  lng: number;
  radius: number;
}

// Extend PrismaClient type with custom methods
interface PrismaClientExtended extends PrismaClient {
  event: PrismaClient['event'] & {
    findNearby(params: FindNearbyParams): Promise<Event[]>;
  };
  privacyZone: PrismaClient['privacyZone'] & {
    findOverlapping(center: { latitude: number; longitude: number }, radius: number): Promise<PrivacyZone[]>;
  };
  notification: PrismaClient['notification'] & {
    findUnread(userId: string): Promise<Notification[]>;
  };
  match: PrismaClient['match'] & {
    findPotentialMatches(userId: string, preferences: any): Promise<Match[]>;
  };
}

export const prismaMock = mockDeep<PrismaClientExtended>();

// Mock custom methods
prismaMock.event.findNearby.mockResolvedValue([]);
prismaMock.privacyZone.findOverlapping.mockResolvedValue([]);
prismaMock.notification.findUnread.mockResolvedValue([]);
prismaMock.match.findPotentialMatches.mockResolvedValue([]);

// Mock the global object
const mockPrisma = {
  ...prismaMock,
  $queryRaw: jest.fn(),
  $subscribe: {
    notification: jest.fn(() => ({
      on: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
    })),
    match: jest.fn(() => ({
      on: jest.fn().mockReturnValue({ unsubscribe: jest.fn() }),
    })),
  },
};

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: mockPrisma,
}));

beforeEach(() => {
  mockReset(prismaMock);
});

describe('Prisma Mock', () => {
  const mockDate = new Date();

  const mockEvent: Event = {
    id: '1',
    type: 'social',
    title: 'Test Event',
    description: 'A test event',
    creatorId: 'user123',
    latitude: 40.7128,
    longitude: -74.006,
    startTime: mockDate,
    endTime: new Date(mockDate.getTime() + 3600000), // 1 hour later
    maxParticipants: 10,
    tags: ['test', 'event'],
    createdAt: mockDate,
    updatedAt: mockDate,
    status: 'active',
  };

  const mockUser: User = {
    id: 'user123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockPrivacyZone: PrivacyZone = {
    id: 'zone123',
    userId: 'user123',
    name: 'Home',
    radius: 500,
    latitude: 40.7128,
    longitude: -74.006,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockNotification: Notification = {
    id: 'notif123',
    userId: 'user123',
    type: 'match_request',
    title: 'New Match Request',
    message: 'Someone wants to connect',
    timestamp: mockDate,
    read: false,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  const mockMatch: Match = {
    id: 'match123',
    userId: 'user123',
    matchedUserId: 'user456',
    status: 'pending',
    score: 0.85,
    createdAt: mockDate,
    updatedAt: mockDate,
  };

  beforeEach(() => {
    // Reset all mocks before each test
    prismaMock.event.findUnique.mockResolvedValue(mockEvent);
    prismaMock.user.findUnique.mockResolvedValue(mockUser);
    prismaMock.privacyZone.findUnique.mockResolvedValue(mockPrivacyZone);
    prismaMock.notification.findUnique.mockResolvedValue(mockNotification);
    prismaMock.match.findUnique.mockResolvedValue(mockMatch);
  });

  it('should mock findNearby method', async () => {
    prismaMock.event.findNearby.mockResolvedValue([mockEvent]);

    const result = await prismaMock.event.findNearby({
      lat: 40.7128,
      lng: -74.006,
      radius: 10,
    });

    expect(result).toEqual([mockEvent]);
    expect(prismaMock.event.findNearby).toHaveBeenCalledWith({
      lat: 40.7128,
      lng: -74.006,
      radius: 10,
    });
  });

  it('should mock standard Prisma methods', async () => {
    prismaMock.event.create.mockResolvedValue(mockEvent);

    const result = await prismaMock.event.create({
      data: {
        type: 'social',
        title: 'Test Event',
        description: 'A test event',
        creatorId: 'user123',
        latitude: 40.7128,
        longitude: -74.006,
        startTime: mockDate,
        endTime: new Date(mockDate.getTime() + 3600000),
        maxParticipants: 10,
        tags: ['test', 'event'],
      },
    });

    expect(result).toEqual(mockEvent);
    expect(prismaMock.event.create).toHaveBeenCalledWith({
      data: {
        type: 'social',
        title: 'Test Event',
        description: 'A test event',
        creatorId: 'user123',
        latitude: 40.7128,
        longitude: -74.006,
        startTime: mockDate,
        endTime: new Date(mockDate.getTime() + 3600000),
        maxParticipants: 10,
        tags: ['test', 'event'],
      },
    });
  });
});
