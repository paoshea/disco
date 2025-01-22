export const mockGeolocation = {
  coords: {
    latitude: 37.7749,
    longitude: -122.4194,
    accuracy: 10,
    altitude: null,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp: Date.now(),
};

export const mockGeolocationError = {
  code: 1,
  message: 'User denied geolocation',
};

export const mockGeolocationWatchPosition = {
  coords: {
    ...mockGeolocation.coords,
    speed: 5,
    heading: 90,
  },
  timestamp: Date.now(),
};

// Helper to mock getCurrentPosition
export const mockGetCurrentPosition = (
  successCallback: PositionCallback,
  errorCallback?: PositionErrorCallback
) => {
  setTimeout(() => {
    successCallback(mockGeolocation as GeolocationPosition);
  }, 100);
};

// Helper to mock watchPosition
export const mockWatchPosition = (
  successCallback: PositionCallback,
  errorCallback?: PositionErrorCallback
) => {
  const watchId = setInterval(() => {
    successCallback(mockGeolocationWatchPosition as GeolocationPosition);
  }, 1000);

  return watchId;
};

// Helper to mock clearWatch
export const mockClearWatch = (watchId: number) => {
  clearInterval(watchId);
};
