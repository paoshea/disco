import LRU from 'lru-cache';
import { prisma } from '@/lib/prisma';
import * as crypto from 'crypto';

type Options = {
  uniqueTokenPerInterval?: number;
  interval?: number;
};

export default function rateLimit(options?: Options) {
  const tokenCache = new LRU<string, [number]>({
    max: options?.uniqueTokenPerInterval || 500,
    maxAge: options?.interval || 60000,
  });

  return {
    check: (res: any, limit: number, token: string) =>
      new Promise<void>((resolve, reject) => {
        const tokenCount = (tokenCache.get(token) || [0])[0];
        if (tokenCount === 0) {
          tokenCache.set(token, [1]);
          resolve();
        } else if (tokenCount < limit) {
          tokenCache.set(token, [tokenCount + 1]);
          resolve();
        } else {
          res.status(429).send('Too Many Requests');
          reject();
        }
      }),
  };
}

const WINDOW_SIZE = 60 * 1000; // 1 minute
const MAX_ATTEMPTS = 5;

export async function isRateLimited(
  identifier: string,
  action: string,
  userId?: string
): Promise<boolean> {
  const windowStart = new Date(Date.now() - WINDOW_SIZE);

  // Count attempts in the current window
  const result = await prisma.$queryRaw<{ count: number }[]>`
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

  await prisma.$executeRaw`
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
  await prisma.$executeRaw`
    DELETE FROM "RateLimitAttempt"
    WHERE identifier = ${identifier}
    AND action = ${action}
    ${userId ? `AND user_id = ${userId}` : ''}
  `;
}
