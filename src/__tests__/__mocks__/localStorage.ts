// Mock localStorage
export const mockLocalStorage = {
  store: {} as { [key: string]: string },
  getItem: jest.fn((key: string) => mockLocalStorage.store[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockLocalStorage.store[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete mockLocalStorage.store[key];
  }),
  clear: jest.fn(() => {
    mockLocalStorage.store = {};
  }),
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('localStorage Mock', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  it('should store and retrieve items', () => {
    mockLocalStorage.setItem('test-key', 'test-value');
    expect(mockLocalStorage.getItem('test-key')).toBe('test-value');
  });

  it('should return null for non-existent items', () => {
    expect(mockLocalStorage.getItem('non-existent')).toBeNull();
  });

  it('should remove items', () => {
    mockLocalStorage.setItem('test-key', 'test-value');
    mockLocalStorage.removeItem('test-key');
    expect(mockLocalStorage.getItem('test-key')).toBeNull();
  });

  it('should clear all items', () => {
    mockLocalStorage.setItem('key1', 'value1');
    mockLocalStorage.setItem('key2', 'value2');
    mockLocalStorage.clear();
    expect(mockLocalStorage.getItem('key1')).toBeNull();
    expect(mockLocalStorage.getItem('key2')).toBeNull();
  });
});
