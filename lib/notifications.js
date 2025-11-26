// Notification scheduling logic

import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Configure notification handler
 * This determines how notifications are displayed when app is in foreground
 */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Request notification permissions
 * Call this on app start or before scheduling notifications
 */
export async function requestNotificationPermissions() {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Notification permission not granted');
      return false;
    }

    // For Android, create notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('gift-cards', {
        name: 'Gift Card Reminders',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B6B',
      });
    }

    console.log('Notification permissions granted');
    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
}

/**
 * Schedule expiration reminder for a gift card
 * @param {Object} card - Card object with id, brand, balance, expirationDate
 */
export async function scheduleExpirationReminder(card) {
  try {
    if (!card.expirationDate) {
      console.log('No expiration date, skipping notification');
      return null;
    }

    // Parse the expiration date (YYYY-MM-DD format)
    const expirationDate = new Date(card.expirationDate + 'T23:59:59');
    const now = new Date();
    
    console.log('Expiration date:', expirationDate.toLocaleDateString());
    console.log('Today:', now.toLocaleDateString());

    // Check if card is already expired
    if (expirationDate <= now) {
      console.log('Card already expired, skipping notification');
      return null;
    }

    // Calculate notification dates
    const notifications = [];

    // 30 days before expiration
    const thirtyDaysBefore = new Date(expirationDate);
    thirtyDaysBefore.setDate(thirtyDaysBefore.getDate() - 30);
    thirtyDaysBefore.setHours(10, 0, 0, 0); // 10 AM

    if (thirtyDaysBefore > now) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Gift Card Expiring Soon',
          body: `Your ${card.brand || 'gift card'} (${formatBalance(card.balance)}) expires in 30 days!`,
          data: { cardId: card.id, type: 'expiration-30days' },
        },
        trigger: {
          type: 'date',
          date: thirtyDaysBefore,
        },
      });
      notifications.push(notificationId);
      console.log('Scheduled 30-day reminder:', notificationId);
    }

    // 7 days before expiration
    const sevenDaysBefore = new Date(expirationDate);
    sevenDaysBefore.setDate(sevenDaysBefore.getDate() - 7);
    sevenDaysBefore.setHours(10, 0, 0, 0);

    if (sevenDaysBefore > now) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '⚠️ Gift Card Expiring This Week',
          body: `Your ${card.brand || 'gift card'} (${formatBalance(card.balance)}) expires in 7 days! Use it soon!`,
          data: { cardId: card.id, type: 'expiration-7days' },
        },
        trigger: {
          type: 'date',
          date: sevenDaysBefore,
        },
      });
      notifications.push(notificationId);
      console.log('Scheduled 7-day reminder:', notificationId);
    }

    // 1 day before expiration
    const oneDayBefore = new Date(expirationDate);
    oneDayBefore.setDate(oneDayBefore.getDate() - 1);
    oneDayBefore.setHours(10, 0, 0, 0);

    if (oneDayBefore > now) {
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Gift Card Expires Tomorrow!',
          body: `Your ${card.brand || 'gift card'} (${formatBalance(card.balance)}) expires tomorrow! Don't lose it!`,
          data: { cardId: card.id, type: 'expiration-1day' },
        },
        trigger: {
          type: 'date',
          date: oneDayBefore,
        },
      });
      notifications.push(notificationId);
      console.log('Scheduled 1-day reminder:', notificationId);
    }

    return notifications;
  } catch (error) {
    console.error('Error scheduling expiration reminder:', error);
    return null;
  }
}

/**
 * Schedule a reminder to use a gift card (for cards without expiration)
 * @param {Object} card - Card object
 * @param {number} daysFromNow - Days from now to send reminder
 */
export async function scheduleUsageReminder(card, daysFromNow = 30) {
  try {
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + daysFromNow);
    reminderDate.setHours(10, 0, 0, 0);

    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '💳 Don\'t Forget Your Gift Card!',
        body: `You have ${formatBalance(card.balance)} left on your ${card.brand || 'gift card'}. Use it!`,
        data: { cardId: card.id, type: 'usage-reminder' },
      },
      trigger: {
        type: 'date',
        date: reminderDate,
      },
    });

    console.log('Scheduled usage reminder:', notificationId);
    return notificationId;
  } catch (error) {
    console.error('Error scheduling usage reminder:', error);
    return null;
  }
}

/**
 * Cancel all notifications for a specific card
 * @param {string} cardId - Card ID
 */
export async function cancelCardNotifications(cardId) {
  try {
    const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
    
    // Find all notifications for this card
    const cardNotifications = scheduledNotifications.filter(
      notification => notification.content.data?.cardId === cardId
    );

    // Cancel each one
    for (const notification of cardNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notification.identifier);
    }

    console.log(`Cancelled ${cardNotifications.length} notifications for card ${cardId}`);
    return cardNotifications.length;
  } catch (error) {
    console.error('Error cancelling card notifications:', error);
    return 0;
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('Cancelled all notifications');
    return true;
  } catch (error) {
    console.error('Error cancelling all notifications:', error);
    return false;
  }
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications() {
  try {
    const notifications = await Notifications.getAllScheduledNotificationsAsync();
    return notifications;
  } catch (error) {
    console.error('Error getting scheduled notifications:', error);
    return [];
  }
}

/**
 * Send an immediate test notification
 */
export async function sendTestNotification() {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Test Notification',
        body: 'Gift card notifications are working!',
      },
      trigger: null, // Send immediately
    });
    return true;
  } catch (error) {
    console.error('Error sending test notification:', error);
    return false;
  }
}

/**
 * Helper function to format balance
 */
function formatBalance(balance) {
  if (!balance) return '';
  const amount = typeof balance === 'string' ? parseFloat(balance) : balance;
  return `$${amount.toFixed(2)}`;
}