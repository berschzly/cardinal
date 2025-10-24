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
import { useGiftCards } from '../../hooks/useGiftCards';
import { useAuth } from '../../hooks/useAuth';
import GiftCardItem from '../../components/cards/GiftCardItem';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { COLORS, FONTS, SPACING, SUBSCRIPTION } from '../../utils/constants';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;

const DashboardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets(); // Get safe area insets
  const { user } = useAuth();
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

  // Filter cards
  const activeCards = cards.filter((card) => !card.is_used);
  const usedCards = cards.filter((card) => card.is_used);

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
        >
          <Text style={styles.upgradeButtonText}>Upgrade</Text>
        </TouchableOpacity>
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

      {/* Error Message */}
      {error && (
        <ErrorMessage message={error} variant="error" onRetry={refresh} />
      )}

      {/* Gift Cards List */}
      <FlatList
        data={activeCards}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <GiftCardItem card={item} onPress={() => handleCardPress(item)} />
        )}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomPadding }, // Dynamic padding
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

  listContent: {
    paddingHorizontal: SPACING.md,
    // paddingBottom is now dynamic - added inline
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
    // marginBottom is now dynamic - added inline
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