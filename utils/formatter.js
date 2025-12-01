// Card number formatting utilities
// Add this to utils/cardHelpers.js or utils/formatters.js

/**
 * Formats card number with spaces every 4 characters as user types
 * Allows letters and numbers (for cards like Amazon)
 * @param {string} value - Raw input value
 * @returns {string} - Formatted card number (e.g., "1234 5678 9012 3456")
 */
export function formatCardNumberInput(value) {
  if (!value) return '';
  
  // Remove all spaces and non-alphanumeric characters
  const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  
  // Split into groups of 4 and join with spaces
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(' ');
}

/**
 * Strips formatting from card number for storage
 * @param {string} value - Formatted card number
 * @returns {string} - Raw card number without spaces
 */
export function stripCardNumberFormatting(value) {
  if (!value) return '';
  return value.replace(/\s/g, '').toUpperCase();
}

/**
 * Formats stored card number for display with spaces
 * @param {string} cardNumber - Raw card number from database
 * @returns {string} - Formatted card number with spaces
 */
export function formatCardNumberDisplay(cardNumber) {
  if (!cardNumber) return '';
  
  // Remove any existing spaces
  const cleaned = cardNumber.replace(/\s/g, '');
  
  // Split into groups of 4
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(' ');
}

/**
 * Gets masked card number for preview (shows last 4 digits)
 * @param {string} cardNumber - Raw card number
 * @returns {string} - Masked number (e.g., "•••• •••• •••• 3456")
 */
export function getMaskedCardNumber(cardNumber) {
  if (!cardNumber) return '';
  
  const cleaned = cardNumber.replace(/\s/g, '');
  const last4 = cleaned.slice(-4);
  
  // Calculate how many masked groups we need
  const totalLength = cleaned.length;
  const numGroups = Math.ceil(totalLength / 4);
  const maskedGroups = numGroups - 1;
  
  // Create masked groups
  const masked = Array(maskedGroups).fill('••••');
  masked.push(last4);
  
  return masked.join(' ');
}

/**
 * Validates card number format
 * @param {string} cardNumber - Card number to validate
 * @returns {object} - { isValid: boolean, error: string|null }
 */
export function validateCardNumber(cardNumber) {
  if (!cardNumber || cardNumber.trim() === '') {
    return { isValid: true, error: null }; // Optional field
  }
  
  const cleaned = cardNumber.replace(/\s/g, '');
  
  // Must be alphanumeric only
  if (!/^[A-Za-z0-9]+$/.test(cleaned)) {
    return { 
      isValid: false, 
      error: 'Card number can only contain letters and numbers' 
    };
  }
  
  // Reasonable length check (most cards are 13-19 digits)
  if (cleaned.length < 8) {
    return { 
      isValid: false, 
      error: 'Card number is too short' 
    };
  }
  
  if (cleaned.length > 30) {
    return { 
      isValid: false, 
      error: 'Card number is too long' 
    };
  }
  
  return { isValid: true, error: null };
}

// Example usage:
// 
// IN FORM INPUT (as user types):
// const [cardNumber, setCardNumber] = useState('');
// 
// <FormInput
//   value={cardNumber}
//   onChangeText={(text) => {
//     const formatted = formatCardNumberInput(text);
//     setCardNumber(formatted);
//   }}
// />
//
// WHEN SAVING TO DATABASE:
// const dataToSave = {
//   card_number: stripCardNumberFormatting(cardNumber)
// }
//
// WHEN LOADING FROM DATABASE:
// setCardNumber(formatCardNumberDisplay(card.card_number))
//
// FOR MASKED DISPLAY:
// <Text>{getMaskedCardNumber(card.card_number)}</Text>
//
// FOR BARCODE DISPLAY (needs raw number):
// <BarcodeDisplay cardNumber={stripCardNumberFormatting(card.card_number)} />