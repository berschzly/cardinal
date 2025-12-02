import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
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
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const router = useRouter();
  const segments = useSegments();
  const navigationState = useRootNavigationState();

  const notifListener = useRef(null);
  const tapListener = useRef(null);

  /** --------------------------
   * 1) Load initial Supabase session & listen for auth changes
   * -------------------------- */
  useEffect(() => {
    let mounted = true;

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        console.log('Initial session check:', !!session);
        setSession(session);
        setIsReady(true);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;
        console.log('Auth state changed:', event, !!newSession);
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
   * HAPPENS DURING SPLASH SCREEN
   * -------------------------- */
  useEffect(() => {
    if (!isReady || !navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    // Navigate immediately while splash is showing
    if (!session && !inAuthGroup) {
      console.log('→ Navigating to welcome (no session)');
      router.replace("/(auth)/welcome");
    } else if (session && !inTabsGroup) {
      console.log('→ Navigating to tabs (has session)');
      router.replace("/(tabs)");
    }

    // Hide splash after navigation completes + animation time
    // Longer delay to cover initial data loading (2.5s total)
    setTimeout(() => setShowSplash(false), 2500);
  }, [session, isReady, navigationState?.key]);

  /** --------------------------
   * 3) Notification listeners
   * -------------------------- */
  useEffect(() => {
    if (!session) return;

    requestNotificationPermissions();

    notifListener.current = Notifications.addNotificationReceivedListener(
      (notification) => console.log('📬 Notification received:', notification)
    );

    tapListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const cardId = response.notification.request.content.data?.cardId;
        if (cardId && cardId !== 'test-123') {
          router.push(`/card/${cardId}`);
        }
      }
    );

    return () => {
      notifListener.current?.remove?.();
      tapListener.current?.remove?.();
    };
  }, [session]);

  /** --------------------------
   * 4) Splash screen while loading
   * -------------------------- */
  if (!isReady || !navigationState?.key || showSplash) {
    return <SplashScreen />;
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

/** --------------------------
 * Splash Screen Component
 * -------------------------- */
function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.splashContainer}>
      {/* Animated Logo */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logo}>
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.appName}>Cardinal</Text>
        <Text style={styles.tagline}>Never lose a gift card again</Text>
      </Animated.View>

      {/* Loading indicator */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBar}>
          <View style={styles.loadingProgress} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#141414',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
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
    marginBottom: 20,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  logoImage: {
    width: 50,
    height: 50,
    borderRadius: 40,
  },
  logoIcon: {
    fontSize: 48,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 13,
    color: '#9CA3AF',
    letterSpacing: 0.3,
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 80,
    width: 200,
  },
  loadingBar: {
    height: 3,
    backgroundColor: '#1F1F1F',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    height: '100%',
    width: '70%',
    backgroundColor: '#DC2626',
    borderRadius: 2,
  },
});