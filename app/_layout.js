/**
 * Root Layout Component
 * 
 * Top-level navigation and authentication manager for the entire application.
 * Handles session management, authentication flow, and global notification setup.
 * 
 * Features:
 * - Supabase authentication session management
 * - Protected route navigation (auth vs authenticated screens)
 * - Animated splash screen during initialization
 * - Global notification configuration and listeners
 * - Deep linking support for notification interactions
 * - Automatic redirection based on authentication state
 * 
 * Flow:
 * 1. Display splash screen while checking authentication
 * 2. Navigate to auth screens if no session exists
 * 3. Navigate to main app if authenticated
 * 4. Set up notification handlers for authenticated users
 */

import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { useEffect, useState, useRef } from 'react';
import * as Notifications from 'expo-notifications';
import { View, Text, StyleSheet, Animated, Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { requestNotificationPermissions } from '../lib/notifications';

/**
 * Global notification handler configuration
 * Defines how notifications appear when app is in foreground
 */
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

  /**
   * Initialize authentication session and listen for auth state changes
   * Checks for existing session on mount and subscribes to auth events
   */
  useEffect(() => {
    let mounted = true;

    // Check for existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setIsReady(true);
      }
    });

    // Subscribe to authentication state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!mounted) return;
        setSession(newSession);
      }
    );

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Navigation guard - redirects users based on authentication state
   * Runs after session check completes and navigation is ready
   * Maintains splash screen during navigation for smooth UX
   */
  useEffect(() => {
    if (!isReady || !navigationState?.key) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';

    // Redirect unauthenticated users to welcome screen
    if (!session && !inAuthGroup) {
      router.replace("/(auth)/welcome");
    } 
    // Redirect authenticated users to main app
    else if (session && !inTabsGroup) {
      router.replace("/(tabs)");
    }

    // Hide splash after navigation completes and initial data loads
    setTimeout(() => setShowSplash(false), 2500);
  }, [session, isReady, navigationState?.key]);

  /**
   * Set up notification listeners for authenticated users
   * Handles foreground notifications and tap responses for deep linking
   */
  useEffect(() => {
    if (!session) return;

    // Request notification permissions
    requestNotificationPermissions();

    // Listen for notifications received while app is open
    notifListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        // Notification received in foreground (optional logging/handling)
      }
    );

    // Handle notification taps for deep linking
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

  /**
   * Show splash screen during initialization
   * Displays until navigation is ready and auth check completes
   */
  if (!isReady || !navigationState?.key || showSplash) {
    return <SplashScreen />;
  }

  /**
   * Main navigation stack
   * Defines all available routes with consistent styling
   */
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

/**
 * Splash Screen Component
 * 
 * Animated loading screen shown during app initialization.
 * Features fade-in and spring animations for logo and branding.
 */
function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  /**
   * Initialize splash screen animations
   * Runs fade and scale animations in parallel
   */
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
      {/* Animated logo and branding */}
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

      {/* Loading progress indicator */}
      <View style={styles.loadingContainer}>
        <View style={styles.loadingBar}>
          <View style={styles.loadingProgress} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Splash screen container
  splashContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#141414',
  },
  
  // Logo and branding section
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
  
  // Loading indicator
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