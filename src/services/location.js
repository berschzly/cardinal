import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import { checkLocationPermission } from '../utils/permissions';
import { getUserProfile } from './database';
import { supabase } from './supabase';
import { LOCATION } from '../utils/constants';
import { GEOFENCE_TASK } from '../../App';

// ====================================
// LOCATION SERVICE
// ====================================

/**
 * Check if location notifications are enabled for user
 * @returns {Promise<boolean>}
 */
export const areLocationNotificationsEnabled = async () => {
  try {
    const { data } = await getUserProfile();
    
    if (!data) return false;
    
    // Check both general notifications AND location notifications
    return data.notifications_enabled && data.location_notifications_enabled;
  } catch (error) {
    console.error('Check location notifications error:', error);
    return false;
  }
};

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
 * Find nearby gift cards (respects user notification preferences)
 * @param {object} userLocation - User's location {latitude, longitude}
 * @param {array} giftCards - Array of gift cards with store_latitude/longitude
 * @param {number} radiusMeters - Search radius in meters
 * @param {boolean} respectPreferences - Whether to check user preferences (default: true)
 * @returns {array} Array of nearby gift cards with distance
 */
export const findNearbyCards = async (
  userLocation,
  giftCards,
  radiusMeters = LOCATION.geofenceRadiusMeters,
  respectPreferences = true
) => {
  if (!userLocation || !giftCards || giftCards.length === 0) {
    return [];
  }

  // Check if user has location notifications enabled
  if (respectPreferences) {
    const enabled = await areLocationNotificationsEnabled();
    if (!enabled) {
      console.log('Location notifications disabled by user');
      return [];
    }
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

// ====================================
// GEOFENCING FUNCTIONS
// ====================================

/**
 * Register geofences for gift cards
 * @param {Array} giftCards - Array of gift cards with locations
 * @param {Object} userPreferences - User notification preferences
 * @returns {Promise<{success: boolean, count: number, error: string|null}>}
 */
export const registerGeofences = async (giftCards, userPreferences = {}) => {
  try {
    // Check permissions
    const { granted } = await checkLocationPermission();
    if (!granted) {
      console.warn('⚠️  Location permissions not granted');
      return { success: false, count: 0, error: 'Location permissions not granted' };
    }

    // Filter cards that should have geofences
    const cardsWithLocations = giftCards.filter(card => 
      card.location_notifications_enabled && 
      !card.is_online_only &&
      !card.is_used &&
      card.store_latitude &&
      card.store_longitude
    );

    if (cardsWithLocations.length === 0) {
      console.log('ℹ️  No cards with locations to geofence');
      return { success: true, count: 0, error: null };
    }

    // iOS has a limit of 20 geofences, Android has 100
    const maxGeofences = LOCATION.maxGeofences || 20;
    
    // Prioritize cards by balance and expiration
    const prioritizedCards = cardsWithLocations
      .sort((a, b) => {
        // Sort by balance (descending)
        const balanceDiff = (b.balance || 0) - (a.balance || 0);
        if (balanceDiff !== 0) return balanceDiff;
        
        // Then by expiration (ascending - soonest first)
        if (a.expiration_date && b.expiration_date) {
          return new Date(a.expiration_date) - new Date(b.expiration_date);
        }
        return 0;
      })
      .slice(0, maxGeofences);

    // Get radius from user preferences or use default
    const radiusMeters = userPreferences.notification_radius_miles 
      ? userPreferences.notification_radius_miles * 1609 
      : LOCATION.geofenceRadiusMeters;
    
    // Convert to geofence regions
    const regions = prioritizedCards.map(card => ({
      identifier: card.id,
      latitude: card.store_latitude,
      longitude: card.store_longitude,
      radius: radiusMeters,
      notifyOnEnter: true,
      notifyOnExit: false,
    }));

    // Stop any existing geofencing
    const isTaskDefined = await TaskManager.isTaskDefined(GEOFENCE_TASK);
    if (isTaskDefined) {
      await Location.stopGeofencingAsync(GEOFENCE_TASK);
    }

    // Register new geofences
    if (regions.length > 0) {
      await Location.startGeofencingAsync(GEOFENCE_TASK, regions);
      console.log(`✅ Registered ${regions.length} geofences`);
    }

    return { success: true, count: regions.length, error: null };
  } catch (error) {
    console.error('Register geofences error:', error);
    return { success: false, count: 0, error: error.message };
  }
};

/**
 * Stop all geofencing
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const stopGeofencing = async () => {
  try {
    const isTaskDefined = await TaskManager.isTaskDefined(GEOFENCE_TASK);
    if (isTaskDefined) {
      await Location.stopGeofencingAsync(GEOFENCE_TASK);
      console.log('✅ Stopped geofencing');
    }
    return { success: true, error: null };
  } catch (error) {
    console.error('Stop geofencing error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if notification should be sent (debouncing logic)
 * @param {string} cardId - Gift card ID
 * @param {string} userId - User ID
 * @returns {Promise<boolean>}
 */
export const checkNotificationEligibility = async (cardId, userId) => {
  try {
    // Get card details
    const { data: card } = await supabase
      .from('gift_cards')
      .select('location_notifications_enabled')
      .eq('id', cardId)
      .single();

    if (!card || !card.location_notifications_enabled) {
      return false;
    }

    // Get user preferences
    const { data: profile } = await supabase
      .from('profiles')
      .select('quiet_hours_enabled, quiet_hours_start, quiet_hours_end')
      .eq('id', userId)
      .single();

    // Check quiet hours
    if (profile?.quiet_hours_enabled) {
      const currentHour = new Date().getHours();
      const start = profile.quiet_hours_start || 22;
      const end = profile.quiet_hours_end || 7;
      
      if (start > end) {
        // Quiet hours cross midnight (e.g., 10pm - 7am)
        if (currentHour >= start || currentHour < end) {
          console.log('⏭️  Skipping: Quiet hours');
          return false;
        }
      } else {
        // Quiet hours same day
        if (currentHour >= start && currentHour < end) {
          console.log('⏭️  Skipping: Quiet hours');
          return false;
        }
      }
    }

    // Check 24-hour debounce
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentNotifs } = await supabase
      .from('notifications')
      .select('id')
      .eq('gift_card_id', cardId)
      .eq('type', 'location')
      .gte('sent_at', twentyFourHoursAgo);

    if (recentNotifs && recentNotifs.length > 0) {
      console.log('⏭️  Skipping: Recently notified (24h)');
      return false;
    }

    // Check dismissal pattern (last 3 dismissed = weekly limit)
    const { data: lastThree } = await supabase
      .from('notifications')
      .select('was_dismissed, sent_at')
      .eq('gift_card_id', cardId)
      .eq('type', 'location')
      .order('sent_at', { ascending: false })
      .limit(3);

    if (lastThree && lastThree.length === 3 && lastThree.every(n => n.was_dismissed)) {
      const lastNotif = new Date(lastThree[0].sent_at);
      const hoursSince = (Date.now() - lastNotif) / (1000 * 60 * 60);
      if (hoursSince < 168) { // 7 days
        console.log('⏭️  Skipping: User repeatedly dismissed');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Check eligibility error:', error);
    return false;
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
  areLocationNotificationsEnabled,
  registerGeofences,
  stopGeofencing,
  checkNotificationEligibility,
  GEOFENCE_TASK,
};