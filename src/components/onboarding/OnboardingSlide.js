import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../utils/constants';

const { width } = Dimensions.get('window');

/**
 * OnboardingSlide Component
 * Single slide for onboarding carousel
 */
const OnboardingSlide = ({ icon, title, description }) => {
  return (
    <View style={styles.slide}>
      <View style={styles.content}>
        {/* Icon */}
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{icon}</Text>
        </View>

        {/* Title */}
        <Text style={styles.title}>{title}</Text>

        {/* Description */}
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
  },

  content: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 400,
  },

  iconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.xl,
  },

  icon: {
    fontSize: 80,
  },

  title: {
    fontSize: FONTS.sizes['3xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
    lineHeight: FONTS.sizes['3xl'] * 1.2,
  },

  description: {
    fontSize: FONTS.sizes.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONTS.sizes.lg * 1.5,
    paddingHorizontal: SPACING.md,
  },
});

export default OnboardingSlide;