// Home/Dashboard - Redesigned to match auth screens

import { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  RefreshControl,
  TouchableOpacity,
  Platform,
  StatusBar,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getCards, getUserSettings } from '../../lib/supabase';
import { handleAsync } from '../../utils/errorHandling';
import CardItem from '../../components/cards/CardItem';

export default function Dashboard() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [isPremium, setIsPremium] = useState(false);
  const router = useRouter();

  async function loadCards() {
    try {
      setError(null);
      
      const cardsResult = await handleAsync(() => getCards(), { showDefaultError: false });
      const settingsResult = await handleAsync(() => getUserSettings(), { showDefaultError: false });

      if (cardsResult.error) {
        setError(cardsResult.error);
        setCards([]);
      } else {
        setCards(cardsResult.data || []);
      }

      if (!settingsResult.error && settingsResult.data) {
        setIsPremium(settingsResult.data.is_premium || false);
      }
    } catch (err) {
      console.error('Unexpected error loading cards:', err);
      setError('An unexpected error occurred. Please try again.');
      setCards([]);
    } finally {
      setLoading(false);
    }
  }

  useFocusEffect(
    useCallback(() => {
      console.log('📱 Dashboard focused, loading cards...');
      setLoading(true);
      loadCards();
    }, [])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadCards();
    setRefreshing(false);
  }, []);

  // Calculate total value
  const totalValue = cards.reduce((sum, card) => {
    return sum + (parseFloat(card.balance) || 0);
  }, 0);

  // Count expiring soon cards (within 30 days)
  const expiringCount = cards.filter(card => {
    if (!card.expiration_date) return false;
    const daysUntil = Math.ceil((new Date(card.expiration_date) - new Date()) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 && daysUntil <= 30;
  }).length;

  // Loading State
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#141414" />
        <View style={styles.loadingContainer}>
          <View style={styles.logoIcon}>
            <Ionicons name="card" size={40} color="#DC2626" />
          </View>
          <Text style={styles.loadingText}>Loading your cards...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error State
  if (error && cards.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#141414" />
        <View style={styles.errorContainer}>
          <View style={styles.errorIcon}>
            <Ionicons name="alert-circle" size={64} color="#DC2626" />
          </View>
          <Text style={styles.errorTitle}>Unable to Load Cards</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={loadCards}
            accessible={true}
            accessibilityLabel="Retry loading cards"
            accessibilityRole="button"
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => router.push('/(tabs)/add-card')}
            accessible={true}
            accessibilityLabel="Add card manually"
            accessibilityRole="button"
          >
            <Text style={styles.secondaryButtonText}>Add Card Manually</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Empty State
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      {/* Hero Section */}
      <View style={styles.emptyHero}>
        <View style={styles.logoIcon}>
          <Ionicons name="card" size={40} color="#DC2626" />
        </View>
        <Text style={styles.emptyTitle}>Welcome to Cardinal</Text>
        <Text style={styles.emptySubtitle}>
          Your digital gift card wallet
        </Text>
      </View>

      {/* Value Proposition */}
      <Text style={styles.emptyMainText}>
        Never lose track of a gift card again
      </Text>

      {/* Features */}
      <View style={styles.featuresContainer}>
        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="camera" size={28} color="#DC2626" />
          </View>
          <Text style={styles.featureTitle}>Smart Scan</Text>
          <Text style={styles.featureDescription}>
            OCR extracts details instantly
          </Text>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="stats-chart" size={28} color="#DC2626" />
          </View>
          <Text style={styles.featureTitle}>Track Balance</Text>
          <Text style={styles.featureDescription}>
            Monitor value & expiration
          </Text>
        </View>

        <View style={styles.featureItem}>
          <View style={styles.featureIcon}>
            <Ionicons name="phone-portrait" size={28} color="#DC2626" />
          </View>
          <Text style={styles.featureTitle}>Use In-Store</Text>
          <Text style={styles.featureDescription}>
            Generate scannable codes
          </Text>
        </View>
      </View>

      {/* CTA Button */}
      <TouchableOpacity
        style={styles.addCardButton}
        onPress={() => router.push('/(tabs)/add-card')}
        activeOpacity={0.8}
        accessible={true}
        accessibilityLabel="Add your first card"
        accessibilityRole="button"
        accessibilityHint="Opens the add card screen"
      >
        <Text style={styles.addCardButtonText}>Add Your First Card</Text>
      </TouchableOpacity>
    </View>
  );

  // Dashboard Header
  const renderHeader = () => (
    <>
      {/* Error Banner */}
      {error && (
        <View style={styles.errorBanner}>
          <View style={styles.errorBannerContent}>
            <Ionicons name="warning" size={20} color="#FFFFFF" />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setError(null)}
            accessible={true}
            accessibilityLabel="Dismiss error"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Stats Section */}
      {cards.length > 0 && (
        <>
          {/* Total Balance Card */}
          <View 
            style={styles.totalBalanceCard}
            accessible={true}
            accessibilityLabel={`Total balance: $${totalValue.toFixed(2)}`}
            accessibilityRole="summary"
          >
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>${totalValue.toFixed(2)}</Text>
            <View style={styles.balanceFooter}>
              <View style={styles.cardCountBadge}>
                <Text style={styles.cardCountText}>
                  {cards.length} {cards.length === 1 ? 'card' : 'cards'}
                </Text>
              </View>
              {expiringCount > 0 && (
                <View style={styles.expiringBadge}>
                  <View style={styles.expiringDot} />
                  <Text style={styles.expiringText}>
                    {expiringCount} expiring soon
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Quick Stats */}
          <View style={styles.quickStats}>
            <View 
              style={styles.quickStatCard}
              accessible={true}
              accessibilityLabel={`${cards.length} total cards`}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="wallet-outline" size={24} color="#9CA3AF" />
              </View>
              <Text style={styles.quickStatValue}>{cards.length}</Text>
              <Text style={styles.quickStatLabel}>Total</Text>
            </View>

            <View 
              style={styles.quickStatCard}
              accessible={true}
              accessibilityLabel={`${cards.filter(c => c.balance > 0).length} active cards`}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="flash-outline" size={24} color="#9CA3AF" />
              </View>
              <Text style={styles.quickStatValue}>
                {cards.filter(c => c.balance > 0).length}
              </Text>
              <Text style={styles.quickStatLabel}>Active</Text>
            </View>

            <View 
              style={styles.quickStatCard}
              accessible={true}
              accessibilityLabel={`${expiringCount} cards expiring soon`}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="time-outline" size={24} color="#9CA3AF" />
              </View>
              <Text style={styles.quickStatValue}>{expiringCount}</Text>
              <Text style={styles.quickStatLabel}>Expiring</Text>
            </View>
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Your Cards</Text>
          </View>
        </>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#141414" />
      
      {/* Page Title */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Cards</Text>
      </View>
      
      <FlatList
        data={cards}
        renderItem={({ item }) => <CardItem card={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          cards.length === 0 && styles.emptyListContent,
        ]}
        ListEmptyComponent={renderEmptyState}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#DC2626"
            colors={['#DC2626']}
            progressBackgroundColor="#1F1F1F"
          />
        }
        showsVerticalScrollIndicator={false}
        accessible={true}
        accessibilityLabel="Gift cards list"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  
  // Page Header
  pageHeader: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },
  emptyListContent: {
    flexGrow: 1,
  },

  // Loading State
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#9CA3AF',
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  errorIcon: {
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    fontWeight: '400',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#DC2626',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  retryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButton: {
    width: '100%',
    height: 56,
    backgroundColor: '#1F1F1F',
    borderWidth: 2,
    borderColor: '#DC2626',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#DC2626',
  },

  // Error Banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorBannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 20,
  },

  // Total Balance Card
  totalBalanceCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  balanceLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  balanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  cardCountBadge: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cardCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  expiringBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC262620',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  expiringDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#DC2626',
    marginRight: 6,
  },
  expiringText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#DC2626',
  },

  // Quick Stats
  quickStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  quickStatCard: {
    flex: 1,
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    minHeight: 100,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickStatValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  quickStatLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
  },

  // Section Header
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    paddingTop: 40,
  },
  emptyHero: {
    alignItems: 'center',
    marginBottom: 48,
  },
  emptyTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#9CA3AF',
    textAlign: 'center',
  },
  emptyMainText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 48,
    lineHeight: 32,
  },

  // Features
  featuresContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 48,
  },
  featureItem: {
    flex: 1,
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    minHeight: 140,
  },
  featureIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DC262620',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 16,
  },

  // Add Card Button
  addCardButton: {
    height: 56,
    backgroundColor: '#DC2626',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCardButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});