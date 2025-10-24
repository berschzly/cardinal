import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/constants';

/**
 * ExpirationBadge Component
 * Shows expiration status with color coding
 * @param {Date|string} expirationDate - Card expiration date
 * @param {Object} style - Additional styles
 */
const ExpirationBadge = ({ expirationDate, style }) => {
  if (!expirationDate) return null;

  const getExpirationInfo = () => {
    const today = new Date();
    const expDate = new Date(expirationDate);
    const daysUntilExpiration = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration < 0) {
      return {
        text: 'Expired',
        icon: '❌',
        variant: 'expired',
      };
    } else if (daysUntilExpiration === 0) {
      return {
        text: 'Expires Today',
        icon: '⚠️',
        variant: 'critical',
      };
    } else if (daysUntilExpiration <= 7) {
      return {
        text: `Expires in ${daysUntilExpiration}d`,
        icon: '⚠️',
        variant: 'critical',
      };
    } else if (daysUntilExpiration <= 30) {
      return {
        text: `Expires in ${daysUntilExpiration}d`,
        icon: '⏰',
        variant: 'warning',
      };
    } else {
      return {
        text: `Expires ${expDate.toLocaleDateString()}`,
        icon: '✓',
        variant: 'active',
      };
    }
  };

  const info = getExpirationInfo();

  const getBadgeStyle = () => {
    switch (info.variant) {
      case 'expired':
        return styles.badgeExpired;
      case 'critical':
        return styles.badgeCritical;
      case 'warning':
        return styles.badgeWarning;
      default:
        return styles.badgeActive;
    }
  };

  const getTextStyle = () => {
    switch (info.variant) {
      case 'expired':
        return styles.textExpired;
      case 'critical':
        return styles.textCritical;
      case 'warning':
        return styles.textWarning;
      default:
        return styles.textActive;
    }
  };

  return (
    <View style={[styles.badge, getBadgeStyle(), style]}>
      <Text style={styles.icon}>{info.icon}</Text>
      <Text style={[styles.text, getTextStyle()]}>{info.text}</Text>
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
  },

  badgeExpired: {
    backgroundColor: COLORS.expired,
  },

  badgeCritical: {
    backgroundColor: COLORS.expiringSoon,
  },

  badgeWarning: {
    backgroundColor: COLORS.expiringSoon,
  },

  badgeActive: {
    backgroundColor: COLORS.active,
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

  textWarning: {
    color: COLORS.expiringSoonText,
  },

  textActive: {
    color: COLORS.activeText,
  },
});

export default ExpirationBadge;