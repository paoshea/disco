jest.mock('@/utils/location', () => ({
  calculateDistance: jest.fn(),
  isWithinRadius: jest.fn(),
  formatDistance: jest.fn(),
  reverseGeocode: jest.fn(),
  getLocationFromAddress: jest.fn(),
}));
