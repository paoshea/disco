
import { PrismaClient } from '@prisma/client';
import type { Event } from '@prisma/client';

// Add prisma to the global type
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Extend PrismaClient with custom methods
Object.assign(prisma.event, {
  async findNearby(
    latitude: number,
    longitude: number,
    radiusInMeters: number
  ): Promise<Event[]> {
    const events = await prisma.$queryRaw<Event[]>`
      SELECT *
      FROM "Event"
      WHERE ST_DWithin(
        ST_MakePoint(longitude, latitude)::geography,
        ST_MakePoint(${longitude}, ${latitude})::geography,
        ${radiusInMeters}
      )
    `;
    return events;
  },
});
