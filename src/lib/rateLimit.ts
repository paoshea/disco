import { redis } from './redis/client';

export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

export class RateLimiter {
  private windowMs: number;
  private maxRequests: number;

  constructor(config: RateLimitConfig) {
    this.windowMs = config.windowMs;
    this.maxRequests = config.maxRequests;
  }

  async isRateLimited(key: string): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get the current count and timestamp of requests
    const requestCount = await redis.zcount(key, windowStart, now);

    if (requestCount >= this.maxRequests) {
      return true;
    }

    // Add the current request
    await redis.zadd(key, now, now.toString());
    
    // Remove old requests outside the window
    await redis.zremrangebyscore(key, 0, windowStart);

    // Set expiry on the key
    await redis.expire(key, Math.ceil(this.windowMs / 1000));

    return false;
  }
}

// Default rate limit configurations
export const defaultRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
};

export const strictRateLimit: RateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30, // 30 requests per minute
};

// Create rate limiter instances
export const defaultLimiter = new RateLimiter(defaultRateLimit);
export const strictLimiter = new RateLimiter(strictRateLimit);
