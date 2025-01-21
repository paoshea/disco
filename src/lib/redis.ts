import Redis, { RedisOptions } from 'ioredis';

const REDIS_URL = process.env.LOCATION_REDIS_URL || 'redis://localhost:6379';

// Configure Redis client
const redisConfig: RedisOptions = {
  lazyConnect: true,
  showFriendlyErrorStack: true,
  enableReadyCheck: true,
  maxRetriesPerRequest: 1,
  retryStrategy: (times: number) => {
    if (times > 3) {
      console.warn(`Redis retry attempt ${times} failed, giving up`);
      return null;
    }
    const delay = Math.min(times * 200, 1000);
    return delay;
  },
  reconnectOnError: (err: Error) => {
    const targetError = 'READONLY';
    if (err.message.includes(targetError)) {
      return true;
    }
    return false;
  },
};

// Parse Redis URL and merge with config
try {
  const parsedUrl = new URL(REDIS_URL);
  redisConfig.host = parsedUrl.hostname;
  redisConfig.port = parseInt(parsedUrl.port) || 6379;

  // Extract username and password from URL if present
  if (parsedUrl.username) {
    redisConfig.username = decodeURIComponent(parsedUrl.username);
  }
  if (parsedUrl.password) {
    redisConfig.password = decodeURIComponent(parsedUrl.password);
  }
} catch (error) {
  console.error('Invalid Redis URL:', error);
}

let redisClient: Redis | null = null;

// Create Redis client with error handling
export function createRedisClient() {
  if (redisClient) {
    return redisClient;
  }

  try {
    // First try without auth
    const client = new Redis({
      ...redisConfig,
      connectTimeout: 10000,
      disconnectTimeout: 5000,
      enableOfflineQueue: true,
    });

    // Handle connection events
    client.on('connect', () => {
      console.info('Redis client connected successfully');
    });

    client.on('error', (err: Error) => {
      console.error('Redis client error:', err);
      if (err.message.includes('NOAUTH')) {
        console.warn('Redis authentication not required');
      }
    });

    client.on('close', () => {
      console.warn('Redis connection closed');
    });

    redisClient = client;
    return client;
  } catch (error) {
    console.error('Failed to create Redis client:', error);
    throw error;
  }
}

// Export a singleton instance
export const redis = createRedisClient();
