import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from './constants';

// ====================================
// HELPER FUNCTIONS
// ====================================

/**
 * Check if user has seen onboarding
 * @returns {Promise<boolean>}
 */
export const hasSeenOnboarding = async () => {
  try {
    const value = await AsyncStorage.getItem(STORAGE_KEYS.hasSeenOnboarding);
    return value === 'true';
  } catch (error) {
    console.error('Error checking onboarding status:', error);
    return false;
  }
};

/**
 * Mark onboarding as complete
 * @returns {Promise<void>}
 */
export const setOnboardingComplete = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.hasSeenOnboarding, 'true');
  } catch (error) {
    console.error('Error setting onboarding status:', error);
  }
};

/**
 * Reset onboarding (for testing)
 * @returns {Promise<void>}
 */
export const resetOnboarding = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.hasSeenOnboarding);
  } catch (error) {
    console.error('Error resetting onboarding:', error);
  }
};

/**
 * Format currency
 * @param {number} amount
 * @param {string} currency
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (!amount && amount !== 0) return 'No balance';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

/**
 * Format date
 * @param {string} dateString
 * @returns {string}
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'No date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Calculate days until expiration
 * @param {string} expirationDate
 * @returns {number}
 */
export const daysUntilExpiration = (expirationDate) => {
  if (!expirationDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);
  
  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Check if card is expiring soon
 * @param {string} expirationDate
 * @param {number} daysThreshold
 * @returns {boolean}
 */
export const isCardExpiringSoon = (expirationDate, daysThreshold = 30) => {
  if (!expirationDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);

  // Check if card is already expired
  if (expDate < today) return false;

  // Calculate days until expiration
  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays <= daysThreshold && diffDays >= 0;
};

/**
 * Check if card is expired
 * @param {string} expirationDate - YYYY-MM-DD format
 * @returns {boolean}
 */
export const isCardExpired = (expirationDate) => {
  if (!expirationDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expDate = new Date(expirationDate);
  expDate.setHours(0, 0, 0, 0);

  return expDate < today;
};

/**
 * Get expiration status
 * @param {string} expirationDate - YYYY-MM-DD format
 * @returns {object} {status: 'expired'|'critical'|'expiring'|'valid', days: number, message: string}
 */
export const getExpirationStatus = (expirationDate) => {
  if (!expirationDate) {
    return { status: 'valid', days: null, message: 'No expiration date' };
  }

  const days = daysUntilExpiration(expirationDate);

  if (days === null) {
    return { status: 'valid', days: null, message: 'No expiration date' };
  }

  if (days < 0) {
    return {
      status: 'expired',
      days: Math.abs(days),
      message: `Expired ${Math.abs(days)} days ago`,
    };
  }

  if (days === 0) {
    return {
      status: 'critical',
      days: 0,
      message: 'Expires today!',
    };
  }

  if (days <= 7) {
    return {
      status: 'critical',
      days,
      message: `Expires in ${days} ${days === 1 ? 'day' : 'days'}`,
    };
  }

  if (days <= 30) {
    return {
      status: 'expiring',
      days,
      message: `Expires in ${days} days`,
    };
  }

  return {
    status: 'valid',
    days,
    message: `Expires in ${days} days`,
  };
};

/**
 * Validate email
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {object}
 */
export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const isValid = 
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber;

  return {
    isValid,
    length: password.length >= minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumber,
    hasSpecialChar,
  };
};

export default {
  hasSeenOnboarding,
  setOnboardingComplete,
  resetOnboarding,
  formatCurrency,
  formatDate,
  daysUntilExpiration,
  isCardExpiringSoon,
  isCardExpired,
  getExpirationStatus,
  isValidEmail,
  validatePasswordStrength,
};