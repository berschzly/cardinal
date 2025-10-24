import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGiftCards } from '../../hooks/useGiftCards';
import { useAuth } from '../../hooks/useAuth';
import GiftCardItem from '../../components/cards/GiftCardItem';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { COLORS, FONTS, SPACING, SUBSCRIPTION } from '../../utils/constants';

const DashboardScreen = ({ navigation }) => {
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
    // TODO: Navigate to CardDetailsScreen in Phase 7
    console.log('Card pressed:', card.id);
    // navigation.navigate('CardDetails', { cardId: card.id });
  };

  const handleAddCard = () => {
    // TODO: Navigate to AddCardScreen in Phase 6
    console.log('Add card pressed');
    // navigation.navigate('AddCard');
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

  // Empty state component
  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>🎁</Text>
      <Text style={styles.emptyTitle}>No Gift Cards Yet</Text>
      <Text style={styles.emptyText}>
        Start adding your gift cards to track balances and get reminders!
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddCard}>
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
          ⚠️ You've reached your card limit. Upgrade to Premium for unlimited
          cards!
        </Text>
        <TouchableOpacity style={styles.upgradeButton}>
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
        <View>
          <Text style={styles.greeting}>Hey {getFirstName()}! 👋</Text>
          <Text style={styles.subtitle}>
            {activeCards.length > 0
              ? `You have ${activeCards.length} active gift card${
                  activeCards.length !== 1 ? 's' : ''
                }`
              : 'Start adding your gift cards'}
          </Text>
        </View>

        {/* Add Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddCard}
          disabled={!canAddMore}
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
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!loading && <EmptyState />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Used Cards Section (if any) */}
      {usedCards.length > 0 && (
        <View style={styles.usedSection}>
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
  },

  greeting: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },

  subtitle: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
  },

  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  addButtonText: {
    fontSize: FONTS.sizes['3xl'],
    color: COLORS.background,
    fontWeight: FONTS.weights.light,
  },

  limitInfo: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    borderRadius: SPACING.sm,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  limitWarningText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.expiringSoonText,
    marginRight: SPACING.sm,
  },

  upgradeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: SPACING.sm,
  },

  upgradeButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.background,
  },

  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING['3xl'],
    paddingHorizontal: SPACING.xl,
  },

  emptyIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },

  emptyTitle: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  emptyText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: FONTS.sizes.base * 1.5,
  },

  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: SPACING.md,
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
    marginBottom: SPACING.md,
    borderRadius: SPACING.md,
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