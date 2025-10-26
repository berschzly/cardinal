import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native';
import { 
  activatePremiumManual, 
  deactivatePremiumManual,
  getSubscriptionProducts,
  restorePurchases,
} from '../../services/subscription';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { checkPremiumStatus } from '../../services/database';
import Loading from '../../components/common/Loading';
import { COLORS, FONTS, SPACING, RADIUS, SUBSCRIPTION } from '../../utils/constants';

const SubscriptionScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [products, setProducts] = useState([]);

  // Calculate bottom padding for tab bar
  const tabBarHeight = Platform.OS === 'ios' ? 95 : 82;
  const bottomPadding = tabBarHeight + SPACING.md;

  useEffect(() => {
    checkSubscription();
  }, []);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { products: availableProducts } = await getSubscriptionProducts();
    setProducts(availableProducts);
  };

  const checkSubscription = async () => {
    setLoading(true);
    const { isPremium: premium, subscriptionStatus: status } = await checkPremiumStatus();
    setIsPremium(premium);
    setSubscriptionStatus(status);
    setLoading(false);
  };

  const handleUpgrade = async () => {
    // Show options: Real purchase (coming soon) or Manual activate (dev only)
    if (__DEV__) {
      Alert.alert(
        'Upgrade Options',
        'Choose how to activate Premium:',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Manual Activate (Dev)',
            onPress: handleManualActivate,
          },
          {
            text: 'Real Purchase (Coming Soon)',
            onPress: handleRealPurchase,
          },
        ]
      );
    } else {
      handleRealPurchase();
    }
  };
  const handleManualActivate = async () => {
    Alert.alert(
      'Activate Premium?',
      'This will manually activate Premium for testing. Only works in development.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Activate',
          onPress: async () => {
            setLoading(true);
            const { success, error } = await activatePremiumManual();
            setLoading(false);

            if (error) {
              Alert.alert('Error', error);
              return;
            }

            Alert.alert(
              'Success!',
              'Premium activated! Restart the app to see changes.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    checkSubscription();
                    navigation.goBack();
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handleRealPurchase = () => {
    Alert.alert(
      'Coming Soon',
      'Real in-app purchases will be available once the app is deployed to App Store and Google Play.\n\nFor now, use "Manual Activate" in development mode to test Premium features.',
      [{ text: 'OK' }]
    );
  };

  const handleRestorePurchases = async () => {
    setLoading(true);
    const { restored, error } = await restorePurchases();
    setLoading(false);

    if (error) {
      Alert.alert('Error', error);
      return;
    }

    if (restored) {
      Alert.alert('Success', 'Your purchases have been restored!');
      checkSubscription();
    } else {
      Alert.alert('No Purchases Found', 'No previous purchases found for this account.');
    }
  };

  const handleDeactivatePremium = async () => {
    if (!__DEV__) return;

    Alert.alert(
      'Deactivate Premium?',
      'This will remove Premium status. Only for testing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const { success, error } = await deactivatePremiumManual();
            setLoading(false);

            if (error) {
              Alert.alert('Error', error);
              return;
            }

            Alert.alert('Success', 'Premium deactivated', [
              {
                text: 'OK',
                onPress: () => {
                  checkSubscription();
                  navigation.goBack();
                },
              },
            ]);
          },
        },
      ]
    );
  };
  const handleManageSubscription = () => {
    Alert.alert(
      'Manage Subscription',
      'You can manage your subscription through your App Store or Google Play account.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Open Settings',
          onPress: () => {
            // TODO: Link to App Store/Play Store subscription management
            Alert.alert('Info', 'This will open your subscription settings in Phase 20');
          },
        },
      ]
    );
  };

  if (loading) {
    return <Loading fullScreen text="Loading subscription..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Current Plan Banner */}
        <View style={[
          styles.currentPlanBanner,
          isPremium ? styles.premiumBanner : styles.freeBanner
        ]}>
          <Text style={styles.currentPlanBadge}>
            {isPremium ? '⭐ PREMIUM' : '🆓 FREE'}
          </Text>
          <Text style={styles.currentPlanTitle}>
            {isPremium ? 'Premium Member' : 'Free Plan'}
          </Text>
          <Text style={styles.currentPlanSubtitle}>
            {isPremium
              ? 'Enjoying unlimited gift cards!'
              : 'Up to 15 gift cards'}
          </Text>
        </View>

        {/* Comparison Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plans & Features</Text>

          {/* Free Plan Card */}
          <View style={[styles.planCard, !isPremium && styles.planCardActive]}>
            <View style={styles.planHeader}>
              <View>
                <Text style={styles.planName}>Free</Text>
                <Text style={styles.planPrice}>$0</Text>
              </View>
              {!isPremium && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Current Plan</Text>
                </View>
              )}
            </View>

            <View style={styles.featuresList}>
              <FeatureItem icon="✅" text="Up to 15 gift cards" />
              <FeatureItem icon="✅" text="Track balances" />
              <FeatureItem icon="✅" text="Expiration reminders" />
              <FeatureItem icon="✅" text="Basic card management" />
              <FeatureItem icon="❌" text="Unlimited cards" />
              <FeatureItem icon="❌" text="Location notifications" />
              <FeatureItem icon="❌" text="Card scanning (OCR)" />
              <FeatureItem icon="❌" text="Priority support" />
              <FeatureItem icon="❌" text="No ads" />
            </View>
          </View>

          {/* Premium Plan Card */}
          <View style={[styles.planCard, styles.premiumCard, isPremium && styles.planCardActive]}>
            <View style={styles.planHeader}>
              <View>
                <View style={styles.planNameRow}>
                  <Text style={styles.planName}>Premium</Text>
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularBadgeText}>POPULAR</Text>
                  </View>
                </View>
                <Text style={styles.planPrice}>${SUBSCRIPTION.premiumPriceValue}</Text>
                <Text style={styles.planPeriod}>per month</Text>
              </View>
              {isPremium && (
                <View style={[styles.currentBadge, styles.currentBadgePremium]}>
                  <Text style={styles.currentBadgeText}>Current Plan</Text>
                </View>
              )}
              {__DEV__ && (
                <View style={styles.devSection}>
                  <Text style={styles.devSectionTitle}>🔧 Development Tools</Text>
                  {!isPremium ? (
                    <TouchableOpacity
                      style={styles.devButton}
                      onPress={handleManualActivate}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.devButtonText}>
                        Manual Activate Premium
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={[styles.devButton, styles.devButtonDanger]}
                      onPress={handleDeactivatePremium}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.devButtonText}>
                        Deactivate Premium (Testing)
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            <View style={styles.featuresList}>
              <FeatureItem icon="✅" text="Unlimited gift cards" premium />
              <FeatureItem icon="✅" text="Track balances" premium />
              <FeatureItem icon="✅" text="Expiration reminders" premium />
              <FeatureItem icon="✅" text="Advanced card management" premium />
              <FeatureItem icon="✅" text="Location-based notifications" premium />
              <FeatureItem icon="✅" text="Card scanning with OCR" premium />
              <FeatureItem icon="✅" text="Cloud backup & sync" premium />
              <FeatureItem icon="✅" text="Priority support" premium />
              <FeatureItem icon="✅" text="Ad-free experience" premium />
            </View>

            {!isPremium && (
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={handleUpgrade}
                activeOpacity={0.8}
              >
                <Text style={styles.upgradeButtonText}>
                  Upgrade to Premium
                </Text>
              </TouchableOpacity>
            )}

            {isPremium && (
              <TouchableOpacity
                style={styles.manageButton}
                onPress={handleManageSubscription}
                activeOpacity={0.8}
              >
                <Text style={styles.manageButtonText}>
                  Manage Subscription
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why Go Premium?</Text>

          <View style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>🚀</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Unlimited Cards</Text>
              <Text style={styles.benefitText}>
                Add as many gift cards as you want. No limits!
              </Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>📍</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Smart Reminders</Text>
              <Text style={styles.benefitText}>
                Get notified when you're near stores with unused gift cards
              </Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>📸</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Instant Scanning</Text>
              <Text style={styles.benefitText}>
                Scan gift cards with your camera and auto-fill details
              </Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>☁️</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Cloud Sync</Text>
              <Text style={styles.benefitText}>
                Access your cards across all your devices
              </Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <Text style={styles.benefitIcon}>🚫</Text>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>No Ads</Text>
              <Text style={styles.benefitText}>
                Enjoy a clean, ad-free experience
              </Text>
            </View>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>

          <FAQItem
            question="Can I cancel anytime?"
            answer="Yes! You can cancel your subscription at any time through your App Store or Google Play account. You'll continue to have Premium access until the end of your billing period."
          />

          <FAQItem
            question="What happens to my cards if I cancel?"
            answer="Your gift cards are never deleted. If you cancel Premium, you'll keep all your cards but won't be able to add new ones if you exceed the free tier limit (15 cards)."
          />

          <FAQItem
            question="Do you offer a free trial?"
            answer="We're working on adding a free trial! For now, you can try all Premium features risk-free with our 7-day money-back guarantee."
          />

          <FAQItem
            question="How do I restore my subscription?"
            answer="If you purchased Premium on a different device, your subscription will automatically sync when you sign in with the same account."
          />
        </View>

        {/* Terms */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.restoreButton}
            onPress={handleRestorePurchases}
            activeOpacity={0.8}
          >
            <Text style={styles.restoreButtonText}>
              Restore Purchases
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.termsSection}>
          <Text style={styles.termsText}>
            By purchasing Premium, you agree to our Terms of Service and Privacy Policy. Subscriptions automatically renew unless canceled.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Feature Item Component
const FeatureItem = ({ icon, text, premium = false }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureIcon}>{icon}</Text>
    <Text style={[
      styles.featureText,
      premium && styles.featureTextPremium
    ]}>
      {text}
    </Text>
  </View>
);

// FAQ Item Component
const FAQItem = ({ question, answer }) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setExpanded(!expanded)}
      activeOpacity={0.8}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <Text style={styles.faqIcon}>{expanded ? '▼' : '▶'}</Text>
      </View>
      {expanded && (
        <Text style={styles.faqAnswer}>{answer}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },

  backButton: {
    padding: SPACING.sm,
  },

  backButtonText: {
    fontSize: FONTS.sizes['3xl'],
    color: COLORS.primary,
  },

  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
  },

  headerSpacer: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: SPACING.md,
  },

  currentPlanBanner: {
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },

  freeBanner: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
  },

  premiumBanner: {
    backgroundColor: COLORS.primary,
  },

  currentPlanBadge: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.background,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },

  currentPlanTitle: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.background,
    marginBottom: SPACING.xs,
  },

  currentPlanSubtitle: {
    fontSize: FONTS.sizes.base,
    color: COLORS.background,
    opacity: 0.9,
  },

  section: {
    marginBottom: SPACING.xl,
  },

  sectionTitle: {
    fontSize: FONTS.sizes.lg,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },

  planCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },

  planCardActive: {
    borderColor: COLORS.primary,
    borderWidth: 3,
  },

  premiumCard: {
    backgroundColor: COLORS.primary + '08',
  },

  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },

  planName: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginRight: SPACING.sm,
  },

  planPrice: {
    fontSize: FONTS.sizes['3xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.primary,
  },

  planPeriod: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs / 2,
  },

  popularBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: RADIUS.sm,
  },

  popularBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.bold,
    color: COLORS.background,
  },

  currentBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },

  currentBadgePremium: {
    backgroundColor: COLORS.primary,
  },

  currentBadgeText: {
    fontSize: FONTS.sizes.xs,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.background,
  },

  featuresList: {
    marginBottom: SPACING.md,
  },

  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },

  featureIcon: {
    fontSize: 16,
    marginRight: SPACING.sm,
  },

  featureText: {
    flex: 1,
    fontSize: FONTS.sizes.sm,
    color: COLORS.text,
    lineHeight: FONTS.sizes.sm * 1.5,
  },

  featureTextPremium: {
    fontWeight: FONTS.weights.medium,
  },

  upgradeButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },

  upgradeButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.background,
  },

  manageButton: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  manageButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.primary,
  },

  benefitCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
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

  benefitIcon: {
    fontSize: 32,
    marginRight: SPACING.md,
  },

  benefitContent: {
    flex: 1,
  },

  benefitTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },

  benefitText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.sm * 1.5,
  },

  faqItem: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },

  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  faqQuestion: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
  },

  faqIcon: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },

  faqAnswer: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.sm * 1.5,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },

  termsSection: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginTop: SPACING.lg,
  },

  termsText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: FONTS.sizes.xs * 1.6,
  },
  devSection: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.warning + '20',
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.warning,
  },

  devSectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.bold,
    color: COLORS.warning,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },

  devButton: {
    backgroundColor: COLORS.warning,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },

  devButtonDanger: {
    backgroundColor: COLORS.error,
  },

  devButtonText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.background,
  },

  restoreButton: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  restoreButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.medium,
    color: COLORS.primary,
  },
});

export default SubscriptionScreen;