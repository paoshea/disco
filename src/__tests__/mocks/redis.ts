export const redisMock = {
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
