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
  const expDate = new Date(expirationDate);
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
  const days = daysUntilExpiration(expirationDate);
  return days !== null && days >= 0 && days <= daysThreshold;
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
  isValidEmail,
  validatePasswordStrength,
};