import Constants from 'expo-constants';

// ====================================
// APP CONFIGURATION
// ====================================
export const APP_CONFIG = {
  name: 'Cardinal',
  version: '1.0.0',
  supportEmail: Constants.expoConfig?.extra?.supportEmail || 'support@usecardinal.app',
  environment: Constants.expoConfig?.extra?.appEnv || 'development',
};

// ====================================
// SUBSCRIPTION & LIMITS
// ====================================
export const SUBSCRIPTION = {
  maxFreeCards: parseInt(Constants.expoConfig?.extra?.maxFreeCards) || 5,
  premiumPrice: '$4.99',
  premiumPriceValue: 4.99,
  subscriptionType: 'monthly',
  
  // Product IDs from .env
  iosProductId: Constants.expoConfig?.extra?.iosPremiumProductId || 'com.cardinal.premium.monthly',
  androidProductId: Constants.expoConfig?.extra?.androidPremiumProductId || 'com.cardinal.premium.monthly',
};

// ====================================
// COLORS
// ====================================
export const COLORS = {
  // Primary Brand Colors
  primary: '#6366F1', // Indigo
  primaryDark: '#4F46E5',
  primaryLight: '#818CF8',
  
  // Secondary Colors
  secondary: '#EC4899', // Pink
  secondaryDark: '#DB2777',
  secondaryLight: '#F472B6',
  
  // Accent Colors
  accent: '#10B981', // Green (for success states)
  accentDark: '#059669',
  accentLight: '#34D399',
  
  // Neutral Colors
  background: '#FFFFFF',
  backgroundDark: '#0F172A', // Dark mode background
  surface: '#F8FAFC',
  surfaceDark: '#1E293B',
  
  // Text Colors
  text: '#1E293B',
  textSecondary: '#64748B',
  textLight: '#94A3B8',
  textDark: '#FFFFFF',
  
  // Status Colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  
  // UI Element Colors
  border: '#E2E8F0',
  borderDark: '#334155',
  divider: '#F1F5F9',
  
  // Special States
  disabled: '#CBD5E1',
  placeholder: '#94A3B8',
  overlay: 'rgba(0, 0, 0, 0.5)',
  
  // Card Status Colors
  expiringSoon: '#FEF3C7', // Light yellow background
  expiringSoonText: '#92400E', // Dark yellow text
  expired: '#FEE2E2', // Light red background
  expiredText: '#991B1B', // Dark red text
  active: '#D1FAE5', // Light green background
  activeText: '#065F46', // Dark green text
};

// ====================================
// TYPOGRAPHY
// ====================================
export const FONTS = {
  // Font Families (using system defaults for now)
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
  
  // Font Sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
  },
  
  // Font Weights
  weights: {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
  },
  
  // Line Heights
  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
};

// ====================================
// SPACING
// ====================================
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// ====================================
// BORDER RADIUS
// ====================================
export const RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
};

// ====================================
// SHADOWS
// ====================================
export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
};

// ====================================
// SCREEN DIMENSIONS
// ====================================
export const SCREEN = {
  padding: SPACING.md,
  paddingHorizontal: SPACING.md,
  paddingVertical: SPACING.lg,
};

// ====================================
// ANIMATION DURATIONS
// ====================================
export const ANIMATION = {
  fast: 150,
  normal: 300,
  slow: 500,
};

// ====================================
// NOTIFICATION SETTINGS
// ====================================
export const NOTIFICATIONS = {
  // Location-based notification settings
  locationProximityMeters: 804.672, // 0.5 miles in meters
  locationProximityMiles: 0.5,
  
  // Expiration reminder settings
  expirationWarningDays: 30, // Warn when card expires within 30 days
  expirationCriticalDays: 7, // Critical warning at 7 days
  
  // Notification frequency limits
  maxNotificationsPerDay: 5,
  minTimeBetweenNotifications: 3600000, // 1 hour in milliseconds
};

// ====================================
// GIFT CARD SETTINGS
// ====================================
export const GIFT_CARD = {
  // Image settings
  maxImageSizeMB: 5,
  maxImageSizeBytes: 5 * 1024 * 1024,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/heic'],
  imageCompressionQuality: 0.8,
  
  // Card number settings
  maxCardNumberLength: 50,
  maxNotesLength: 500,
  
  // Balance settings
  maxBalance: 999999.99,
  defaultCurrency: 'USD',
  
  // Validation
  minStoreNameLength: 2,
  maxStoreNameLength: 100,
};

// ====================================
// LOCATION SETTINGS
// ====================================
export const LOCATION = {
  // Geofencing radius
  geofenceRadiusMeters: 804.672, // 0.5 miles
  
  // Location accuracy
  desiredAccuracy: 100, // meters
  distanceFilter: 50, // meters (minimum distance before update)
  
  // Background location update frequency
  backgroundUpdateInterval: 300000, // 5 minutes in milliseconds
  
  // Location timeout
  timeout: 10000, // 10 seconds
};

// ====================================
// OCR SETTINGS
// ====================================
export const OCR = {
  enabled: true,
  provider: 'google-vision',
  maxRetries: 2,
  timeout: 15000, // 15 seconds
  
  // Confidence thresholds
  minConfidence: 0.7,
  
  // Fields to extract
  extractFields: ['store_name', 'card_number', 'balance', 'expiration'],
};

