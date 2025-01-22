import { jest, describe, beforeEach, it, expect } from '@jest/globals';

interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<'OK'>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
}

const mockRedis = {
  get: jest.fn<Promise<string | null>, [string]>(),
  set: jest.fn<Promise<string>, [string, string]>(),
  del: jest.fn<Promise<number>, [string]>(),
  exists: jest.fn<Promise<number>, [string]>(),
  expire: jest.fn<Promise<number>, [string, number]>(),
};

export const mockGetValue = (mockValue: string | null) => {
  mockRedis.get.mockResolvedValue(mockValue);
};

export const mockSetValue = () => {
  mockRedis.set.mockResolvedValue('OK');
};

export const mockDelValue = () => {
  mockRedis.del.mockResolvedValue(1);
};

export const mockExistsValue = () => {
  mockRedis.exists.mockResolvedValue(1);
};

export const mockExpireValue = () => {
  mockRedis.expire.mockResolvedValue(1);
};

jest.mock('@/lib/redis', () => ({
  __esModule: true,
  redis: mockRedis,
}));

export default mockRedis;

describe('Redis Mock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mock get operation', async () => {
    const mockValue = 'test-value';
    mockGetValue(mockValue);

    const result = await mockRedis.get('test-key');
    expect(result).toBe(mockValue);
    expect(mockRedis.get).toHaveBeenCalledWith('test-key');
  });

  it('should mock set operation', async () => {
    mockSetValue();

    const result = await mockRedis.set('test-key', 'test-value');
    expect(result).toBe('OK');
    expect(mockRedis.set).toHaveBeenCalledWith('test-key', 'test-value');
  });

  it('should mock del operation', async () => {
    mockDelValue();

    const result = await mockRedis.del('test-key');
    expect(result).toBe(1);
    expect(mockRedis.del).toHaveBeenCalledWith('test-key');
  });

  it('should mock exists operation', async () => {
    mockExistsValue();

    const result = await mockRedis.exists('test-key');
    expect(result).toBe(1);
    expect(mockRedis.exists).toHaveBeenCalledWith('test-key');
  });

  it('should mock expire operation', async () => {
    mockExpireValue();

    const result = await mockRedis.expire('test-key', 3600);
    expect(result).toBe(1);
    expect(mockRedis.expire).toHaveBeenCalledWith('test-key', 3600);
  });
});
