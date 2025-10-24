import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../utils/constants';

/**
 * Reusable Loading Component
 * @param {string} size - Spinner size: 'small', 'large'
 * @param {string} color - Spinner color
 * @param {string} text - Loading text to display
 * @param {boolean} fullScreen - Show as full screen overlay
 * @param {Object} style - Additional styles
 */
const Loading = ({
  size = 'large',
  color = COLORS.primary,
  text,
  fullScreen = false,
  style,
}) => {
  if (fullScreen) {
    return (
      <View style={styles.fullScreenContainer}>
        <View style={styles.content}>
          <ActivityIndicator size={size} color={color} />
          {text && <Text style={styles.text}>{text}</Text>}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={color} />
      {text && <Text style={styles.text}>{text}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },

  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  text: {
    marginTop: SPACING.md,
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },
});

export default Loading;