// ====================================
// VALIDATION RULES
// ====================================
export const VALIDATION = {
  email: {
    regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    minLength: 5,
    maxLength: 254,
  },
  password: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
    requireSpecialChar: false,
  },
  name: {
    minLength: 2,
    maxLength: 50,
  },
};

// ====================================
// API TIMEOUTS
// ====================================
export const TIMEOUTS = {
  default: 10000, // 10 seconds
  upload: 30000, // 30 seconds for image uploads
  ocr: 15000, // 15 seconds for OCR processing
};

// ====================================
// STORAGE KEYS
// ====================================
export const STORAGE_KEYS = {
  hasSeenOnboarding: '@cardinal:hasSeenOnboarding',
  userPreferences: '@cardinal:userPreferences',
  lastLocationUpdate: '@cardinal:lastLocationUpdate',
  notificationPermission: '@cardinal:notificationPermission',
  locationPermission: '@cardinal:locationPermission',
};

// ====================================
// ERROR MESSAGES
// ====================================
export const ERROR_MESSAGES = {
  // Network errors
  networkError: 'Unable to connect. Please check your internet connection.',
  timeout: 'Request timed out. Please try again.',
  
  // Auth errors
  invalidCredentials: 'Invalid email or password.',
  emailAlreadyExists: 'An account with this email already exists.',
  weakPassword: 'Password must be at least 8 characters.',
  invalidEmail: 'Please enter a valid email address.',
  
  // Gift card errors
  cardLimitReached: `You've reached the limit of ${SUBSCRIPTION.maxFreeCards} gift cards. Upgrade to Premium for unlimited cards!`,
  invalidCardData: 'Please fill in all required fields.',
  uploadFailed: 'Failed to upload image. Please try again.',
  
  // Location errors
  locationPermissionDenied: 'Location permission is required for store notifications.',
  locationUnavailable: 'Unable to get your location. Please try again.',
  
  // OCR errors
  ocrFailed: 'Unable to scan card. Please enter details manually.',
  
  // Generic errors
  somethingWentWrong: 'Something went wrong. Please try again.',
  notFound: 'Item not found.',
  unauthorized: 'You are not authorized to perform this action.',
};

// ====================================
// SUCCESS MESSAGES
// ====================================
export const SUCCESS_MESSAGES = {
  cardAdded: 'Gift card added successfully!',
  cardUpdated: 'Gift card updated successfully!',
  cardDeleted: 'Gift card deleted successfully!',
  profileUpdated: 'Profile updated successfully!',
  passwordReset: 'Password reset email sent. Check your inbox!',
  subscriptionActivated: 'Premium subscription activated!',
};

// ====================================
// ONBOARDING
// ====================================
export const ONBOARDING = {
  slides: [
    {
      id: 1,
      title: 'Never Forget Your Gift Cards',
      description: 'Upload all your gift cards in one place. No more digging through wallets or email.',
      icon: 'gift',
    },
    {
      id: 2,
      title: 'Get Smart Reminders',
      description: "We'll ping you when you're near a store where you have an unused gift card.",
      icon: 'bell',
    },
    {
      id: 3,
      title: 'Track & Save',
      description: 'Monitor balances, expiration dates, and never let money go to waste again.',
      icon: 'trending-up',
    },
  ],
};

// ====================================
// FEATURE FLAGS
// ====================================
export const FEATURES = {
  enableOCR: true,
  enableLocationNotifications: true,
  enableExpirationReminders: true,
  enableDarkMode: false, // Coming soon
  enableSocialLogin: false, // Coming soon
  enableReferrals: false, // Coming soon
  enableAds: true,
};

// ====================================
// AD SETTINGS
// ====================================
export const ADS = {
  enabled: FEATURES.enableAds,
  iosBannerId: Constants.expoConfig?.extra?.admobIosBannerId || 'ca-app-pub-3940256099942544/2934735716', // Test ID
  androidBannerId: Constants.expoConfig?.extra?.admobAndroidBannerId || 'ca-app-pub-3940256099942544/6300978111', // Test ID
  showOnFreeAccountsOnly: true,
  bannerPosition: 'bottom',
};

// ====================================
// NAVIGATION ROUTES
// ====================================
export const ROUTES = {
  // Auth Stack
  WELCOME: 'Welcome',
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  FORGOT_PASSWORD: 'ForgotPassword',
  
  // Main Stack
  DASHBOARD: 'Dashboard',
  ADD_CARD: 'AddCard',
  CARD_DETAILS: 'CardDetails',
  NOTIFICATIONS: 'Notifications',
  SETTINGS: 'Settings',
  PROFILE: 'Profile',
  SUBSCRIPTION: 'Subscription',
  SUPPORT: 'Support',
};

// ====================================
// DEVELOPMENT HELPERS
// ====================================
export const DEV = {
  isDevelopment: __DEV__,
  enableLogging: __DEV__,
  enableDebugBorders: false,
  skipOnboarding: false, // Set to true to skip onboarding during development
};