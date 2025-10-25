import * as Location from 'expo-location';
import { checkLocationPermission } from '../utils/permissions';
import { LOCATION } from '../utils/constants';

// ====================================
// LOCATION SERVICE
// ====================================

/**
 * Get current location
 * @returns {Promise<{coords, error}>}
 */
export const getCurrentLocation = async () => {
  try {
    // Check permission first
    const { granted } = await checkLocationPermission();
    
    if (!granted) {
      throw new Error('Location permission not granted');
    }

    // Get current position
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: LOCATION.timeout,
    });

    return {
      coords: {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy,
      },
      error: null,
    };
  } catch (error) {
    console.error('Get current location error:', error);
    return {
      coords: null,
      error: error.message,
    };
  }
};

/**
 * Calculate distance between two coordinates (in meters)
 * Uses Haversine formula
 * @param {number} lat1 - Latitude of first point
 * @param {number} lon1 - Longitude of first point
 * @param {number} lat2 - Latitude of second point
 * @param {number} lon2 - Longitude of second point
 * @returns {number} Distance in meters
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Check if user is near a location
 * @param {object} userLocation - User's current location {latitude, longitude}
 * @param {object} targetLocation - Target location {latitude, longitude}
 * @param {number} radiusMeters - Radius in meters (default from constants)
 * @returns {boolean}
 */
export const isNearLocation = (
  userLocation,
  targetLocation,
  radiusMeters = LOCATION.geofenceRadiusMeters
) => {
  if (!userLocation || !targetLocation) return false;

  const distance = calculateDistance(
    userLocation.latitude,
    userLocation.longitude,
    targetLocation.latitude,
    targetLocation.longitude
  );

  return distance <= radiusMeters;
};

/**
 * Get distance in human-readable format
 * @param {number} meters - Distance in meters
 * @returns {string}
 */
export const formatDistance = (meters) => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  } else if (meters < 1609) {
    return `${(meters / 1000).toFixed(1)} km`;
  } else {
    return `${(meters / 1609).toFixed(1)} mi`;
  }
};

/**
 * Find nearby gift cards
 * @param {object} userLocation - User's location {latitude, longitude}
 * @param {array} giftCards - Array of gift cards with store_latitude/longitude
 * @param {number} radiusMeters - Search radius in meters
 * @returns {array} Array of nearby gift cards with distance
 */
export const findNearbyCards = (
  userLocation,
  giftCards,
  radiusMeters = LOCATION.geofenceRadiusMeters
) => {
  if (!userLocation || !giftCards || giftCards.length === 0) {
    return [];
  }

  const nearbyCards = giftCards
    .filter((card) => {
      if (!card.store_latitude || !card.store_longitude) return false;
      if (card.is_used) return false;
      if (!card.location_notifications_enabled) return false;

      return isNearLocation(
        userLocation,
        {
          latitude: card.store_latitude,
          longitude: card.store_longitude,
        },
        radiusMeters
      );
    })
    .map((card) => {
      const distance = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        card.store_latitude,
        card.store_longitude
      );

      return {
        ...card,
        distance,
        distanceFormatted: formatDistance(distance),
      };
    })
    .sort((a, b) => a.distance - b.distance); // Sort by closest first

  return nearbyCards;
};

/**
 * Watch user location for changes
 * @param {Function} callback - Callback function with location updates
 * @returns {Promise<{subscription, error}>}
 */
export const watchLocation = async (callback) => {
  try {
    const { granted } = await checkLocationPermission();
    
    if (!granted) {
      throw new Error('Location permission not granted');
    }

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: LOCATION.backgroundUpdateInterval,
        distanceInterval: LOCATION.distanceFilter,
      },
      (location) => {
        callback({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          accuracy: location.coords.accuracy,
        });
      }
    );

    return { subscription, error: null };
  } catch (error) {
    console.error('Watch location error:', error);
    return { subscription: null, error: error.message };
  }
};

/**
 * Stop watching location
 * @param {object} subscription - Location watch subscription
 */
export const stopWatchingLocation = (subscription) => {
  if (subscription && subscription.remove) {
    subscription.remove();
  }
};

export default {
  getCurrentLocation,
  calculateDistance,
  isNearLocation,
  formatDistance,
  findNearbyCards,
  watchLocation,
  stopWatchingLocation,
};