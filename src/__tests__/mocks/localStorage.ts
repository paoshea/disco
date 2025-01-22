// Mock localStorage
const mockStorage: { [key: string]: string } = {};

export const mockLocalStorage = {
  getItem: jest.fn((key: string) => mockStorage[key] || null),
  setItem: jest.fn((key: string, value: string) => {
    mockStorage[key] = value;
  }),
  clear: jest.fn(() => {
    Object.keys(mockStorage).forEach(key => {
      delete mockStorage[key];
    });
  }),
  removeItem: jest.fn((key: string) => {
    delete mockStorage[key];
  }),
};

describe('LocalStorage Mock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  it('should store and retrieve values', () => {
    mockLocalStorage.setItem('test-key', 'test-value');
    expect(mockLocalStorage.getItem('test-key')).toBe('test-value');
  });

  it('should remove values', () => {
    mockLocalStorage.setItem('test-key', 'test-value');
    mockLocalStorage.removeItem('test-key');
    expect(mockLocalStorage.getItem('test-key')).toBeNull();
  });

  it('should clear all values', () => {
    mockLocalStorage.setItem('key1', 'value1');
    mockLocalStorage.setItem('key2', 'value2');
    mockLocalStorage.clear();
    expect(mockLocalStorage.getItem('key1')).toBeNull();
    expect(mockLocalStorage.getItem('key2')).toBeNull();
  });
});
