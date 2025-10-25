import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { supabase } from './supabase';
import { daysUntilExpiration, isCardExpiringSoon } from '../utils/helpers';
import { NOTIFICATIONS } from '../utils/constants';

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

// ====================================
// PHASE 16: EXPIRATION REMINDERS
// ====================================

/**
 * Schedule expiration reminder notification
 * @param {object} card - Gift card object
 * @param {number} daysBeforeExpiration - Days before to send reminder (3, 7, 14, 30)
 * @returns {Promise<{notificationId, error}>}
 */
export const scheduleExpirationReminder = async (card, daysBeforeExpiration = 7) => {
  try {
    if (!card.expiration_date) {
      return { notificationId: null, error: 'No expiration date' };
    }

    const expDate = new Date(card.expiration_date);
    const reminderDate = new Date(expDate);
    reminderDate.setDate(expDate.getDate() - daysBeforeExpiration);
    reminderDate.setHours(9, 0, 0, 0); // 9 AM reminder

    const now = new Date();

    // Don't schedule if reminder date has passed
    if (reminderDate <= now) {
      return { notificationId: null, error: 'Reminder date has passed' };
    }

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ Gift Card Expiring Soon`,
        body: `Your ${card.store_name} gift card expires in ${daysBeforeExpiration} days. Balance: $${card.balance || 'Unknown'}`,
        data: {
          type: 'expiration',
          cardId: card.id,
          storeName: card.store_name,
          daysUntilExpiration: daysBeforeExpiration,
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: {
        date: reminderDate,
      },
    });

    // Store notification in database
    await saveNotificationToDatabase({
      user_id: card.user_id,
      gift_card_id: card.id,
      type: 'expiration',
      title: '⏰ Gift Card Expiring Soon',
      message: `Your ${card.store_name} gift card expires in ${daysBeforeExpiration} days`,
      scheduled_for: reminderDate.toISOString(),
      notification_identifier: notificationId,
    });

    return { notificationId, error: null };
  } catch (error) {
    console.error('Schedule expiration reminder error:', error);
    return { notificationId: null, error: error.message };
  }
};

/**
 * Schedule all expiration reminders for a card
 * @param {object} card - Gift card object
 * @returns {Promise<{count, error}>}
 */
export const scheduleAllExpirationReminders = async (card) => {
  try {
    if (!card.expiration_date || card.expiration_reminders_enabled === false) {
      return { count: 0, error: 'Reminders not enabled or no expiration date' };
    }

    const daysUntil = daysUntilExpiration(card.expiration_date);

    if (daysUntil === null || daysUntil < 0) {
      return { count: 0, error: 'Card expired or invalid date' };
    }

    const reminders = [];
    const reminderDays = [3, 7, 14, 30]; // Days before expiration to remind

    for (const days of reminderDays) {
      if (daysUntil >= days) {
        const result = await scheduleExpirationReminder(card, days);
        if (result.notificationId) {
          reminders.push(result.notificationId);
        }
      }
    }

    return { count: reminders.length, error: null };
  } catch (error) {
    console.error('Schedule all expiration reminders error:', error);
    return { count: 0, error: error.message };
  }
};

/**
 * Cancel all notifications for a card
 * @param {string} cardId - Gift card ID
 * @returns {Promise<{error}>}
 */
export const cancelCardNotifications = async (cardId) => {
  try {
    // Get all scheduled notifications
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();

    // Filter notifications for this card
    const cardNotifications = scheduled.filter(
      (notif) => notif.content.data?.cardId === cardId
    );

    // Cancel each notification
    for (const notif of cardNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }

    // Mark notifications as cancelled in database
    await supabase
      .from('notifications')
      .update({ cancelled_at: new Date().toISOString() })
      .eq('gift_card_id', cardId)
      .is('sent_at', null);

    return { error: null };
  } catch (error) {
    console.error('Cancel card notifications error:', error);
    return { error: error.message };
  }
};

/**
 * Check and schedule reminders for all user's cards
 * @param {string} userId - User ID
 * @returns {Promise<{count, error}>}
 */
export const checkAndScheduleAllReminders = async (userId) => {
  try {
    // Get all active cards with expiration dates
    const { data: cards, error } = await supabase
      .from('gift_cards')
      .select('*')
      .eq('user_id', userId)
      .eq('is_used', false)
      .not('expiration_date', 'is', null);

    if (error) throw error;

    let totalScheduled = 0;

    for (const card of cards) {
      const { count } = await scheduleAllExpirationReminders(card);
      totalScheduled += count;
    }

    return { count: totalScheduled, error: null };
  } catch (error) {
    console.error('Check and schedule all reminders error:', error);
    return { count: 0, error: error.message };
  }
};

/**
 * Save notification to database
 * @param {object} notification - Notification data
 * @returns {Promise<{error}>}
 */
const saveNotificationToDatabase = async (notification) => {
  try {
    const { error } = await supabase.from('notifications').insert([
      {
        user_id: notification.user_id,
        gift_card_id: notification.gift_card_id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        scheduled_for: notification.scheduled_for,
        notification_identifier: notification.notification_identifier,
      },
    ]);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error('Save notification to database error:', error);
    return { error: error.message };
  }
};

/**
 * Get upcoming notifications
 * @param {string} userId - User ID
 * @returns {Promise<{notifications, error}>}
 */
export const getUpcomingNotifications = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, gift_cards(*)')
      .eq('user_id', userId)
      .is('sent_at', null)
      .is('cancelled_at', null)
      .order('scheduled_for', { ascending: true });

    if (error) throw error;

    return { notifications: data, error: null };
  } catch (error) {
    console.error('Get upcoming notifications error:', error);
    return { notifications: [], error: error.message };
  }
};

/**
 * Get all scheduled local notifications (for debugging)
 * @returns {Promise<Array>}
 */
export const getAllScheduledNotifications = async () => {
  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    return scheduled;
  } catch (error) {
    console.error('Get all scheduled notifications error:', error);
    return [];
  }
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
  // Phase 16: Expiration reminders
  scheduleExpirationReminder,
  scheduleAllExpirationReminders,
  cancelCardNotifications,
  checkAndScheduleAllReminders,
  getUpcomingNotifications,
  getAllScheduledNotifications,
};