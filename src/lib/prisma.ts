import { PrismaClient } from '@prisma/client';
import type { Event, Location, PrivacyZone } from '@prisma/client';

// Add prisma to the global type
declare global {
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

type ModelReturnTypes = {
  event: Event;
  location: Location;
  privacyZone: PrivacyZone;
};

// Define base model operations
type ModelOperations<T> = {
  findFirst: (args: unknown) => Promise<T | null>;
  findMany: (args: unknown) => Promise<T[]>;
  create: (args: unknown) => Promise<T>;
  update: (args: unknown) => Promise<T>;
  delete: (args: unknown) => Promise<T>;
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

// Define the client extensions
const clientExtensions = {
  model: {
    $allModels: {
      findFirst: async function<T>(args: unknown): Promise<T | null> {
        return (this as any).findFirst(args);
      },
      findMany: async function<T>(args: unknown): Promise<T[]> {
        return (this as any).findMany(args);
      },
      create: async function<T>(args: unknown): Promise<T> {
        return (this as any).create(args);
      },
      update: async function<T>(args: unknown): Promise<T> {
        return (this as any).update(args);
      },
      delete: async function<T>(args: unknown): Promise<T> {
        return (this as any).delete(args);
      },
    },
  },
};

// Define event-specific methods
const eventExtensions = {
  findNearby: async function(
    this: any,
    latitude: number,
    longitude: number,
    radiusInMeters: number
  ): Promise<ModelReturnTypes['event'][]> {
    const radiusInDegrees = radiusInMeters / 111320; // rough approximation: 1 degree = 111.32 km
    return (this as any).findMany({
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
    });
  },
};

// Create the extended client
const extendedDb = (db.$extends(clientExtensions).$extends({
  model: {
    event: eventExtensions,
  },
}) as unknown) as ExtendedPrismaClient;

export { extendedDb as db };
