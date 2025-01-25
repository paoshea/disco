
import Redis, { RedisOptions } from 'ioredis';
import { env } from '@/env.mjs';
import { z } from 'zod';

const RedisEnvSchema = z.object({
  host: z.string().default('0.0.0.0'),
  port: z.string().transform(val => parseInt(val, 10)).default('6379'),
  password: z.string().optional()
});

const redisEnv = RedisEnvSchema.parse({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD
});

// Prevent multiple instances of Redis client
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

// Redis configuration with type safety
const redisConfig: RedisOptions = {
  host: redisEnv.host,
  port: redisEnv.port,
  retryStrategy: (times: number) => {
    // Maximum retry delay is 3 seconds
    return Math.min(times * 50, 3000);
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
  ...(redisEnv.password && redisEnv.password.trim() !== ''
    ? { password: redisEnv.password }
    : {})
};

export const redis = globalForRedis.redis ?? new Redis(redisConfig);

redis.on('error', (error: Error) => {
  if (error.message.includes('NOAUTH')) {
    console.debug('Redis running in non-auth mode - this is normal if no password is set');
  } else {
    console.error('Redis connection error:', error.message);
  }
});

redis.on('connect', () => {
  console.log(`Redis connected to ${redisEnv.host}:${redisEnv.port}`);
});

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

export default redis;
