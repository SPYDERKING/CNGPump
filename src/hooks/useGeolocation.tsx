import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface GeolocationState {
  location: Coordinates | null;
  loading: boolean;
  error: string | null;
}

export const useGeolocation = () => {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    loading: false,
    error: null,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      const error = 'Geolocation is not supported by your browser';
      setState(prev => ({ ...prev, error }));
      toast.error(error);
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          loading: false,
          error: null,
        });
        toast.success('Location found! Showing distances to pumps.');
      },
      (error) => {
        let errorMessage = 'Failed to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied. Please enable location access.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out.';
            break;
        }
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        toast.error(errorMessage);
      },
      {
        enableHighAccuracy: false, // Reduced accuracy for faster results
        timeout: 15000, // Increased timeout to 15 seconds
        maximumAge: 600000, // 10 minutes
      }
    );
  }, []);

  const clearLocation = useCallback(() => {
    setState({ location: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    requestLocation,
    clearLocation,
  };
};

// Haversine formula to calculate distance between two coordinates
export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRad = (deg: number): number => {
  return deg * (Math.PI / 180);
};
