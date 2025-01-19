import { PrismaClient } from '@prisma/client';

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

// Define return types for model operations
type ModelReturnTypes = {
  event: any; // Will be replaced with proper type from schema
  location: any; // Will be replaced with proper type from schema
  privacyZone: any; // Will be replaced with proper type from schema
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
  $extends: {
    model: {
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
  };
};

// Define the client extensions
const clientExtensions = {
  model: {
    $allModels: {
      async findFirst(args: unknown) {
        return await (this as any).findFirst(args);
      },
      async findMany(args: unknown) {
        return await (this as any).findMany(args);
      },
      async create(args: unknown) {
        return await (this as any).create(args);
      },
      async update(args: unknown) {
        return await (this as any).update(args);
      },
      async delete(args: unknown) {
        return await (this as any).delete(args);
      },
    },
  },
};

// Define event-specific methods
const eventExtensions = {
  async findNearby(
    latitude: number,
    longitude: number,
    radiusInMeters: number
  ): Promise<ModelReturnTypes['event'][]> {
    return await db.$queryRaw`
      SELECT * FROM "Event"
      WHERE ST_DWithin(
        ST_MakePoint(longitude, latitude)::geography,
        ST_MakePoint(${longitude}, ${latitude})::geography,
        ${radiusInMeters}
      );
    `;
  },
};

// Create the extended client
const extendedDb = db.$extends(clientExtensions).$extends({
  model: {
    event: eventExtensions,
  },
}) as unknown as ExtendedPrismaClient;

export { db, extendedDb };
