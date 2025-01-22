import { useState, useEffect, useCallback, useRef } from 'react';

interface GeolocationState {
  position: GeolocationPosition | null;
  error: GeolocationError | null;
  isLoading: boolean;
}

interface GeolocationOptions extends Omit<PositionOptions, 'timeout'> {
  timeout?: number;
  watchPosition?: boolean;
}

interface GeolocationError {
  code: number;
  message: string;
}

export const useGeolocation = (options: GeolocationOptions = {}) => {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    isLoading: true,
  });

  const optionsRef = useRef(options);
  optionsRef.current = options;

  const {
    watchPosition = false,
    timeout = 10000,
    ...positionOptions
  } = options;

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setState({
      position,
      error: null,
      isLoading: false,
    });
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    setState({
      position: null,
      error: {
        code: error.code,
        message: error.message,
      },
      isLoading: false,
    });
  }, []);

  useEffect(() => {
    const {
      watchPosition = false,
      timeout = 10000,
      ...positionOptions
    } = optionsRef.current;

    if (!navigator.geolocation) {
      setState({
        position: null,
        error: {
          code: 0,
          message: 'Geolocation is not supported by this browser',
        },
        isLoading: false,
      });
      return;
    }

    const geoOptions: PositionOptions = {
      ...positionOptions,
      timeout,
    };

    let watchId: number | undefined;

    if (watchPosition) {
      watchId = navigator.geolocation.watchPosition(
        handleSuccess,
        handleError,
        geoOptions
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        handleError,
        geoOptions
      );
    }

    return () => {
      if (watchId !== undefined) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [handleSuccess, handleError]); // Only depend on the callbacks

  return state;
};
