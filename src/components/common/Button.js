import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/constants';

/**
 * Reusable Button Component
 * @param {string} title - Button text
 * @param {Function} onPress - Function to call on press
 * @param {string} variant - Button variant: 'primary', 'secondary', 'outline', 'ghost'
 * @param {string} size - Button size: 'small', 'medium', 'large'
 * @param {boolean} disabled - Disable button
 * @param {boolean} loading - Show loading spinner
 * @param {Object} style - Additional styles
 * @param {Object} textStyle - Additional text styles
 */
const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  ...props
}) => {
  // Get button style based on variant
  const getButtonStyle = () => {
    if (disabled) return styles.buttonDisabled;
    
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'outline':
        return styles.buttonOutline;
      case 'ghost':
        return styles.buttonGhost;
      default:
        return styles.buttonPrimary;
    }
  };

  // Get button size style
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.buttonSmall;
      case 'large':
        return styles.buttonLarge;
      default:
        return styles.buttonMedium;
    }
  };

  // Get text style based on variant
  const getTextStyle = () => {
    if (disabled) return styles.textDisabled;
    
    switch (variant) {
      case 'secondary':
        return styles.textSecondary;
      case 'outline':
        return styles.textOutline;
      case 'ghost':
        return styles.textGhost;
      default:
        return styles.textPrimary;
    }
  };

  // Get text size style
  const getTextSizeStyle = () => {
    switch (size) {
      case 'small':
        return styles.textSmall;
      case 'large':
        return styles.textLarge;
      default:
        return styles.textMedium;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getSizeStyle(),
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' ? COLORS.background : COLORS.primary}
          size="small"
        />
      ) : (
        <Text
          style={[
            styles.text,
            getTextStyle(),
            getTextSizeStyle(),
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
  },

  // Button variants
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.sm,
  },

  buttonSecondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  buttonGhost: {
    backgroundColor: 'transparent',
  },

  buttonDisabled: {
    backgroundColor: COLORS.disabled,
  },

  // Button sizes
  buttonSmall: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },

  buttonMedium: {
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },

  buttonLarge: {
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
  },

  // Text styles
  text: {
    fontWeight: FONTS.weights.semiBold,
  },

  textPrimary: {
    color: COLORS.background, // Light text on dark background
  },

  textSecondary: {
    color: COLORS.text,
  },

  textOutline: {
    color: COLORS.primary,
  },

  textGhost: {
    color: COLORS.primary,
  },

  textDisabled: {
    color: COLORS.textMuted,
  },

  // Text sizes
  textSmall: {
    fontSize: FONTS.sizes.sm,
  },

  textMedium: {
    fontSize: FONTS.sizes.base,
  },

  textLarge: {
    fontSize: FONTS.sizes.lg,
  },
});

export default Button;