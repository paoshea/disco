import { PrismaClient, Prisma } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn', 'info']
        : ['error'],
    errorFormat: 'pretty',
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
  ): Promise<Prisma.EventGetPayload<Record<string, never>>[]> {
    const events = await prisma.$queryRaw<
      Prisma.EventGetPayload<Record<string, never>>[]
    >`
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

type EventInclude = {
  creator:
    | boolean
    | {
        select: {
          id: true;
          email: true;
          firstName: true;
          lastName: true;
        };
      };
  participants:
    | boolean
    | {
        include: {
          user: {
            select: {
              id: true;
              email: true;
              firstName: true;
              lastName: true;
            };
          };
        };
      };
};

export type EventWithParticipants = Prisma.EventGetPayload<{
  include: EventInclude;
}>;

type LocationInclude = {
  user:
    | boolean
    | {
        select: {
          id: true;
          email: true;
          firstName: true;
          lastName: true;
        };
      };
};

export type LocationWithUser = Prisma.LocationGetPayload<{
  include: LocationInclude;
}>;

export type ExtendedPrismaClient = PrismaClient & {
  $extends: {
    model: {
      event: {
        findNearby: (
          latitude: number,
          longitude: number,
          radiusInMeters: number
        ) => Promise<EventWithParticipants[]>;
      };
      location: {
        findNearby: (
          latitude: number,
          longitude: number,
          radiusInMeters: number
        ) => Promise<LocationWithUser[]>;
      };
    };
  };
};

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type UserWithProfile = Prisma.UserGetPayload<{
  select: {
    id: true;
    email: true;
    profile: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        role: true;
        emailVerified: true;
        createdAt: true;
        updatedAt: true;
      };
    };
  };
}>;

export type PrismaTransactionClient = Omit<
  PrismaClient,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'
>;

export interface ModelReturnTypes {
  event: Prisma.EventGetPayload<Record<string, never>>;
  location: Prisma.LocationGetPayload<Record<string, never>>;
  privacyZone: Prisma.PrivacyZoneGetPayload<Record<string, never>>;
  safetyAlert: Prisma.SafetyAlertGetPayload<Record<string, never>>;
  safetyCheck: Prisma.SafetyCheckGetPayload<Record<string, never>>;
  user: Prisma.UserGetPayload<Record<string, never>>;
  account: Prisma.AccountGetPayload<Record<string, never>>;
  session: Prisma.SessionGetPayload<Record<string, never>>;
  passwordReset: Prisma.PasswordResetGetPayload<Record<string, never>>;
  emergencyContact: Prisma.EmergencyContactGetPayload<Record<string, never>>;
  achievement: Prisma.AchievementGetPayload<Record<string, never>>;
  rateLimitAttempt: Prisma.RateLimitAttemptGetPayload<Record<string, never>>;
  chatRoom: Prisma.ChatRoomGetPayload<Record<string, never>>;
  message: Prisma.MessageGetPayload<Record<string, never>>;
  userMatch: Prisma.UserMatchGetPayload<Record<string, never>>;
}

// Add robust connection retry logic
const connectWithRetry = async (retries = 5, delay = 2000) => {
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Database connection attempt ${i + 1}/${retries}`);
      await prisma.$connect();
      console.log('✅ Database connected successfully');
      return;
    } catch (error) {
      console.error(`❌ Database connection attempt ${i + 1} failed:`, error);
      if (i === retries - 1) {
        console.error('All database connection attempts failed');
        throw error;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
};

// Test database connection on startup
connectWithRetry().catch(error => {
  console.error('Database connection failed:', error);
  process.exit(1);
});

// Add connection status check utility
const checkConnection = async () => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
};

export { prisma, checkConnection };
