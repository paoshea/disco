import { jest, describe, beforeEach, it, expect } from '@jest/globals';
import { LocationUtils } from '@/utils/location';

interface LatLng {
  lat: number;
  lng: number;
}

const mockLocationUtils: jest.Mocked<LocationUtils> = {
  calculateDistance: jest.fn(),
  isWithinRadius: jest.fn(),
  formatDistance: jest.fn(),
  reverseGeocode: jest.fn(),
  getLocationFromAddress: jest.fn(),
};

jest.mock('@/utils/location', () => mockLocationUtils);

describe('Location Utils Mock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should mock calculateDistance', () => {
    const mockDistance = 5.5;
    mockLocationUtils.calculateDistance.mockReturnValue(mockDistance);

    const result = mockLocationUtils.calculateDistance(
      { lat: 40.7128, lng: -74.006 },
      { lat: 34.0522, lng: -118.2437 }
    );

    expect(result).toBe(mockDistance);
    expect(mockLocationUtils.calculateDistance).toHaveBeenCalledWith(
      { lat: 40.7128, lng: -74.006 },
      { lat: 34.0522, lng: -118.2437 }
    );
  });

  it('should mock isWithinRadius', () => {
    mockLocationUtils.isWithinRadius.mockReturnValue(true);

    const result = mockLocationUtils.isWithinRadius(
      { lat: 40.7128, lng: -74.006 },
      { lat: 34.0522, lng: -118.2437 },
      100
    );

    expect(result).toBe(true);
    expect(mockLocationUtils.isWithinRadius).toHaveBeenCalledWith(
      { lat: 40.7128, lng: -74.006 },
      { lat: 34.0522, lng: -118.2437 },
      100
    );
  });

  it('should mock formatDistance', () => {
    const mockFormattedDistance = '5.5 km';
    mockLocationUtils.formatDistance.mockReturnValue(mockFormattedDistance);

    const result = mockLocationUtils.formatDistance(5.5);

    expect(result).toBe(mockFormattedDistance);
    expect(mockLocationUtils.formatDistance).toHaveBeenCalledWith(5.5);
  });

  it('should mock reverseGeocode', async () => {
    const mockAddress = '123 Test St, City, Country';
    mockLocationUtils.reverseGeocode.mockResolvedValue(mockAddress);

    const result = await mockLocationUtils.reverseGeocode(40.7128, -74.006);

    expect(result).toBe(mockAddress);
    expect(mockLocationUtils.reverseGeocode).toHaveBeenCalledWith(40.7128, -74.006);
  });

  it('should mock getLocationFromAddress', async () => {
    const mockLocation = { lat: 40.7128, lng: -74.006 };
    mockLocationUtils.getLocationFromAddress.mockResolvedValue(mockLocation);

    const result = await mockLocationUtils.getLocationFromAddress(
      '123 Test St, City, Country'
    );

    expect(result).toEqual(mockLocation);
    expect(mockLocationUtils.getLocationFromAddress).toHaveBeenCalledWith(
      '123 Test St, City, Country'
    );
  });
});

export { mockLocationUtils };
