import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { locationUtils } from '@/utils/location';

interface LatLng {
  lat: number;
  lng: number;
}

const mockLocation = {
  latitude: 37.7749,
  longitude: -122.4194,
  accuracy: 10,
  timestamp: Date.now(),
};

jest.mock('@/utils/location', () => ({
  locationUtils: {
    getCurrentPosition: jest.fn().mockResolvedValue(mockLocation),
    watchPosition: jest.fn(),
    clearWatch: jest.fn(),
    calculateDistance: jest.fn(),
    isWithinRadius: jest.fn(),
    formatDistance: jest.fn(),
    reverseGeocode: jest.fn(),
    getLocationFromAddress: jest.fn(),
  },
}));

describe('Location Utils Mock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mock calculateDistance', () => {
    const mockDistance = 5.5;
    locationUtils.calculateDistance.mockReturnValue(mockDistance);

    const result = locationUtils.calculateDistance(
      { lat: 40.7128, lng: -74.006 },
      { lat: 34.0522, lng: -118.2437 }
    );

    expect(result).toBe(mockDistance);
    expect(locationUtils.calculateDistance).toHaveBeenCalledWith(
      { lat: 40.7128, lng: -74.006 },
      { lat: 34.0522, lng: -118.2437 }
    );
  });

  it('should mock isWithinRadius', () => {
    locationUtils.isWithinRadius.mockReturnValue(true);

    const result = locationUtils.isWithinRadius(
      { lat: 40.7128, lng: -74.006 },
      { lat: 34.0522, lng: -118.2437 },
      100
    );

    expect(result).toBe(true);
    expect(locationUtils.isWithinRadius).toHaveBeenCalledWith(
      { lat: 40.7128, lng: -74.006 },
      { lat: 34.0522, lng: -118.2437 },
      100
    );
  });

  it('should mock formatDistance', () => {
    const mockFormattedDistance = '5.5 km';
    locationUtils.formatDistance.mockReturnValue(mockFormattedDistance);

    const result = locationUtils.formatDistance(5.5);

    expect(result).toBe(mockFormattedDistance);
    expect(locationUtils.formatDistance).toHaveBeenCalledWith(5.5);
  });

  it('should mock reverseGeocode', async () => {
    const mockAddress = '123 Test St, City, Country';
    locationUtils.reverseGeocode.mockResolvedValue(mockAddress);

    const result = await locationUtils.reverseGeocode(40.7128, -74.006);

    expect(result).toBe(mockAddress);
    expect(locationUtils.reverseGeocode).toHaveBeenCalledWith(40.7128, -74.006);
  });

  it('should mock getLocationFromAddress', async () => {
    const mockLocation = { lat: 40.7128, lng: -74.006 };
    locationUtils.getLocationFromAddress.mockResolvedValue(mockLocation);

    const result = await locationUtils.getLocationFromAddress(
      '123 Test St, City, Country'
    );

    expect(result).toEqual(mockLocation);
    expect(locationUtils.getLocationFromAddress).toHaveBeenCalledWith(
      '123 Test St, City, Country'
    );
  });

  it('should mock getCurrentPosition', async () => {
    const position = await locationUtils.getCurrentPosition();
    expect(position).toEqual(mockLocation);
  });

  it('should mock watchPosition', () => {
    const watchId = 1;
    locationUtils.watchPosition(jest.fn());
    expect(locationUtils.watchPosition).toHaveBeenCalled();
  });

  it('should mock clearWatch', () => {
    const watchId = 1;
    locationUtils.clearWatch(watchId);
    expect(locationUtils.clearWatch).toHaveBeenCalledWith(watchId);
  });
});

export { locationUtils };
