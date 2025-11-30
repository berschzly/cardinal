// Input validation functions

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export function isValidEmail(email) {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true, error: null };
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
  if (password.length > 72) {
    return { isValid: false, error: 'Password must be less than 72 characters' };
  }
  return { isValid: true, error: null };
}

/**
 * Validates card name (required field)
 * @param {string} name - Card name to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export function isValidCardName(name) {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: 'Card name is required' };
  }
  if (name.trim().length < 2) {
    return { isValid: false, error: 'Card name must be at least 2 characters' };
  }
  if (name.trim().length > 100) {
    return { isValid: false, error: 'Card name must be less than 100 characters' };
  }
  return { isValid: true, error: null };
}

/**
 * Validates card brand
 * @param {string} brand - Brand name to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export function isValidBrand(brand) {
  if (!brand) {
    return { isValid: true, error: null }; // Optional field
  }
  if (brand.trim().length > 50) {
    return { isValid: false, error: 'Brand name must be less than 50 characters' };
  }
  return { isValid: true, error: null };
}

/**
 * Validates card balance
 * @param {string|number} balance - Balance to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export function isValidBalance(balance) {
  if (!balance && balance !== 0 && balance !== '0') {
    return { isValid: true, error: null }; // Optional field
  }
  
  const num = parseFloat(balance);
  
  if (isNaN(num)) {
    return { isValid: false, error: 'Balance must be a valid number' };
  }
  if (num < 0) {
    return { isValid: false, error: 'Balance cannot be negative' };
  }
  if (num > 99999999.99) {
    return { isValid: false, error: 'Balance is too large' };
  }
  
  // Check for max 2 decimal places
  const decimalPlaces = (balance.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { isValid: false, error: 'Balance can only have 2 decimal places' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validates card number format
 * @param {string} cardNumber - Card number to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export function isValidCardNumber(cardNumber) {
  if (!cardNumber || cardNumber.trim().length === 0) {
    return { isValid: true, error: null }; // Optional field
  }
  
  // Remove spaces and dashes for validation
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  
  if (cleaned.length === 0) {
    return { isValid: true, error: null };
  }
  
  // Allow alphanumeric for flexibility (some cards have letters)
  if (!/^[A-Za-z0-9]+$/.test(cleaned)) {
    return { isValid: false, error: 'Card number can only contain letters and numbers' };
  }
  
  if (cleaned.length < 4) {
    return { isValid: false, error: 'Card number must be at least 4 characters' };
  }
  
  if (cleaned.length > 30) {
    return { isValid: false, error: 'Card number is too long' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validates PIN format
 * @param {string} pin - PIN to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export function isValidPin(pin) {
  if (!pin || pin.trim().length === 0) {
    return { isValid: true, error: null }; // Optional field
  }
  
  if (!/^\d+$/.test(pin)) {
    return { isValid: false, error: 'PIN must contain only numbers' };
  }
  
  if (pin.length < 4) {
    return { isValid: false, error: 'PIN must be at least 4 digits' };
  }
  
  if (pin.length > 8) {
    return { isValid: false, error: 'PIN must be 8 digits or less' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validates notes field
 * @param {string} notes - Notes to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
export function isValidNotes(notes) {
  if (!notes) {
    return { isValid: true, error: null }; // Optional field
  }
  
  if (notes.length > 1000) {
    return { isValid: false, error: 'Notes must be less than 1000 characters' };
  }
  
  return { isValid: true, error: null };
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

  if (isNaN(expirationDate.getTime())) {
    return { isValid: false, error: 'Invalid date format' };
  }

  // Allow dates in the past (for tracking expired cards)
  // But warn if it's more than 20 years in the future
  const twentyYearsFromNow = new Date();
  twentyYearsFromNow.setFullYear(twentyYearsFromNow.getFullYear() + 20);

  if (expirationDate > twentyYearsFromNow) {
    return { isValid: false, error: 'Expiration date is too far in the future' };
  }
  
  // Warn if more than 50 years in the past
  const fiftyYearsAgo = new Date();
  fiftyYearsAgo.setFullYear(fiftyYearsAgo.getFullYear() - 50);
  
  if (expirationDate < fiftyYearsAgo) {
    return { isValid: false, error: 'Expiration date is too far in the past' };
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
  const nameValidation = isValidCardName(cardData.name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error;
  }

  // Optional fields with validation
  const brandValidation = isValidBrand(cardData.brand);
  if (!brandValidation.isValid) {
    errors.brand = brandValidation.error;
  }

  const balanceValidation = isValidBalance(cardData.balance);
  if (!balanceValidation.isValid) {
    errors.balance = balanceValidation.error;
  }

  const cardNumberValidation = isValidCardNumber(cardData.card_number);
  if (!cardNumberValidation.isValid) {
    errors.card_number = cardNumberValidation.error;
  }

  const pinValidation = isValidPin(cardData.pin);
  if (!pinValidation.isValid) {
    errors.pin = pinValidation.error;
  }

  const notesValidation = isValidNotes(cardData.notes);
  if (!notesValidation.isValid) {
    errors.notes = notesValidation.error;
  }

  const dateValidation = isValidExpirationDate(cardData.expiration_date);
  if (!dateValidation.isValid) {
    errors.expiration_date = dateValidation.error;
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
  const sanitized = {
    name: cardData.name?.trim() || '',
    brand: cardData.brand?.trim() || null,
    card_number: cardData.card_number?.trim() || null,
    pin: cardData.pin?.trim() || null,
    notes: cardData.notes?.trim() || null,
    expiration_date: cardData.expiration_date || null,
  };

  // Handle balance - only include if it's a valid number
  if (cardData.balance !== undefined && cardData.balance !== null && cardData.balance !== '') {
    const balanceNum = parseFloat(cardData.balance);
    if (!isNaN(balanceNum)) {
      sanitized.balance = balanceNum;
    }
  }

  return sanitized;
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

/**
 * Format validation errors for display
 * @param {object} errors - Errors object from validateCardData
 * @returns {string} - Formatted error message
 */
export function formatValidationErrors(errors) {
  if (!errors || Object.keys(errors).length === 0) {
    return '';
  }
  
  const errorMessages = Object.values(errors);
  
  if (errorMessages.length === 1) {
    return errorMessages[0];
  }
  
  return errorMessages.map((msg, idx) => `${idx + 1}. ${msg}`).join('\n');
}