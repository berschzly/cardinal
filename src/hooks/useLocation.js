import { useState, useEffect, useCallback } from 'react';
import {
  getCurrentLocation,
  findNearbyCards,
  watchLocation,
  stopWatchingLocation,
  registerGeofences,
  stopGeofencing,
} from '../services/location';
import {
  checkLocationPermission,
  requestLocationPermission,
} from '../utils/permissions';
import { supabase } from '../services/supabase';

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
  const [geofencingActive, setGeofencingActive] = useState(false);

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

  /**
   * Initialize geofencing for user's gift cards
   */
  const initializeGeofencing = useCallback(async () => {
    try {
      setError(null);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Fetch user's gift cards
      const { data: cards, error: cardsError } = await supabase
        .from('gift_cards')
        .select('*')
        .eq('user_id', user.id);

      if (cardsError) throw cardsError;

      // Fetch user preferences
      const { data: profile } = await supabase
        .from('profiles')
        .select('notification_radius_miles')
        .eq('id', user.id)
        .single();

      // Register geofences
      const result = await registerGeofences(cards || [], {
        notification_radius_miles: profile?.notification_radius_miles || 1.0,
      });

      setGeofencingActive(result.success);
      
      if (!result.success && result.error) {
        setError(result.error);
      }

      return result;
    } catch (error) {
      console.error('Initialize geofencing error:', error);
      setError(error.message);
      setGeofencingActive(false);
      return { success: false, error: error.message };
    }
  }, []);

  /**
   * Stop all geofencing
   */
  const stopAllGeofencing = useCallback(async () => {
    const result = await stopGeofencing();
    setGeofencingActive(false);
    return result;
  }, []);

  return {
    // State
    location,
    loading,
    error,
    permissionGranted,
    watchingLocation,
    geofencingActive,

    // Functions
    checkPermission,
    requestPermission,
    fetchLocation,
    findNearby,
    startWatching,
    stopWatching,
    initializeGeofencing,
    stopAllGeofencing,
  };
};

export default useLocation;