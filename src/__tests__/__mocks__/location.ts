import { jest, describe, beforeEach, it, expect } from '@jest/globals';

export const mockLocation = {
  latitude: 37.7749,
  longitude: -122.4194,
  accuracy: 10,
  timestamp: Date.now(),
};

export const mockLocationUtils = {
  getCurrentPosition: jest.fn().mockResolvedValue(mockLocation),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
  calculateDistance: jest.fn(),
  isWithinRadius: jest.fn(),
  formatDistance: jest.fn(),
  reverseGeocode: jest.fn(),
  getLocationFromAddress: jest.fn(),
};

jest.mock('@/utils/location', () => ({
  locationUtils: mockLocationUtils,
}));

describe('Location Utils Mock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mock getCurrentPosition', async () => {
    const position = await mockLocationUtils.getCurrentPosition();
    expect(position).toEqual(mockLocation);
  });

  it('should mock watchPosition', () => {
    const watchId = 1;
    mockLocationUtils.watchPosition(jest.fn());
    expect(mockLocationUtils.watchPosition).toHaveBeenCalled();
  });

  it('should mock clearWatch', () => {
    const watchId = 1;
    mockLocationUtils.clearWatch(watchId);
    expect(mockLocationUtils.clearWatch).toHaveBeenCalledWith(watchId);
  });

  it('should mock calculateDistance', () => {
    const mockDistance = 5.5;
    mockLocationUtils.calculateDistance.mockReturnValue(mockDistance);

    const result = mockLocationUtils.calculateDistance(
      { latitude: 37.7749, longitude: -122.4194 },
      { latitude: 37.7833, longitude: -122.4167 }
    );

    expect(result).toBe(mockDistance);
    expect(mockLocationUtils.calculateDistance).toHaveBeenCalled();
  });

  it('should mock isWithinRadius', () => {
    const isWithin = true;
    mockLocationUtils.isWithinRadius.mockReturnValue(isWithin);

    const result = mockLocationUtils.isWithinRadius(
      { latitude: 37.7749, longitude: -122.4194 },
      { latitude: 37.7833, longitude: -122.4167 },
      1000
    );

    expect(result).toBe(isWithin);
    expect(mockLocationUtils.isWithinRadius).toHaveBeenCalled();
  });

  it('should mock formatDistance', () => {
    const formattedDistance = '5.5 km';
    mockLocationUtils.formatDistance.mockReturnValue(formattedDistance);

    const result = mockLocationUtils.formatDistance(5500);
    expect(result).toBe(formattedDistance);
    expect(mockLocationUtils.formatDistance).toHaveBeenCalled();
  });

  it('should mock reverseGeocode', async () => {
    const address = '123 Main St, San Francisco, CA';
    mockLocationUtils.reverseGeocode.mockResolvedValue(address);

    const result = await mockLocationUtils.reverseGeocode(37.7749, -122.4194);
    expect(result).toBe(address);
    expect(mockLocationUtils.reverseGeocode).toHaveBeenCalled();
  });

  it('should mock getLocationFromAddress', async () => {
    const coords = { latitude: 37.7749, longitude: -122.4194 };
    mockLocationUtils.getLocationFromAddress.mockResolvedValue(coords);

    const result = await mockLocationUtils.getLocationFromAddress('123 Main St, San Francisco, CA');
    expect(result).toEqual(coords);
    expect(mockLocationUtils.getLocationFromAddress).toHaveBeenCalled();
  });
});
