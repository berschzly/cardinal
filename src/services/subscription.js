import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';
import { checkPremiumStatus, createSubscription, updateUserProfile } from './database';

// ====================================
// SUBSCRIPTION SERVICE
// ====================================

/**
 * Check if in-app purchases are available
 * @returns {boolean}
 */
export const isIAPAvailable = () => {
  // IAP only works on real devices, not simulators/emulators
  return Device.isDevice && (Platform.OS === 'ios' || Platform.OS === 'android');
};

/**
 * Initialize subscription service
 * Sets up listeners and checks for existing purchases
 */
export const initializeSubscription = async () => {
  try {
    console.log('Subscription service initialized (purchases disabled for development)');
    
    // TODO: When ready for production, implement:
    // 1. Initialize react-native-iap
    // 2. Set up purchase listeners
    // 3. Check for existing purchases
    // 4. Restore purchases if needed
    
    return { success: true };
  } catch (error) {
    console.error('Initialize subscription error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get available subscription products
 * @returns {Promise<{products, error}>}
 */
export const getSubscriptionProducts = async () => {
  try {
    // TODO: When ready for production, fetch from App Store/Play Store
    // For now, return mock product data
    
    const mockProducts = [
      {
        productId: Platform.OS === 'ios' 
          ? 'com.cardinal.premium.monthly' 
          : 'com.cardinal.premium.monthly',
        title: 'Cardinal Premium',
        description: 'Unlimited gift cards and premium features',
        price: '$4.99',
        currency: 'USD',
        localizedPrice: '$4.99',
      },
    ];

    return { products: mockProducts, error: null };
  } catch (error) {
    console.error('Get subscription products error:', error);
    return { products: [], error: error.message };
  }
};

/**
 * Purchase premium subscription
 * @param {string} productId - Product identifier
 * @returns {Promise<{success, error}>}
 */
export const purchasePremium = async (productId) => {
  try {
    // Check if IAP is available
    if (!isIAPAvailable()) {
      throw new Error('In-app purchases are not available on this device');
    }

    // TODO: When ready for production:
    // 1. Request purchase from App Store/Play Store
    // 2. Get receipt data
    // 3. Verify receipt with backend (recommended for security)
    // 4. Update user's subscription status
    // 5. Return success/failure

    // For now, show development message
    Alert.alert(
      'Development Mode',
      'In-app purchases are disabled during development. Deploy to App Store/Play Store to enable real purchases.',
      [{ text: 'OK' }]
    );

    return { success: false, error: 'Purchases disabled in development' };
  } catch (error) {
    console.error('Purchase premium error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Restore previous purchases
 * Useful when user reinstalls app or logs in on new device
 * @returns {Promise<{restored, error}>}
 */
export const restorePurchases = async () => {
  try {
    console.log('Attempting to restore purchases...');

    // TODO: When ready for production:
    // 1. Request restore from App Store/Play Store
    // 2. Get all previous purchases
    // 3. Verify receipts
    // 4. Update user's subscription status
    // 5. Return restored status

    Alert.alert(
      'Restore Purchases',
      'Purchase restoration will be available once the app is deployed to App Store/Play Store.',
      [{ text: 'OK' }]
    );

    return { restored: false, error: null };
  } catch (error) {
    console.error('Restore purchases error:', error);
    return { restored: false, error: error.message };
  }
};

/**
 * Manually activate premium (for testing/development)
 * @returns {Promise<{success, error}>}
 */
export const activatePremiumManual = async () => {
  try {
    // Calculate expiration date (1 year from now for testing)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Update user profile to premium
    const { error } = await updateUserProfile({
      is_premium: true,
      subscription_status: 'active',
      subscription_started_at: new Date().toISOString(),
      subscription_expires_at: expiresAt.toISOString(),
    });

    if (error) throw new Error(error);

    return { success: true, error: null };
  } catch (error) {
    console.error('Activate premium manual error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Manually deactivate premium (for testing/development)
 * @returns {Promise<{success, error}>}
 */
export const deactivatePremiumManual = async () => {
  try {
    // Update user profile to free
    const { error } = await updateUserProfile({
      is_premium: false,
      subscription_status: 'free',
    });

    if (error) throw new Error(error);

    return { success: true, error: null };
  } catch (error) {
    console.error('Deactivate premium manual error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check subscription status
 * @returns {Promise<{isPremium, status, error}>}
 */
export const checkSubscription = async () => {
  try {
    const { isPremium, subscriptionStatus, error } = await checkPremiumStatus();
    
    if (error) throw new Error(error);

    return { 
      isPremium, 
      status: subscriptionStatus,
      error: null 
    };
  } catch (error) {
    console.error('Check subscription error:', error);
    return { 
      isPremium: false, 
      status: null, 
      error: error.message 
    };
  }
};

/**
 * Get formatted subscription info for display
 * @returns {Promise<{info, error}>}
 */
export const getSubscriptionInfo = async () => {
  try {
    const { isPremium, status } = await checkSubscription();

    if (!isPremium || !status) {
      return {
        info: {
          plan: 'Free',
          status: 'active',
          features: ['Up to 15 gift cards', 'Basic features'],
          expiresAt: null,
        },
        error: null,
      };
    }

    const expiresAt = status.subscription_expires_at 
      ? new Date(status.subscription_expires_at)
      : null;

    const info = {
      plan: 'Premium',
      status: status.subscription_status || 'active',
      features: [
        'Unlimited gift cards',
        'Location notifications',
        'Card scanning',
        'No ads',
        'Priority support',
      ],
      expiresAt,
      startedAt: status.subscription_started_at 
        ? new Date(status.subscription_started_at)
        : null,
    };

    return { info, error: null };
  } catch (error) {
    console.error('Get subscription info error:', error);
    return { info: null, error: error.message };
  }
};

// ====================================
// DEVELOPMENT HELPERS
// ====================================

/**
 * Development helper to test premium features
 * Only works in __DEV__ mode
 */
export const devTogglePremium = async () => {
  if (!__DEV__) {
    console.warn('devTogglePremium only works in development mode');
    return { success: false };
  }

  try {
    const { isPremium } = await checkSubscription();
    
    if (isPremium) {
      return await deactivatePremiumManual();
    } else {
      return await activatePremiumManual();
    }
  } catch (error) {
    console.error('Dev toggle premium error:', error);
    return { success: false, error: error.message };
  }
};

// ====================================
// EXPORTS
// ====================================

export default {
  isIAPAvailable,
  initializeSubscription,
  getSubscriptionProducts,
  purchasePremium,
  restorePurchases,
  activatePremiumManual,
  deactivatePremiumManual,
  checkSubscription,
  getSubscriptionInfo,
  devTogglePremium,
};