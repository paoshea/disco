import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

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
