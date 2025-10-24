import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import ExpirationBadge from './ExpirationBadge';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/constants';

/**
 * GiftCardItem Component
 * Displays a single gift card in a list
 * @param {Object} card - Gift card data
 * @param {Function} onPress - Function to call when card is pressed
 */
const GiftCardItem = ({ card, onPress }) => {
  const formatBalance = (balance, currency = 'USD') => {
    if (!balance && balance !== 0) return 'No balance';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(balance);
  };

  const getStoreInitial = (storeName) => {
    return storeName ? storeName.charAt(0).toUpperCase() : '🎁';
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Card Image or Placeholder */}
      <View style={styles.imageContainer}>
        {card.image_url ? (
          <Image source={{ uri: card.image_url }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              {getStoreInitial(card.store_name)}
            </Text>
          </View>
        )}
      </View>

      {/* Card Info */}
      <View style={styles.content}>
        {/* Store Name */}
        <Text style={styles.storeName} numberOfLines={1}>
          {card.store_name}
        </Text>

        {/* Balance */}
        <Text style={styles.balance}>
          {formatBalance(card.balance, card.currency)}
        </Text>

        {/* Card Number (partially hidden) */}
        {card.card_number && (
          <Text style={styles.cardNumber} numberOfLines={1}>
            •••• {card.card_number.slice(-4)}
          </Text>
        )}

        {/* Expiration Badge */}
        {card.expiration_date && (
          <ExpirationBadge
            expirationDate={card.expiration_date}
            style={styles.badge}
          />
        )}

        {/* Online/In-store Badge */}
        {card.is_online && (
          <View style={styles.onlineBadge}>
            <Text style={styles.onlineBadgeText}>🌐 Online</Text>
          </View>
        )}
      </View>

      {/* Arrow Icon */}
      <View style={styles.arrow}>
        <Text style={styles.arrowText}>›</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.md,
  },

  imageContainer: {
    marginRight: SPACING.md,
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
  },

  placeholder: {
    width: 60,
    height: 60,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.background,
  },

  content: {
    flex: 1,
  },

  storeName: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },

  balance: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },

  cardNumber: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },

  badge: {
    marginTop: SPACING.xs,
  },

  onlineBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.blueGrey,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: RADIUS.full,
    marginTop: SPACING.xs,
  },

  onlineBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
  },

  arrow: {
    marginLeft: SPACING.sm,
  },

  arrowText: {
    fontSize: FONTS.sizes['3xl'],
    color: COLORS.textLight,
    fontWeight: FONTS.weights.light,
  },
});

export default GiftCardItem;