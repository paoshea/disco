import { renderHook, act } from '@testing-library/react';
import { useGeolocation } from '@/hooks/useGeolocation';

// Mock the geolocation API
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

// Mock the navigator
Object.defineProperty(global.navigator, 'geolocation', {
  value: mockGeolocation,
  configurable: true,
});

const mockPosition = {
  coords: {
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 100,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  } as GeolocationCoordinates,
  timestamp: Date.now(),
} as GeolocationPosition;

const mockError: GeolocationPositionError = {
  code: 1,
  message: 'User denied geolocation',
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
};

describe('useGeolocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.position).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle successful geolocation', async () => {
    jest.useFakeTimers();

    mockGeolocation.getCurrentPosition.mockImplementation(success => {
      setTimeout(() => success(mockPosition), 0);
    });

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.position).toBeNull();
    expect(result.current.error).toBeNull();

    await act(async () => {
      jest.runAllTimers();
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.position).toBe(mockPosition);
    expect(result.current.error).toBeNull();

    jest.useRealTimers();
  });

  it('should handle geolocation error', async () => {
    mockGeolocation.getCurrentPosition.mockImplementation((success, error) =>
      error(mockError)
    );

    const { result } = renderHook(() => useGeolocation());

    // Wait for state update
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.position).toBeNull();
    expect(result.current.error).toEqual({
      code: mockError.code,
      message: mockError.message,
    });
  });

  it('should handle watch position mode', async () => {
    const watchId = 123;
    mockGeolocation.watchPosition.mockReturnValue(watchId);
    mockGeolocation.watchPosition.mockImplementation(success => {
      success(mockPosition);
      return watchId;
    });

    const { result, unmount } = renderHook(() =>
      useGeolocation({ watchPosition: true })
    );

    // Wait for state update
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(result.current.position).toEqual(mockPosition);
    expect(mockGeolocation.watchPosition).toHaveBeenCalled();

    // Test cleanup
    unmount();
    expect(mockGeolocation.clearWatch).toHaveBeenCalledWith(watchId);
  });

  it('should handle unsupported geolocation', async () => {
    // Temporarily remove geolocation support
    const originalGeolocation = global.navigator.geolocation;
    Object.defineProperty(global.navigator, 'geolocation', {
      value: undefined,
      configurable: true,
    });

    const { result } = renderHook(() => useGeolocation());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.position).toBeNull();
    expect(result.current.error).toEqual({
      code: 0,
      message: 'Geolocation is not supported by this browser',
    });

    // Restore geolocation
    Object.defineProperty(global.navigator, 'geolocation', {
      value: originalGeolocation,
      configurable: true,
    });
  });

  it('should respect timeout option', () => {
    const timeout = 5000;
    renderHook(() => useGeolocation({ timeout }));

    expect(mockGeolocation.getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({ timeout })
    );
  });
});
