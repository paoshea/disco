import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';

export const prismaMock = mockDeep<PrismaClient>();

// Mock custom methods
prismaMock.event.findNearby = jest.fn();

// Mock the global object
const mockPrisma = {
  ...prismaMock,
  $queryRaw: jest.fn(),
};

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  prisma: mockPrisma,
}));
