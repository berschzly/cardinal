// LoadingScreen.js - Animated loading component
// Save as: components/common/LoadingScreen.js

import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';

export default function LoadingScreen({ 
  message = 'Loading...', 
  icon = 'card',
  fullScreen = true 
}) {
  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in on mount
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Pulse animation for the icon container
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotation animation for decorative circle
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const containerStyle = fullScreen 
    ? styles.fullScreenContainer 
    : styles.inlineContainer;

  return (
    <Animated.View style={[containerStyle, { opacity: fadeAnim }]}>
      {/* Background decorative circle */}
      <Animated.View 
        style={[
          styles.decorCircle,
          { transform: [{ rotate }, { scale: pulseAnim }] }
        ]} 
      />

      {/* Main loading icon */}
      <Animated.View 
        style={[
          styles.logoIcon,
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <Ionicons name={icon} size={40} color="#FFFFFF" />
      </Animated.View>

      {/* Loading text */}
      <Text style={styles.loadingText}>{message}</Text>

      {/* Loading dots */}
      <View style={styles.dotsContainer}>
        <LoadingDot delay={0} />
        <LoadingDot delay={150} />
        <LoadingDot delay={300} />
      </View>
    </Animated.View>
  );
}

// Animated loading dot component
function LoadingDot({ delay }) {
  const dotAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    // Delay start for staggered effect
    setTimeout(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(dotAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(dotAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }, delay);
  }, [delay]);

  return (
    <Animated.View style={[styles.dot, { opacity: dotAnim }]} />
  );
}

const styles = StyleSheet.create({
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#141414',
    paddingHorizontal: 24,
  },
  inlineContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
  },

  // Decorative circle in background
  decorCircle: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#DC2626',
    opacity: 0.05,
  },

  // Main icon
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    // Subtle shadow
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  // Loading text
  loadingText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 16,
  },

  // Loading dots
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
});