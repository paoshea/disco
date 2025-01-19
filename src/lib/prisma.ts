import { PrismaClient } from '@prisma/client';

// Add global type declaration
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export type ExtendedPrismaClient = PrismaClient & {
  $extends: {
    model: {
      location: {
        findFirst: (args: any) => Promise<any>;
        findMany: (args: any) => Promise<any>;
        create: (args: any) => Promise<any>;
        deleteMany: (args: any) => Promise<any>;
      };
      privacyZone: {
        findFirst: (args: any) => Promise<any>;
        findMany: (args: any) => Promise<any>;
        create: (args: any) => Promise<any>;
        delete: (args: any) => Promise<any>;
      };
      event: {
        findUnique: (args: any) => Promise<any>;
        findMany: (args: any) => Promise<any>;
        create: (args: any) => Promise<any>;
        update: (args: any) => Promise<any>;
        delete: (args: any) => Promise<any>;
      };
    };
  };
};

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export const db = prisma as ExtendedPrismaClient;
