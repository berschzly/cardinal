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

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        // Hide default header to allow custom authentication UI
        headerShown: false,
        
        // Dark background for content and cards to prevent white flash
        contentStyle: { backgroundColor: '#141414' },
        cardStyle: { backgroundColor: '#141414' },
        
        // Smooth fade transition between auth screens
        animation: 'fade',
      }}
    >
      {/* Initial landing screen */}
      <Stack.Screen name="welcome" />
      
      {/* User authentication screens */}
      <Stack.Screen name="sign-in" />
      <Stack.Screen name="sign-up" />
      
      {/* Password recovery flow */}
      <Stack.Screen name="forgot-password" />
    </Stack>
  );
}