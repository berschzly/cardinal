/**
 * Authentication Layout
 * 
 * Wraps all authentication-related screens (welcome, sign-in, sign-up, forgot-password)
 * with consistent styling and navigation behavior.
 * 
 * Features:
 * - Dark theme background (#141414)
 * - Hidden headers for custom UI
 * - Fade animations for smooth transitions
 * - Prevents white flash during navigation
 */

import { Stack } from 'expo-router';

const DARK_BG = '#141414';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: DARK_BG },
        animation: 'fade',
        statusBarStyle: 'light',
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="welcome" />
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}