import { PrismaClient } from '@prisma/client';
import type { Event } from '@prisma/client';

// Add prisma to the global type
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

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

export { prisma };
