import { db } from './prisma';
import * as crypto from 'crypto';

const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5;

export async function isRateLimited(
  identifier: string,
  action: string,
  userId?: string
): Promise<boolean> {
  const windowStart = new Date(Date.now() - WINDOW_SIZE);

  // Count attempts in the current window
  const result = await db.$queryRaw<{ count: number }[]>`
    SELECT COUNT(*) as count
    FROM "RateLimitAttempt"
    WHERE identifier = ${identifier}
    AND action = ${action}
    AND created_at >= ${windowStart}
    ${userId ? `AND user_id = ${userId}` : ''}
  `;

  const attempts = Number(result[0]?.count || 0);

  if (attempts >= MAX_ATTEMPTS) {
    return true;
  }

  // Record this attempt
  const id = crypto.randomUUID();
  const now = new Date();
  
  await db.$executeRaw`
    INSERT INTO "RateLimitAttempt" (id, identifier, action, user_id, created_at)
    VALUES (${id}, ${identifier}, ${action}, ${userId || null}, ${now})
  `;

  return false;
}

export async function clearRateLimit(
  identifier: string,
  action: string,
  userId?: string
): Promise<void> {
  await db.$executeRaw`
    DELETE FROM "RateLimitAttempt"
    WHERE identifier = ${identifier}
    AND action = ${action}
    ${userId ? `AND user_id = ${userId}` : ''}
  `;
}
