import Redis from 'ioredis';
import { env } from '@/env.mjs';

// Prevent multiple instances of Redis client
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

// Only include password if it's explicitly set and not empty
const redisConfig = {
  host: env.REDIS_HOST || 'localhost',
  port: parseInt(env.REDIS_PORT || '6379'),
  retryStrategy: (times: number) => {
    // Maximum retry delay is 3 seconds
    return Math.min(times * 50, 3000);
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
  ...(env.REDIS_PASSWORD && env.REDIS_PASSWORD.trim() !== ''
    ? { password: env.REDIS_PASSWORD }
    : {}),
};

export const redis = globalForRedis.redis ?? new Redis(redisConfig);

redis.on('error', (error: Error) => {
  // Don't crash on auth errors, just log them
  if (error.message.includes('NOAUTH')) {
    console.debug(
      'Redis running in non-auth mode - this is normal if no password is set'
    );
  } else {
    console.error('Redis connection error:', error);
  }
});

redis.on('connect', () => {
  console.log(
    `Redis connected successfully to ${env.REDIS_HOST}:${env.REDIS_PORT}`
  );
});

if (env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

export default redis;
