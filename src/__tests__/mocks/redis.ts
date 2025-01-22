import { jest, describe, beforeEach, it, expect } from '@jest/globals';

interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<'OK'>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
}

const mockRedis = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
};

jest.mock('@/lib/redis', () => ({
  __esModule: true,
  redis: mockRedis,
}));

export { mockRedis };

describe('Redis Mock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mock get operation', async () => {
    const mockValue = 'test-value';
    mockRedis.get.mockResolvedValue(mockValue);

    const result = await mockRedis.get('test-key');
    expect(result).toBe(mockValue);
    expect(mockRedis.get).toHaveBeenCalledWith('test-key');
  });

  it('should mock set operation', async () => {
    mockRedis.set.mockResolvedValue('OK');

    const result = await mockRedis.set('test-key', 'test-value');
    expect(result).toBe('OK');
    expect(mockRedis.set).toHaveBeenCalledWith('test-key', 'test-value');
  });

  it('should mock del operation', async () => {
    mockRedis.del.mockResolvedValue(1);

    const result = await mockRedis.del('test-key');
    expect(result).toBe(1);
    expect(mockRedis.del).toHaveBeenCalledWith('test-key');
  });

  it('should mock exists operation', async () => {
    mockRedis.exists.mockResolvedValue(1);

    const result = await mockRedis.exists('test-key');
    expect(result).toBe(1);
    expect(mockRedis.exists).toHaveBeenCalledWith('test-key');
  });

  it('should mock expire operation', async () => {
    mockRedis.expire.mockResolvedValue(1);

    const result = await mockRedis.expire('test-key', 3600);
    expect(result).toBe(1);
    expect(mockRedis.expire).toHaveBeenCalledWith('test-key', 3600);
  });
});
