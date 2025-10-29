import React from 'react';
import { StatusBar } from 'react-native';
import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/utils/constants';
import { supabase } from './src/services/supabase';

// Geofencing task name
const GEOFENCE_TASK = 'GIFT_CARD_GEOFENCE';

// Helper: Check notification eligibility
async function checkNotificationEligibility(cardId, userId) {
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
        if (currentHour >= start || currentHour < end) {
          console.log('⏭️  Skipping: Quiet hours');
          return false;
        }
      } else {
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
      if (hoursSince < 168) {
        console.log('⏭️  Skipping: User repeatedly dismissed');
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Check eligibility error:', error);
    return false;
  }
}

// Define background geofence task BEFORE App component
TaskManager.defineTask(GEOFENCE_TASK, async ({ data, error }) => {
  if (error) {
    console.error('❌ Geofence task error:', error);
    return;
  }

  if (data.eventType === Location.GeofencingEventType.Enter) {
    const { region } = data;
    const cardId = region.identifier;

    console.log(`📍 Entered geofence for card: ${cardId}`);

    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        console.log('❌ No user session in background task');
        return;
      }

      // Check if eligible to send notification
      const eligible = await checkNotificationEligibility(cardId, session.user.id);
      
      if (!eligible) {
        console.log('⏭️  Not eligible for notification');
        return;
      }

      // Get card details for notification
      const { data: card } = await supabase
        .from('gift_cards')
        .select('store_name, balance')
        .eq('id', cardId)
        .single();

      if (!card) {
        console.log('❌ Card not found');
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      // Prepare notification content
      const title = `You're near ${card.store_name}! 🎁`;
      const body = card.balance 
        ? `Don't forget your $${Number(card.balance).toFixed(2)} gift card`
        : `You have a gift card here`;

      // Send notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data: { 
            cardId: card.id,
            type: 'location',
            storeName: card.store_name,
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // Send immediately
      });

      // Log to database
      await supabase.from('notifications').insert({
        user_id: session.user.id,
        gift_card_id: cardId,
        type: 'location',
        title,
        body,
        triggered_latitude: location.coords.latitude,
        triggered_longitude: location.coords.longitude,
        distance_meters: region.radius ? Math.round(region.radius) : null,
      });

      console.log(`✅ Sent notification for ${card.store_name}`);

    } catch (err) {
      console.error('❌ Geofence handler error:', err);
    }
  }
});

export default function App() {
  return (
    <AuthProvider>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.background}
      />
      <AppNavigator />
    </AuthProvider>
  );
}

// Export for use in other files
export { GEOFENCE_TASK };