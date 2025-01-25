import Redis from 'ioredis';
import { env } from '@/env.mjs';

// Validate Redis environment variables
const redisHost = env.REDIS_HOST || '0.0.0.0';
const redisPort = parseInt(env.REDIS_PORT || '6379', 10);
const redisPassword = env.REDIS_PASSWORD;

// Prevent multiple instances of Redis client
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

// Redis configuration with type safety
const redisConfig: Redis.RedisOptions = {
  host: redisHost,
  port: redisPort,
  retryStrategy: (times: number) => {
    // Maximum retry delay is 3 seconds
    return Math.min(times * 50, 3000);
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
  ...(redisPassword && redisPassword.trim() !== ''
    ? { password: redisPassword }
    : {}),
};

export const redis = globalForRedis.redis ?? new Redis(redisConfig);

redis.on('error', (error: Error) => {
  if (error.message.includes('NOAUTH')) {
    console.debug(
      'Redis running in non-auth mode - this is normal if no password is set'
    );
  } else {
    console.error('Redis connection error:', error);
  }
});

redis.on('connect', () => {
  console.log(`Redis connected successfully to ${redisHost}:${redisPort}`);
});

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

export default redis;
