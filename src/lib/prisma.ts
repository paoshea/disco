import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
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
