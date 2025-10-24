import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/constants';

/**
 * Reusable Error Message Component
 * @param {string} message - Error message to display
 * @param {Function} onRetry - Optional retry function
 * @param {string} retryText - Text for retry button
 * @param {string} variant - Error variant: 'error', 'warning', 'info'
 * @param {Object} style - Additional styles
 */
const ErrorMessage = ({
  message,
  onRetry,
  retryText = 'Try Again',
  variant = 'error',
  style,
}) => {
  if (!message) return null;

  const getContainerStyle = () => {
    switch (variant) {
      case 'warning':
        return styles.containerWarning;
      case 'info':
        return styles.containerInfo;
      default:
        return styles.containerError;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'warning':
        return styles.textWarning;
      case 'info':
        return styles.textInfo;
      default:
        return styles.textError;
    }
  };

  const getIcon = () => {
    switch (variant) {
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
      default:
        return '❌';
    }
  };

  return (
    <View style={[styles.container, getContainerStyle(), style]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{getIcon()}</Text>
        <Text style={[styles.text, getTextStyle()]}>{message}</Text>
      </View>

      {onRetry && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={onRetry}
          activeOpacity={0.7}
        >
          <Text style={styles.retryText}>{retryText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    borderLeftWidth: 4,
  },

  containerError: {
    backgroundColor: COLORS.expired,
    borderLeftColor: COLORS.error,
  },

  containerWarning: {
    backgroundColor: COLORS.expiringSoon,
    borderLeftColor: COLORS.warning,
  },

  containerInfo: {
    backgroundColor: COLORS.blueGrey,
    borderLeftColor: COLORS.info,
  },

  content: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  icon: {
    fontSize: FONTS.sizes.lg,
    marginRight: SPACING.sm,
  },

  text: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    lineHeight: FONTS.sizes.sm * 1.5,
  },

  textError: {
    color: COLORS.expiredText,
  },

  textWarning: {
    color: COLORS.expiringSoonText,
  },

  textInfo: {
    color: COLORS.text,
  },

  retryButton: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.sm,
    alignSelf: 'flex-start',
  },

  retryText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.background,
  },
});

export default ErrorMessage;