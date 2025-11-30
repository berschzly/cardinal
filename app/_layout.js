import { Stack, useRouter, useSegments } from 'expo-router';
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

  const notifListener = useRef(null);
  const tapListener = useRef(null);

  /** --------------------------
   * 1) Load initial Supabase session & listen for auth changes
   * -------------------------- */
  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  /** --------------------------
   * 2) Navigation gate: redirect based on session
   * -------------------------- */
  useEffect(() => {
    if (loading) return;
    if (!segments || segments.length === 0) return;

    const AUTH_SCREENS = ['welcome', 'sign-in', 'sign-up', 'forgot-password'];
    const group = segments[0];    // e.g. "(auth)" or "(tabs)"
    const screen = segments[1];   // e.g. "welcome" or "sign-in"

    const inAuthGroup = group === '(auth)';
    const onAuthScreen = AUTH_SCREENS.includes(screen);

    // Debugging logs (optional, remove in production)
    console.log('Navigation - group:', group, 'screen:', screen, 'session:', !!session);

    // Not logged in → redirect to welcome screen
    if (!session && !inAuthGroup) {
      console.log('No session, redirecting to welcome');
      router.replace('/(auth)/welcome');
      return;
    }

    // Logged in but on sign-in/sign-up → redirect to dashboard
    if (session && inAuthGroup && (screen === 'sign-in' || screen === 'sign-up')) {
      console.log('Session exists, redirecting to dashboard');
      router.replace('/(tabs)');
      return;
    }

    // Logged in but on welcome screen → redirect to dashboard
    if (session && inAuthGroup && screen === 'welcome') {
      console.log('Session exists, redirecting to dashboard');
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

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
  if (loading) {
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