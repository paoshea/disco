import { PrismaClient } from '@prisma/client';
import type { Prisma } from '@prisma/client';

// Add prisma to the global type
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Prevent multiple instances of Prisma Client in development
let db: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  db = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  db = global.prisma;
}

type PrismaArgs = Record<string, unknown>;

type ModelReturnTypes = {
  event: Prisma.EventGetPayload<Record<string, never>>;
  location: Prisma.LocationGetPayload<Record<string, never>>;
  privacyZone: Prisma.PrivacyZoneGetPayload<Record<string, never>>;
};

// Define base model operations
type ModelOperations<T> = {
  findFirst: (args: PrismaArgs) => Promise<T | null>;
  findMany: (args: PrismaArgs) => Promise<T[]>;
  create: (args: PrismaArgs) => Promise<T>;
  update: (args: PrismaArgs) => Promise<T>;
  delete: (args: PrismaArgs) => Promise<T>;
};

export type ExtendedPrismaClient = PrismaClient & {
  event: ModelOperations<ModelReturnTypes['event']> & {
    findNearby: (
      latitude: number,
      longitude: number,
      radiusInMeters: number
    ) => Promise<ModelReturnTypes['event'][]>;
  };
  location: ModelOperations<ModelReturnTypes['location']>;
  privacyZone: ModelOperations<ModelReturnTypes['privacyZone']>;
};

type PrismaModel = {
  findFirst: (args: PrismaArgs) => Promise<unknown>;
  findMany: (args: PrismaArgs) => Promise<unknown[]>;
  create: (args: PrismaArgs) => Promise<unknown>;
  update: (args: PrismaArgs) => Promise<unknown>;
  delete: (args: PrismaArgs) => Promise<unknown>;
};

// Define the client extensions
const clientExtensions = {
  model: {
    $allModels: {
      async findFirst<T>(this: PrismaModel, args: PrismaArgs): Promise<T | null> {
        return this.findFirst(args) as Promise<T | null>;
      },
      async findMany<T>(this: PrismaModel, args: PrismaArgs): Promise<T[]> {
        return this.findMany(args) as Promise<T[]>;
      },
      async create<T>(this: PrismaModel, args: PrismaArgs): Promise<T> {
        return this.create(args) as Promise<T>;
      },
      async update<T>(this: PrismaModel, args: PrismaArgs): Promise<T> {
        return this.update(args) as Promise<T>;
      },
      async delete<T>(this: PrismaModel, args: PrismaArgs): Promise<T> {
        return this.delete(args) as Promise<T>;
      },
    },
  },
};

// Define event-specific methods
const eventExtensions = {
  async findNearby(
    this: PrismaModel,
    latitude: number,
    longitude: number,
    radiusInMeters: number
  ): Promise<ModelReturnTypes['event'][]> {
    const radiusInDegrees = radiusInMeters / 111320; // rough approximation: 1 degree = 111.32 km
    return this.findMany({
      where: {
        AND: [
          {
            latitude: {
              gte: latitude - radiusInDegrees,
              lte: latitude + radiusInDegrees,
            },
          },
          {
            longitude: {
              gte: longitude - radiusInDegrees,
              lte: longitude + radiusInDegrees,
            },
          },
        ],
      },
    }) as Promise<ModelReturnTypes['event'][]>;
  },
};

// Create the extended client
export const prisma = db.$extends(clientExtensions).$extends({
  model: { event: eventExtensions },
}) as unknown as ExtendedPrismaClient;

export { db };
