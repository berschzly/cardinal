import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { supabase } from '../lib/supabase';
import { requestNotificationPermissions } from '../lib/notifications';

/** --------------------------
 * Configure notifications globally
 * -------------------------- */
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function RootLayout() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  const notifListener = useRef(null);
  const tapListener = useRef(null);

  /** --------------------------
   * 1) Load initial Supabase session & listen for auth changes
   * FIXED: Added getSession() call on mount
   * -------------------------- */
  useEffect(() => {
    let mounted = true;

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        console.log('Auth state changed:', event, !!session);
        setSession(session);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  /** --------------------------
   * 2) Navigation gate: redirect based on session
   * FIXED: Simplified logic to prevent loops
   * -------------------------- */
  useEffect(() => {
    // Wait for both loading and navigation to be ready
    if (loading || !navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';

    console.log("Navigation check:", {
      hasSession: !!session,
      inAuthGroup,
      segments,
    });

    // Redirect logic
    if (!session && !inAuthGroup) {
      // User is logged out but not in auth screens
      router.replace("/(auth)/welcome");
    } else if (session && inAuthGroup) {
      // User is logged in but still in auth screens
      router.replace("/(tabs)");
    }
  }, [session, loading, segments, navigationState?.key]);

  /** --------------------------
   * 3) Notification listeners
   * Only setup once the user is logged in
   * -------------------------- */
  useEffect(() => {
    if (!session) return;

    // Request permissions for notifications
    requestNotificationPermissions();

    // Listener for notifications received while app is foregrounded
    notifListener.current = Notifications.addNotificationReceivedListener(
      (notification) => console.log('📬 Notification received:', notification)
    );

    // Listener for user tapping on a notification
    tapListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const cardId = response.notification.request.content.data?.cardId;
        if (cardId && cardId !== 'test-123') {
          router.push(`/card/${cardId}`);
        }
      }
    );

    // Cleanup listeners
    return () => {
      notifListener.current?.remove?.();
      tapListener.current?.remove?.();
    };
  }, [session]);

  /** --------------------------
   * 4) Loading screen while session is being checked
   * -------------------------- */
  if (loading || !navigationState?.key) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.logo}>
          <ActivityIndicator size="large" color="#DC2626" />
        </View>
      </View>
    );
  }

  /** --------------------------
   * 5) Stack navigation
   * -------------------------- */
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#141414' },
        cardStyle: { backgroundColor: '#141414' },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="card/[id]" />
      <Stack.Screen name="card/edit/[id]" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#141414',
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1F1F1F',
    borderWidth: 2,
    borderColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
});