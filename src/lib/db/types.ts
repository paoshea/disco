import { Prisma, PrismaClient } from '@prisma/client';

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
  permissions: string[];
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
