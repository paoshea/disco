import { PrismaClient, Prisma } from '@prisma/client';
import { DefaultArgs } from '@prisma/client/runtime/library';

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

// Use Prisma's built-in delegate types instead of creating our own
export interface ExtendedPrismaClient
  extends PrismaClient<Prisma.PrismaClientOptions, never, DefaultArgs> {
  event: Prisma.EventDelegate<DefaultArgs>;
  location: Prisma.LocationDelegate<DefaultArgs>;
  privacyZone: Prisma.PrivacyZoneDelegate<DefaultArgs>;
  safetyAlert: Prisma.SafetyAlertDelegate<DefaultArgs>;
  safetyCheck: Prisma.SafetyCheckDelegate<DefaultArgs>;
  user: Prisma.UserDelegate<DefaultArgs>;
  account: Prisma.AccountDelegate<DefaultArgs>;
  session: Prisma.SessionDelegate<DefaultArgs>;
  passwordReset: Prisma.PasswordResetDelegate<DefaultArgs>;
  emergencyContact: Prisma.EmergencyContactDelegate<DefaultArgs>;
  achievement: Prisma.AchievementDelegate<DefaultArgs>;
  rateLimitAttempt: Prisma.RateLimitAttemptDelegate<DefaultArgs>;
  chatRoom: Prisma.ChatRoomDelegate<DefaultArgs>;
  message: Prisma.MessageDelegate<DefaultArgs>;
  userMatch: Prisma.UserMatchDelegate<DefaultArgs>;
}
