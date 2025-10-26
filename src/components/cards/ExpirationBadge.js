import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { getExpirationStatus } from '../../utils/helpers';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/constants';

/**
 * ExpirationBadge Component
 * Shows expiration status with color coding
 */
const ExpirationBadge = ({ expirationDate, style }) => {
  const status = getExpirationStatus(expirationDate);

  if (!expirationDate || status.status === 'valid') {
    return null; // Don't show badge for valid cards
  }

  const getBadgeStyle = () => {
    switch (status.status) {
      case 'expired':
        return styles.badgeExpired;
      case 'critical':
        return styles.badgeCritical;
      case 'expiring':
        return styles.badgeExpiring;
      default:
        return styles.badgeValid;
    }
  };

  const getTextStyle = () => {
    switch (status.status) {
      case 'expired':
        return styles.textExpired;
      case 'critical':
        return styles.textCritical;
      case 'expiring':
        return styles.textExpiring;
      default:
        return styles.textValid;
    }
  };

  const getIcon = () => {
    switch (status.status) {
      case 'expired':
        return '❌';
      case 'critical':
        return '⚠️';
      case 'expiring':
        return '⏰';
      default:
        return '✓';
    }
  };

  return (
    <View style={[styles.badge, getBadgeStyle(), style]}>
      <Text style={styles.icon}>{getIcon()}</Text>
      <Text style={[styles.text, getTextStyle()]}>{status.message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    alignSelf: 'flex-start',
  },

  badgeExpired: {
    backgroundColor: COLORS.expired,
    borderWidth: 1,
    borderColor: COLORS.error,
  },

  badgeCritical: {
    backgroundColor: COLORS.expiringSoon,
    borderWidth: 1,
    borderColor: COLORS.warning,
  },

  badgeExpiring: {
    backgroundColor: COLORS.expiringSoon,
    borderWidth: 1,
    borderColor: COLORS.warning + '80',
  },

  badgeValid: {
    backgroundColor: COLORS.active,
    borderWidth: 1,
    borderColor: COLORS.success,
  },

  icon: {
    fontSize: FONTS.sizes.sm,
    marginRight: SPACING.xs / 2,
  },

  text: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semiBold,
  },

  textExpired: {
    color: COLORS.expiredText,
  },

  textCritical: {
    color: COLORS.expiringSoonText,
  },

  textExpiring: {
    color: COLORS.expiringSoonText,
  },

  textValid: {
    color: COLORS.activeText,
  },
});

export default ExpirationBadge;