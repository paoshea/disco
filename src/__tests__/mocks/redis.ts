import { jest, describe, beforeEach, it, expect } from '@jest/globals';

interface RedisClient {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<'OK'>;
  del(key: string): Promise<number>;
  exists(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
}

export const redisMock: jest.Mocked<RedisClient> = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  exists: jest.fn(),
  expire: jest.fn(),
};

jest.mock('@/lib/redis', () => ({
  __esModule: true,
  redis: redisMock,
}));

describe('Redis Mock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mock get operation', async () => {
    const mockValue = 'test-value';
    redisMock.get.mockResolvedValue(mockValue);

    const result = await redisMock.get('test-key');
    expect(result).toBe(mockValue);
    expect(redisMock.get).toHaveBeenCalledWith('test-key');
  });

  it('should mock set operation', async () => {
    redisMock.set.mockResolvedValue('OK');

    const result = await redisMock.set('test-key', 'test-value');
    expect(result).toBe('OK');
    expect(redisMock.set).toHaveBeenCalledWith('test-key', 'test-value');
  });

  it('should mock del operation', async () => {
    redisMock.del.mockResolvedValue(1);

    const result = await redisMock.del('test-key');
    expect(result).toBe(1);
    expect(redisMock.del).toHaveBeenCalledWith('test-key');
  });

  it('should mock exists operation', async () => {
    redisMock.exists.mockResolvedValue(1);

    const result = await redisMock.exists('test-key');
    expect(result).toBe(1);
    expect(redisMock.exists).toHaveBeenCalledWith('test-key');
  });

  it('should mock expire operation', async () => {
    redisMock.expire.mockResolvedValue(1);

    const result = await redisMock.expire('test-key', 3600);
    expect(result).toBe(1);
    expect(redisMock.expire).toHaveBeenCalledWith('test-key', 3600);
  });
});
