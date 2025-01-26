import Redis, { RedisOptions } from 'ioredis';
import { env } from '@/env.mjs';
import { z } from 'zod';

const RedisEnvSchema = z.object({
  host: z.string().default('0.0.0.0'),
  port: z.coerce.number().default(6379),
  password: z.string().optional(),
});

const redisEnv = RedisEnvSchema.safeParse({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
});

if (!redisEnv.success) {
  console.error('Redis environment validation failed:', redisEnv.error);
  throw new Error('Invalid Redis configuration');
}

// Prevent multiple instances of Redis client
declare global {
  let redis: Redis | undefined;
}

// Redis configuration with type safety
const redisConfig: RedisOptions = {
  host: redisEnv.data.host,
  port: redisEnv.data.port,
  retryStrategy: (times: number) => {
    // Maximum retry delay is 3 seconds
    return Math.min(times * 50, 3000);
  },
  maxRetriesPerRequest: 3,
  enableReadyCheck: false,
  lazyConnect: true,
  ...(redisEnv.data.password && redisEnv.data.password.trim() !== ''
    ? { password: redisEnv.data.password }
    : {}),
};

export const redis = global.redis ?? new Redis(redisConfig);

redis.on('error', (error: Error) => {
  if (error.message.includes('NOAUTH')) {
    console.debug(
      'Redis running in non-auth mode - this is normal if no password is set'
    );
  } else {
    console.error('Redis connection error:', error.message);
  }
});

redis.on('connect', () => {
  console.log(`Redis connected to ${redisEnv.data.host}:${redisEnv.data.port}`);
});

if (process.env.NODE_ENV !== 'production') {
  global.redis = redis;
}

export default redis;
