// Input validation functions

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {boolean} - True if valid email format
 */
export function isValidEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export function isValidPassword(password) {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  return { isValid: true, error: null };
}

/**
 * Validates card name (required field)
 * @param {string} name - Card name to validate
 * @returns {boolean} - True if valid
 */
export function isValidCardName(name) {
  if (!name || name.trim().length === 0) return false;
  return name.trim().length >= 2;
}

/**
 * Validates card balance
 * @param {string|number} balance - Balance to validate
 * @returns {boolean} - True if valid number
 */
export function isValidBalance(balance) {
  if (!balance && balance !== 0) return true; // Optional field
  const num = parseFloat(balance);
  return !isNaN(num) && num >= 0;
}

/**
 * Validates card number format (basic check)
 * @param {string} cardNumber - Card number to validate
 * @returns {boolean} - True if valid format
 */
export function isValidCardNumber(cardNumber) {
  if (!cardNumber) return true; // Optional field
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  // Check if it's numeric and reasonable length (8-19 digits)
  return /^\d{8,19}$/.test(cleaned);
}

/**
 * Validates PIN format
 * @param {string} pin - PIN to validate
 * @returns {boolean} - True if valid format
 */
export function isValidPin(pin) {
  if (!pin) return true; // Optional field
  // Must be 4-8 digits
  return /^\d{4,8}$/.test(pin);
}

/**
 * Validates barcode value
 * @param {string} barcode - Barcode value to validate
 * @returns {boolean} - True if valid
 */
export function isValidBarcode(barcode) {
  if (!barcode) return true; // Optional field
  // Basic check - must be alphanumeric and reasonable length
  return /^[A-Za-z0-9]{6,50}$/.test(barcode);
}

/**
 * Validates expiration date
 * @param {Date|string} date - Date to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export function isValidExpirationDate(date) {
  if (!date) {
    return { isValid: true, error: null }; // Optional field
  }

  const expirationDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (isNaN(expirationDate.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  // Allow dates in the past (for tracking expired cards)
  // But warn if it's more than 10 years in the future
  const tenYearsFromNow = new Date();
  tenYearsFromNow.setFullYear(tenYearsFromNow.getFullYear() + 10);

  if (expirationDate > tenYearsFromNow) {
    return { isValid: false, error: 'Expiration date too far in the future' };
  }

  return { isValid: true, error: null };
}

/**
 * Validates complete card data for submission
 * @param {object} cardData - Card data object
 * @returns {object} - { isValid: boolean, errors: object }
 */
export function validateCardData(cardData) {
  const errors = {};

  // Required field: name
  if (!isValidCardName(cardData.name)) {
    errors.name = 'Card name is required (minimum 2 characters)';
  }

  // Optional fields with validation
  if (cardData.balance && !isValidBalance(cardData.balance)) {
    errors.balance = 'Balance must be a valid number';
  }

  if (cardData.card_number && !isValidCardNumber(cardData.card_number)) {
    errors.card_number = 'Invalid card number format';
  }

  if (cardData.pin && !isValidPin(cardData.pin)) {
    errors.pin = 'PIN must be 4-8 digits';
  }

  if (cardData.barcode_value && !isValidBarcode(cardData.barcode_value)) {
    errors.barcode_value = 'Invalid barcode format';
  }

  if (cardData.expiration_date) {
    const dateValidation = isValidExpirationDate(cardData.expiration_date);
    if (!dateValidation.isValid) {
      errors.expiration_date = dateValidation.error;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Sanitizes card data before submission
 * @param {object} cardData - Raw card data
 * @returns {object} - Sanitized card data
 */
export function sanitizeCardData(cardData) {
  return {
    name: cardData.name?.trim() || '',
    brand: cardData.brand?.trim() || null,
    balance: cardData.balance ? parseFloat(cardData.balance) : null,
    card_number: cardData.card_number?.trim() || null,
    pin: cardData.pin?.trim() || null,
    barcode_type: cardData.barcode_type || null,
    barcode_value: cardData.barcode_value?.trim() || null,
    expiration_date: cardData.expiration_date || null,
    notes: cardData.notes?.trim() || null,
  };
}

/**
 * Checks if card is expired
 * @param {Date|string} expirationDate - Expiration date to check
 * @returns {boolean} - True if expired
 */
export function isCardExpired(expirationDate) {
  if (!expirationDate) return false;
  const expDate = new Date(expirationDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return expDate < today;
}

/**
 * Gets days until expiration
 * @param {Date|string} expirationDate - Expiration date
 * @returns {number|null} - Days until expiration (null if no date)
 */
export function getDaysUntilExpiration(expirationDate) {
  if (!expirationDate) return null;
  const expDate = new Date(expirationDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = expDate - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}