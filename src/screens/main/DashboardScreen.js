import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import { useGiftCards } from '../../hooks/useGiftCards';
import { useAuth } from '../../hooks/useAuth';
import { useSubscription } from '../../hooks/useSubscription';
import GiftCardItem from '../../components/cards/GiftCardItem';
import ExpirationBadge from '../../components/cards/ExpirationBadge';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { COLORS, FONTS, SPACING, SUBSCRIPTION } from '../../utils/constants';
import { isCardExpiringSoon, isCardExpired, daysUntilExpiration } from '../../utils/helpers';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

import Constants from 'expo-constants';

// AdMob Ad Unit IDs - Get from env or use test IDs in development
const AD_UNIT_ID = __DEV__ 
  ? TestIds.BANNER 
  : Platform.select({
      ios: Constants.expoConfig?.extra?.admobIosBannerId || TestIds.BANNER,
      android: Constants.expoConfig?.extra?.admobAndroidBannerId || TestIds.BANNER,
    });

/**
 * Sort cards by expiration status
 * Priority: Expired > Expiring Soon (by days) > Regular (by date added)
 */
const sortCardsByExpiration = (cards) => {
  return [...cards].sort((a, b) => {
    const aExpired = isCardExpired(a.expiration_date);
    const bExpired = isCardExpired(b.expiration_date);

    // Expired cards first
    if (aExpired && !bExpired) return -1;
    if (!aExpired && bExpired) return 1;

    const aExpiring = isCardExpiringSoon(a.expiration_date);
    const bExpiring = isCardExpiringSoon(b.expiration_date);

    // Expiring cards next
    if (aExpiring && !bExpiring) return -1;
    if (!aExpiring && bExpiring) return 1;

    // If both expiring, sort by days until expiration (soonest first)
    if (aExpiring && bExpiring) {
      const aDays = daysUntilExpiration(a.expiration_date);
      const bDays = daysUntilExpiration(b.expiration_date);
      return (aDays || 999) - (bDays || 999);
    }

    // Default: most recently added first
    return new Date(b.created_at) - new Date(a.created_at);
  });
};

/**
 * Insert ads into card list at regular intervals
 * Ads are placed every 3 cards for free users
 */
const insertAdsIntoCards = (cards, isPremium) => {
  if (isPremium || cards.length === 0) {
    return cards.map(card => ({ type: 'card', data: card }));
  }

  const itemsWithAds = [];
  const AD_FREQUENCY = 3; // Show ad every 3 cards

  cards.forEach((card, index) => {
    itemsWithAds.push({ type: 'card', data: card, id: card.id });

    // Insert ad after every AD_FREQUENCY cards (but not after the last card)
    if ((index + 1) % AD_FREQUENCY === 0 && index < cards.length - 1) {
      itemsWithAds.push({ 
        type: 'ad', 
        id: `ad_${index}`,
        adIndex: Math.floor(index / AD_FREQUENCY)
      });
    }
  });

  return itemsWithAds;
};

const DashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const {
    cards,
    loading,
    error,
    cardCount,
    canAddMore,
    fetchCards,
    refresh,
  } = useGiftCards(true);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  };

  const handleCardPress = (card) => {
    navigation.navigate('CardDetails', { cardId: card.id });
  };

  const handleAddCard = () => {
    navigation.navigate('AddCard');
  };

  // Filter and sort cards
  const activeCards = cards.filter((card) => !card.is_used);
  const sortedActiveCards = sortCardsByExpiration(activeCards);
  const usedCards = cards.filter((card) => card.is_used);

  // Insert ads into the card list for free users
  const listItems = insertAdsIntoCards(sortedActiveCards, isPremium);

  // Count cards by expiration status
  const expiringCards = activeCards.filter((card) => isCardExpiringSoon(card.expiration_date));
  const expiredCards = activeCards.filter((card) => isCardExpired(card.expiration_date));

  // Get user's first name
  const getFirstName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    return 'there';
  };

  // Calculate bottom padding for tab bar
  const tabBarHeight = Platform.OS === 'ios' ? 95 : 82;
  const bottomPadding = tabBarHeight + SPACING.md;

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🎁</Text>
      <Text style={styles.emptyTitle}>No Gift Cards Yet</Text>
      <Text style={styles.emptyText}>
        Start adding your gift cards to track balances and get reminders!
      </Text>
      <TouchableOpacity 
        style={styles.emptyButton} 
        onPress={handleAddCard}
        activeOpacity={0.8}
      >
        <Text style={styles.emptyButtonText}>Add Your First Card</Text>
      </TouchableOpacity>
    </View>
  );

  // Render card limit info (for free users)
  const CardLimitInfo = () => {
    if (isPremium) return null;

    if (canAddMore) {
      return (
        <View style={styles.limitInfo}>
          <Text style={styles.limitText}>
            {cardCount} / {SUBSCRIPTION.maxFreeCards} cards
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.limitWarning}>
        <Text style={styles.limitWarningText}>
          ⚠️ You've reached your card limit. Upgrade to Premium for unlimited cards!
        </Text>
        <TouchableOpacity 
          style={styles.upgradeButton}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Settings', {
            screen: 'Subscription'
          })}
        >
          <Text style={styles.upgradeButtonText}>Upgrade</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Expiration Alert Banner (if cards expiring/expired)
  const ExpirationAlertBanner = () => {
    if (expiredCards.length === 0 && expiringCards.length === 0) return null;

    return (
      <View style={styles.alertBanner}>
        {expiredCards.length > 0 && (
          <Text style={styles.alertText}>
            ❌ {expiredCards.length} card{expiredCards.length > 1 ? 's have' : ' has'} expired
          </Text>
        )}
        {expiringCards.length > 0 && (
          <Text style={styles.alertText}>
            ⏰ {expiringCards.length} card{expiringCards.length > 1 ? 's are' : ' is'} expiring soon
          </Text>
        )}
      </View>
    );
  };

  // Ad Banner Component - styled to match gift cards
  const AdBanner = ({ adIndex }) => {
    const [adError, setAdError] = useState(false);

    if (adError) {
      return null; // Hide ad if it fails to load
    }

    return (
      <View style={styles.adContainer}>
        <View style={styles.adCard}>
          <View style={styles.adLabel}>
            <Text style={styles.adLabelText}>SPONSORED</Text>
          </View>
          <BannerAd
            unitId={AD_UNIT_ID}
            size={BannerAdSize.LARGE_BANNER}
            requestOptions={{
              requestNonPersonalizedAdsOnly: false,
            }}
            onAdFailedToLoad={(error) => {
              console.log('Ad failed to load:', error);
              setAdError(true);
            }}
          />
        </View>
      </View>
    );
  };

  // Render individual list item (card or ad)
  const renderItem = ({ item }) => {
    if (item.type === 'ad') {
      return <AdBanner adIndex={item.adIndex} />;
    }

    // Render gift card
    return (
      <View style={styles.cardContainer}>
        <GiftCardItem card={item.data} onPress={() => handleCardPress(item.data)} />
        {item.data.expiration_date && (
          <ExpirationBadge 
            expirationDate={item.data.expiration_date} 
            style={styles.expirationBadge} 
          />
        )}
      </View>
    );
  };

  if (loading && cards.length === 0) {
    return <Loading fullScreen text="Loading your gift cards..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.greeting} numberOfLines={1}>
            Hey {getFirstName()}! 👋
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {activeCards.length > 0
              ? `You have ${activeCards.length} active gift card${
                  activeCards.length !== 1 ? 's' : ''
                }`
              : 'Start adding your gift cards'}
          </Text>
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={[
            styles.addButton,
            !canAddMore && styles.addButtonDisabled,
          ]}
          onPress={handleAddCard}
          disabled={!canAddMore}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Card Limit Info */}
      <CardLimitInfo />

      {/* Expiration Alert Banner */}
      <ExpirationAlertBanner />

      {/* Error Message */}
      {error && (
        <ErrorMessage message={error} variant="error" onRetry={refresh} />
      )}

      {/* Gift Cards List with Ads */}
      <FlatList
        data={listItems}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomPadding },
          activeCards.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={!loading && <EmptyState />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        bounces={true}
      />

      {/* Used Cards Section (if any) */}
      {usedCards.length > 0 && (
        <View style={[styles.usedSection, { marginBottom: bottomPadding }]}>
          <Text style={styles.usedTitle}>Used Cards ({usedCards.length})</Text>
          <Text style={styles.usedSubtext}>
            Tap to view your used gift cards
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    backgroundColor: COLORS.background,
  },

  headerText: {
    flex: 1,
    marginRight: SPACING.md,
  },

  greeting: {
    fontSize: isSmallDevice ? FONTS.sizes.xl : FONTS.sizes['2xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },

  subtitle: {
    fontSize: isSmallDevice ? FONTS.sizes.sm : FONTS.sizes.base,
    color: COLORS.textSecondary,
  },

  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  addButtonDisabled: {
    backgroundColor: COLORS.disabled,
    opacity: 0.6,
  },

  addButtonText: {
    fontSize: FONTS.sizes['3xl'],
    color: COLORS.background,
    fontWeight: FONTS.weights.light,
    marginTop: -2,
  },

  limitInfo: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },

  limitText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },

  limitWarning: {
    backgroundColor: COLORS.expiringSoon,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: SPACING.sm,
    flexDirection: isSmallDevice ? 'column' : 'row',
    alignItems: isSmallDevice ? 'flex-start' : 'center',
    justifyContent: 'space-between',
  },

  limitWarningText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.expiringSoonText,
    marginRight: isSmallDevice ? 0 : SPACING.sm,
    marginBottom: isSmallDevice ? SPACING.sm : 0,
  },

  upgradeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.sm,
    alignSelf: isSmallDevice ? 'flex-start' : 'auto',
  },

  upgradeButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.background,
  },

  alertBanner: {
    backgroundColor: COLORS.expired,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: SPACING.sm,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.error,
  },

  alertText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.expiredText,
    fontWeight: FONTS.weights.semiBold,
    marginBottom: SPACING.xs / 2,
  },

  cardContainer: {
    marginBottom: SPACING.md,
  },

  expirationBadge: {
    marginTop: SPACING.xs,
    marginLeft: SPACING.sm,
  },

  // Ad Styles - Designed to blend with gift cards
  adContainer: {
    marginBottom: SPACING.md,
  },

  adCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SPACING.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border || '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  adLabel: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    alignSelf: 'flex-start',
  },

  adLabelText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.background,
    letterSpacing: 0.5,
  },

  listContent: {
    paddingHorizontal: SPACING.md,
  },

  listContentEmpty: {
    flexGrow: 1,
  },

  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['3xl'],
    paddingHorizontal: SPACING.xl,
    minHeight: 400,
  },

  emptyIcon: {
    fontSize: isSmallDevice ? 64 : 80,
    marginBottom: SPACING.lg,
  },

  emptyTitle: {
    fontSize: isSmallDevice ? FONTS.sizes.xl : FONTS.sizes['2xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },

  emptyText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: FONTS.sizes.base * 1.5,
    maxWidth: 300,
  },

  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.md,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  emptyButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.background,
  },

  usedSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    borderRadius: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.textLight,
  },

  usedTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },

  usedSubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },
});

export default DashboardScreen;