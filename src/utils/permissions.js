import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';
import { Alert, Platform, Linking } from 'react-native';

// ====================================
// PERMISSION HELPERS
// ====================================

/**
 * Request location permissions (foreground)
 * @returns {Promise<{granted, status}>}
 */
export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    const granted = status === 'granted';
    
    // Store permission status
    await AsyncStorage.setItem(
      STORAGE_KEYS.locationPermission,
      JSON.stringify({ granted, status, timestamp: Date.now() })
    );

    return { granted, status };
  } catch (error) {
    console.error('Error requesting location permission:', error);
    return { granted: false, status: 'error' };
  }
};

/**
 * Request background location permissions
 * @returns {Promise<{granted, status}>}
 */
export const requestBackgroundLocationPermission = async () => {
  try {
    // First check if foreground permission is granted
    const foreground = await Location.getForegroundPermissionsAsync();
    
    if (foreground.status !== 'granted') {
      return { 
        granted: false, 
        status: 'foreground_required',
        message: 'Foreground location permission is required first'
      };
    }

    // Request background permission
    const { status } = await Location.requestBackgroundPermissionsAsync();
    
    const granted = status === 'granted';

    return { granted, status };
  } catch (error) {
    console.error('Error requesting background location permission:', error);
    return { granted: false, status: 'error' };
  }
};

/**
 * Check current location permission status
 * @returns {Promise<{granted, status}>}
 */
export const checkLocationPermission = async () => {
  try {
    const { status } = await Location.getForegroundPermissionsAsync();
    const granted = status === 'granted';
    
    return { granted, status };
  } catch (error) {
    console.error('Error checking location permission:', error);
    return { granted: false, status: 'error' };
  }
};

/**
 * Request notification permissions
 * @returns {Promise<{granted, status}>}
 */
export const requestNotificationPermission = async () => {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    
    const granted = status === 'granted';
    
    // Store permission status
    await AsyncStorage.setItem(
      STORAGE_KEYS.notificationPermission,
      JSON.stringify({ granted, status, timestamp: Date.now() })
    );

    return { granted, status };
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { granted: false, status: 'error' };
  }
};

/**
 * Check current notification permission status
 * @returns {Promise<{granted, status}>}
 */
export const checkNotificationPermission = async () => {
  try {
    const { status } = await Notifications.getPermissionsAsync();
    const granted = status === 'granted';
    
    return { granted, status };
  } catch (error) {
    console.error('Error checking notification permission:', error);
    return { granted: false, status: 'error' };
  }
};

/**
 * Get stored permission status from AsyncStorage
 * @param {string} key - Storage key for permission
 * @returns {Promise<object|null>}
 */
export const getStoredPermissionStatus = async (key) => {
  try {
    const stored = await AsyncStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Error getting stored permission:', error);
    return null;
  }
};

/**
 * Show alert to open app settings
 * @param {string} permissionType - Type of permission (location, notifications)
 */
export const showOpenSettingsAlert = (permissionType = 'location') => {
  const title = 'Permission Required';
  const message = `${permissionType === 'location' ? 'Location' : 'Notification'} permission is needed for this feature. Please enable it in Settings.`;

  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Open Settings',
        onPress: () => {
          if (Platform.OS === 'ios') {
            Linking.openURL('app-settings:');
          } else {
            Linking.openSettings();
          }
        },
      },
    ]
  );
};

/**
 * Request all necessary permissions
 * @returns {Promise<{location, notifications}>}
 */
export const requestAllPermissions = async () => {
  const location = await requestLocationPermission();
  const notifications = await requestNotificationPermission();

  return {
    location,
    notifications,
  };
};

/**
 * Check all permissions status
 * @returns {Promise<{location, notifications}>}
 */
export const checkAllPermissions = async () => {
  const location = await checkLocationPermission();
  const notifications = await checkNotificationPermission();

  return {
    location,
    notifications,
  };
};

export default {
  requestLocationPermission,
  requestBackgroundLocationPermission,
  checkLocationPermission,
  requestNotificationPermission,
  checkNotificationPermission,
  getStoredPermissionStatus,
  showOpenSettingsAlert,
  requestAllPermissions,
  checkAllPermissions,
};