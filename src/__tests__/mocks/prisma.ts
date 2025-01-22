import { PrismaClient, Event } from '@prisma/client';
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
}

export const prismaMock = mockDeep<PrismaClientExtended>();

// Mock custom methods
prismaMock.event.findNearby.mockResolvedValue([]);

// Mock the global object
const mockPrisma = {
  ...prismaMock,
  $queryRaw: jest.fn(),
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
  };

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
