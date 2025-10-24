/**
 * Validation Utilities
 * Reusable validation functions for form fields
 */

import { VALIDATION } from './constants';

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {Object} { isValid, error }
 */
export const validateEmail = (email) => {
  if (!email || !email.trim()) {
    return { isValid: false, error: 'Email is required' };
  }

  if (!VALIDATION.email.regex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }

  return { isValid: true, error: null };
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {Object} { isValid, error }
 */
export const validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }

  if (password.length < VALIDATION.password.minLength) {
    return {
      isValid: false,
      error: `Password must be at least ${VALIDATION.password.minLength} characters`,
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validate store name
 * @param {string} storeName - Store name to validate
 * @returns {Object} { isValid, error }
 */
export const validateStoreName = (storeName) => {
  if (!storeName || !storeName.trim()) {
    return { isValid: false, error: 'Store name is required' };
  }

  if (storeName.trim().length < 2) {
    return {
      isValid: false,
      error: 'Store name must be at least 2 characters',
    };
  }

  if (storeName.trim().length > 100) {
    return {
      isValid: false,
      error: 'Store name must be less than 100 characters',
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validate gift card number
 * @param {string} cardNumber - Card number to validate
 * @returns {Object} { isValid, error }
 */
export const validateCardNumber = (cardNumber) => {
  if (!cardNumber || !cardNumber.trim()) {
    return { isValid: false, error: 'Card number is required' };
  }

  const trimmed = cardNumber.trim();

  if (trimmed.length < 4) {
    return {
      isValid: false,
      error: 'Card number must be at least 4 characters',
    };
  }

  if (trimmed.length > 50) {
    return {
      isValid: false,
      error: 'Card number must be less than 50 characters',
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validate balance amount
 * @param {string|number} balance - Balance to validate
 * @returns {Object} { isValid, error, value }
 */
export const validateBalance = (balance) => {
  if (!balance && balance !== 0) {
    return { isValid: false, error: 'Balance is required', value: null };
  }

  const numericBalance = typeof balance === 'string' 
    ? parseFloat(balance.replace(/[^0-9.]/g, ''))
    : balance;

  if (isNaN(numericBalance)) {
    return {
      isValid: false,
      error: 'Please enter a valid amount',
      value: null,
    };
  }

  if (numericBalance < 0) {
    return {
      isValid: false,
      error: 'Balance cannot be negative',
      value: null,
    };
  }

  if (numericBalance > 999999.99) {
    return {
      isValid: false,
      error: 'Balance must be less than $1,000,000',
      value: null,
    };
  }

  // Round to 2 decimal places
  const roundedBalance = Math.round(numericBalance * 100) / 100;

  return { isValid: true, error: null, value: roundedBalance };
};

/**
 * Validate expiration date
 * @param {Date|string} expirationDate - Date to validate
 * @returns {Object} { isValid, error }
 */
export const validateExpirationDate = (expirationDate) => {
  if (!expirationDate) {
    // Expiration date is optional
    return { isValid: true, error: null };
  }

  const date = new Date(expirationDate);

  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' };
  }

  // Check if date is in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (date < today) {
    return {
      isValid: false,
      error: 'Expiration date cannot be in the past',
    };
  }

  // Check if date is too far in the future (10 years)
  const tenYearsFromNow = new Date();
  tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);

  if (date > tenYearsFromNow) {
    return {
      isValid: false,
      error: 'Expiration date must be within 10 years',
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validate notes field
 * @param {string} notes - Notes to validate
 * @returns {Object} { isValid, error }
 */
export const validateNotes = (notes) => {
  if (!notes) {
    // Notes are optional
    return { isValid: true, error: null };
  }

  if (notes.length > 500) {
    return {
      isValid: false,
      error: 'Notes must be less than 500 characters',
    };
  }

  return { isValid: true, error: null };
};

/**
 * Validate gift card form (all fields)
 * @param {Object} formData - Form data object
 * @returns {Object} { isValid, errors }
 */
export const validateGiftCardForm = (formData) => {
  const errors = {};
  let isValid = true;

  // Store name validation
  const storeNameResult = validateStoreName(formData.storeName);
  if (!storeNameResult.isValid) {
    errors.storeName = storeNameResult.error;
    isValid = false;
  }

  // Card number validation
  const cardNumberResult = validateCardNumber(formData.cardNumber);
  if (!cardNumberResult.isValid) {
    errors.cardNumber = cardNumberResult.error;
    isValid = false;
  }

  // Balance validation
  const balanceResult = validateBalance(formData.balance);
  if (!balanceResult.isValid) {
    errors.balance = balanceResult.error;
    isValid = false;
  }

  // Expiration date validation (optional)
  if (formData.expirationDate) {
    const expirationResult = validateExpirationDate(formData.expirationDate);
    if (!expirationResult.isValid) {
      errors.expirationDate = expirationResult.error;
      isValid = false;
    }
  }

  // Notes validation (optional)
  if (formData.notes) {
    const notesResult = validateNotes(formData.notes);
    if (!notesResult.isValid) {
      errors.notes = notesResult.error;
      isValid = false;
    }
  }

  return { isValid, errors };
};

/**
 * Format card number for display (show last 4 digits)
 * @param {string} cardNumber - Full card number
 * @returns {string} Formatted card number
 */
export const formatCardNumberDisplay = (cardNumber) => {
  if (!cardNumber) return '';
  
  const cleaned = cardNumber.replace(/\s/g, '');
  
  if (cleaned.length <= 4) {
    return cleaned;
  }
  
  return `•••• ${cleaned.slice(-4)}`;
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted amount
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (!amount && amount !== 0) return '';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export default {
  validateEmail,
  validatePassword,
  validateStoreName,
  validateCardNumber,
  validateBalance,
  validateExpirationDate,
  validateNotes,
  validateGiftCardForm,
  formatCardNumberDisplay,
  formatCurrency,
};