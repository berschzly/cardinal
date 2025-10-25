import { useState, useEffect, useCallback } from 'react';
import {
  getCurrentLocation,
  findNearbyCards,
  watchLocation,
  stopWatchingLocation,
} from '../services/location';
import {
  checkLocationPermission,
  requestLocationPermission,
} from '../utils/permissions';

/**
 * Custom hook for location functionality
 */
export const useLocation = (autoFetch = false) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [watchingLocation, setWatchingLocation] = useState(false);
  const [locationSubscription, setLocationSubscription] = useState(null);

  // Check permission on mount
  useEffect(() => {
    checkPermission();
  }, []);

  // Auto-fetch location if enabled
  useEffect(() => {
    if (autoFetch && permissionGranted) {
      fetchLocation();
    }
  }, [autoFetch, permissionGranted]);

  // Cleanup subscription on unmount
  useEffect(() => {
    return () => {
      if (locationSubscription) {
        stopWatchingLocation(locationSubscription);
      }
    };
  }, [locationSubscription]);

  /**
   * Check location permission status
   */
  const checkPermission = async () => {
    const { granted } = await checkLocationPermission();
    setPermissionGranted(granted);
  };

  /**
   * Request location permission
   */
  const requestPermission = async () => {
    const { granted } = await requestLocationPermission();
    setPermissionGranted(granted);
    return granted;
  };

  /**
   * Fetch current location
   */
  const fetchLocation = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { coords, error: locationError } = await getCurrentLocation();

    if (locationError) {
      setError(locationError);
      setLocation(null);
    } else {
      setLocation(coords);
    }

    setLoading(false);
    return coords;
  }, []);

  /**
   * Find nearby gift cards
   */
  const findNearby = useCallback(
    (giftCards, radiusMeters) => {
      if (!location) return [];
      return findNearbyCards(location, giftCards, radiusMeters);
    },
    [location]
  );

  /**
   * Start watching location changes
   */
  const startWatching = useCallback(async (callback) => {
    if (watchingLocation) return;

    const { subscription, error: watchError } = await watchLocation(
      (newLocation) => {
        setLocation(newLocation);
        if (callback) callback(newLocation);
      }
    );

    if (watchError) {
      setError(watchError);
      return false;
    }

    setLocationSubscription(subscription);
    setWatchingLocation(true);
    return true;
  }, [watchingLocation]);

  /**
   * Stop watching location changes
   */
  const stopWatching = useCallback(() => {
    if (locationSubscription) {
      stopWatchingLocation(locationSubscription);
      setLocationSubscription(null);
      setWatchingLocation(false);
    }
  }, [locationSubscription]);

  return {
    // State
    location,
    loading,
    error,
    permissionGranted,
    watchingLocation,

    // Functions
    checkPermission,
    requestPermission,
    fetchLocation,
    findNearby,
    startWatching,
    stopWatching,
  };
};

export default useLocation;