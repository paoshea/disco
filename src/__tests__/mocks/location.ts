import { jest, describe, beforeEach, it, expect } from '@jest/globals';

interface LatLng {
  lat: number;
  lng: number;
}

interface LocationUtils {
  calculateDistance(point1: LatLng, point2: LatLng): number;
  isWithinRadius(point1: LatLng, point2: LatLng, radius: number): boolean;
  formatDistance(distance: number): string;
  reverseGeocode(lat: number, lng: number): Promise<string>;
  getLocationFromAddress(address: string): Promise<LatLng>;
}

const locationMock: jest.Mocked<LocationUtils> = {
  calculateDistance: jest.fn(),
  isWithinRadius: jest.fn(),
  formatDistance: jest.fn(),
  reverseGeocode: jest.fn(),
  getLocationFromAddress: jest.fn(),
};

jest.mock('@/utils/location', () => locationMock);

describe('Location Utils Mock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mock calculateDistance', () => {
    const mockDistance = 5.5;
    locationMock.calculateDistance.mockReturnValue(mockDistance);

    const result = locationMock.calculateDistance(
      { lat: 40.7128, lng: -74.0060 },
      { lat: 34.0522, lng: -118.2437 }
    );

    expect(result).toBe(mockDistance);
    expect(locationMock.calculateDistance).toHaveBeenCalledWith(
      { lat: 40.7128, lng: -74.0060 },
      { lat: 34.0522, lng: -118.2437 }
    );
  });

  it('should mock isWithinRadius', () => {
    locationMock.isWithinRadius.mockReturnValue(true);

    const result = locationMock.isWithinRadius(
      { lat: 40.7128, lng: -74.0060 },
      { lat: 34.0522, lng: -118.2437 },
      100
    );

    expect(result).toBe(true);
    expect(locationMock.isWithinRadius).toHaveBeenCalledWith(
      { lat: 40.7128, lng: -74.0060 },
      { lat: 34.0522, lng: -118.2437 },
      100
    );
  });

  it('should mock formatDistance', () => {
    const mockFormattedDistance = '5.5 km';
    locationMock.formatDistance.mockReturnValue(mockFormattedDistance);

    const result = locationMock.formatDistance(5.5);

    expect(result).toBe(mockFormattedDistance);
    expect(locationMock.formatDistance).toHaveBeenCalledWith(5.5);
  });

  it('should mock reverseGeocode', async () => {
    const mockAddress = '123 Test St, City, Country';
    locationMock.reverseGeocode.mockResolvedValue(mockAddress);

    const result = await locationMock.reverseGeocode(40.7128, -74.0060);

    expect(result).toBe(mockAddress);
    expect(locationMock.reverseGeocode).toHaveBeenCalledWith(40.7128, -74.0060);
  });

  it('should mock getLocationFromAddress', async () => {
    const mockLocation = { lat: 40.7128, lng: -74.0060 };
    locationMock.getLocationFromAddress.mockResolvedValue(mockLocation);

    const result = await locationMock.getLocationFromAddress('123 Test St, City, Country');

    expect(result).toEqual(mockLocation);
    expect(locationMock.getLocationFromAddress).toHaveBeenCalledWith('123 Test St, City, Country');
  });
});
