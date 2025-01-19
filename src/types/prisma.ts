import { Prisma, PrismaClient } from '@prisma/client';

export type EventWithParticipants = Prisma.EventGetPayload<{
  include: {
    creator: {
      select: {
        id: true;
        name: true;
        email: true;
        image: true;
      };
    };
    participants: {
      include: {
        user: {
          select: {
            id: true;
            name: true;
            email: true;
            image: true;
          };
        };
      };
    };
  };
}>;

export type LocationWithUser = Prisma.LocationGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        email: true;
        image: true;
      };
    };
  };
}>;

export type ExtendedPrismaClient = PrismaClient & {
  $extends: {
    model: {
      event: {
        findNearby: (
          latitude: number,
          longitude: number,
          radiusInMeters: number
        ) => Promise<Prisma.EventGetPayload<{ include: EventWithParticipants }>[]>;
      };
      location: {
        findNearby: (
          latitude: number,
          longitude: number,
          radiusInMeters: number
        ) => Promise<Prisma.LocationGetPayload<{ include: LocationWithUser }>[]>;
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
