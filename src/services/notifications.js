import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabase';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Check if device supports push notifications
 * @returns {boolean}
 */
export const isPushNotificationSupported = () => {
  return Device.isDevice && (Platform.OS === 'ios' || Platform.OS === 'android');
};

/**
 * Request permission for push notifications
 * @returns {Promise<{granted: boolean, error: string|null}>}
 */
export const requestNotificationPermission = async () => {
  try {
    if (!isPushNotificationSupported()) {
      return {
        granted: false,
        error: 'Push notifications are not supported on this device',
      };
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Ask for permission if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return {
        granted: false,
        error: 'Notification permission denied',
      };
    }

    return { granted: true, error: null };
  } catch (error) {
    console.error('Request notification permission error:', error);
    return {
      granted: false,
      error: error.message || 'Failed to request notification permission',
    };
  }
};

/**
 * Get Expo push token
 * @returns {Promise<{token: string|null, error: string|null}>}
 */
export const getPushToken = async () => {
  try {
    if (!isPushNotificationSupported()) {
      return {
        token: null,
        error: 'Push notifications are not supported',
      };
    }

    // Get the project ID from app.config.js or app.json
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      console.warn('No project ID found. Push notifications may not work correctly.');
    }

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });

    return {
      token: tokenData.data,
      error: null,
    };
  } catch (error) {
    console.error('Get push token error:', error);
    return {
      token: null,
      error: error.message || 'Failed to get push token',
    };
  }
};

/**
 * Register device for push notifications
 * - Requests permission
 * - Gets push token
 * - Stores token in database
 * @returns {Promise<{success: boolean, token: string|null, error: string|null}>}
 */
export const registerForPushNotifications = async () => {
  try {
    // Check if supported
    if (!isPushNotificationSupported()) {
      return {
        success: false,
        token: null,
        error: 'Push notifications not supported on this device',
      };
    }

    // Request permission
    const { granted, error: permissionError } = await requestNotificationPermission();
    if (!granted) {
      return {
        success: false,
        token: null,
        error: permissionError || 'Notification permission denied',
      };
    }

    // Get push token
    const { token, error: tokenError } = await getPushToken();
    if (!token) {
      return {
        success: false,
        token: null,
        error: tokenError || 'Failed to get push token',
      };
    }

    // Store token in database
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return {
        success: false,
        token: null,
        error: 'User not authenticated',
      };
    }

    // Store/update push token
    const { error: dbError } = await supabase
      .from('push_tokens')
      .upsert(
        {
          user_id: user.id,
          push_token: token,
          device_type: Platform.OS,
          enabled: true,
        },
        {
          onConflict: 'user_id,push_token',
        }
      );

    if (dbError) {
      console.error('Store push token error:', dbError);
      return {
        success: false,
        token: null,
        error: 'Failed to store push token',
      };
    }

    // Also update user profile with push_enabled flag
    await supabase
      .from('profiles')
      .update({ push_enabled: true })
      .eq('id', user.id);

    return {
      success: true,
      token: token,
      error: null,
    };
  } catch (error) {
    console.error('Register for push notifications error:', error);
    return {
      success: false,
      token: null,
      error: error.message || 'Failed to register for push notifications',
    };
  }
};

/**
 * Unregister from push notifications
 * @returns {Promise<{success: boolean, error: string|null}>}
 */
export const unregisterPushNotifications = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    // Disable all push tokens for this user
    const { error: dbError } = await supabase
      .from('push_tokens')
      .update({ enabled: false })
      .eq('user_id', user.id);

    if (dbError) {
      return { success: false, error: 'Failed to unregister push notifications' };
    }

    // Update user profile
    await supabase
      .from('profiles')
      .update({ push_enabled: false })
      .eq('id', user.id);

    return { success: true, error: null };
  } catch (error) {
    console.error('Unregister push notifications error:', error);
    return {
      success: false,
      error: error.message || 'Failed to unregister',
    };
  }
};

/**
 * Check if user has granted notification permission
 * @returns {Promise<boolean>}
 */
export const hasNotificationPermission = async () => {
  const { status } = await Notifications.getPermissionsAsync();
  return status === 'granted';
};

/**
 * Schedule a local notification (for testing)
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {number} seconds - Seconds until notification shows
 * @returns {Promise<string>} - Notification ID
 */
export const scheduleLocalNotification = async (title, body, seconds = 5) => {
  try {
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: body,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        seconds: seconds,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Schedule local notification error:', error);
    throw error;
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Cancel notifications error:', error);
  }
};

/**
 * Set up notification listeners
 * @param {Function} onNotificationReceived - Called when notification is received
 * @param {Function} onNotificationTapped - Called when notification is tapped
 * @returns {Object} - Cleanup function
 */
export const setupNotificationListeners = (
  onNotificationReceived,
  onNotificationTapped
) => {
  // Listener for notifications received while app is foregrounded
  const receivedSubscription = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('Notification received:', notification);
      if (onNotificationReceived) {
        onNotificationReceived(notification);
      }
    }
  );

  // Listener for when user taps on notification
  const responseSubscription = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('Notification tapped:', response);
      if (onNotificationTapped) {
        onNotificationTapped(response);
      }
    }
  );

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
};

export default {
  isPushNotificationSupported,
  requestNotificationPermission,
  getPushToken,
  registerForPushNotifications,
  unregisterPushNotifications,
  hasNotificationPermission,
  scheduleLocalNotification,
  cancelAllNotifications,
  setupNotificationListeners,
};