import { Prisma, PrismaClient } from '@prisma/client';

type EventInclude = {
  creator: boolean | {
    select: {
      id: true;
      email: true;
      firstName: true;
      lastName: true;
    };
  };
  participants: boolean | {
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
  user: boolean | {
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
