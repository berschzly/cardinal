// Root layout

import { Stack, useRouter } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { supabase } from '../lib/supabase';
import { requestNotificationPermissions } from '../lib/notifications';

// Configure notification handler globally
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  const [session, setSession] = useState(null);
  const router = useRouter();
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    // Setup Supabase auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Request notification permissions when user is logged in
    if (session) {
      requestNotificationPermissions();
    }

    // Setup notification listeners (may not work fully in Expo Go)
    try {
      // Listen for notifications received while app is open
      notificationListener.current = Notifications.addNotificationReceivedListener(notification => {
        console.log('📬 Notification received:', notification);
      });

      // Listen for user tapping on notifications
      responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
        console.log('👆 Notification tapped:', response);
        
        const cardId = response.notification.request.content.data?.cardId;
        if (cardId) {
          // Navigate to card detail screen (adjust route as needed)
          router.push(`/cards/${cardId}`);
        }
      });
    } catch (error) {
      // Expected in Expo Go - notifications still work, just limited features
      console.log('Notification listeners limited in Expo Go');
    }

    // Cleanup listeners on unmount
    return () => {
      try {
        if (notificationListener.current) {
          notificationListener.current.remove();
        }
        if (responseListener.current) {
          responseListener.current.remove();
        }
      } catch (error) {
        // Ignore cleanup errors in Expo Go
        console.log('Notification cleanup (expected in Expo Go)');
      }
    };
  }, [session]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}