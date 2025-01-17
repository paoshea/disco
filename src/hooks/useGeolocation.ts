import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: number;
  longitude: number;
  accuracy: number;
  error?: GeolocationPositionError;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationState | null>(null);
  const [error, setError] = useState<GeolocationPositionError | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      const err = new Error('Geolocation is not supported');
      const geolocationError = {
        code: 2, // POSITION_UNAVAILABLE
        message: err.message,
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      } as GeolocationPositionError;
      setError(geolocationError);
      return;
    }

    const handleSuccess = (position: GeolocationPosition) => {
      setLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
      setError(null);
    };

    const handleError = (error: GeolocationPositionError) => {
      setError(error);
      setLocation(null);
    };

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    const watchId = navigator.geolocation.watchPosition(handleSuccess, handleError, options);

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return { location, error };
};
