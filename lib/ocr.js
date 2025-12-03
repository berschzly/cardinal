/**
 * Parse gift card text from ML Kit OCR results
 * Compatible with @react-native-ml-kit/text-recognition
 * 
 * Usage:
 * import TextRecognition from '@react-native-ml-kit/text-recognition';
 * const result = await TextRecognition.recognize(imagePath);
 * const parsed = parseGiftCardFromMLKit(result);
 */

/**
 * Parse ML Kit result object directly
 * @param {Object} mlKitResult - Result from TextRecognition.recognize()
 * @returns {Object} Parsed gift card data
 */
export function parseGiftCardFromMLKit(mlKitResult) {
  if (!mlKitResult || !mlKitResult.text) {
    return getEmptyResult();
  }
  
  // Extract all text from blocks
  const fullText = mlKitResult.text;
  const lines = mlKitResult.blocks
    .map(block => block.text.trim())
    .filter(Boolean);
  
  return parseGiftCardText(fullText, lines);
}

/**
 * Parse gift card text from OCR results
 * Enhanced version with better validation and context awareness
 * @param {string} ocrText - Full OCR text
 * @param {string[]} lines - Optional array of text lines
 * @returns {Object} Parsed gift card data
 */
export function parseGiftCardText(ocrText, lines = null) {
  if (!ocrText) return getEmptyResult();
  
  const text = ocrText.toUpperCase();
  const textLines = lines || text.split('\n').map(line => line.trim()).filter(Boolean);
  
  console.log('=== OCR PARSING ===');
  console.log('Raw text:', text);
  console.log('Lines:', textLines);
  
  const result = {
    cardNumber: extractCardNumber(text, textLines),
    balance: extractBalance(text),
    expirationDate: extractExpirationDate(text, textLines),
    brand: extractBrand(text, textLines),
    pin: extractPin(text),
    confidence: calculateConfidence(text, textLines),
  };
  
  console.log('Parsed result:', result);
  return result;
}

function getEmptyResult() {
  return {
    cardNumber: null,
    balance: null,
    expirationDate: null,
    brand: null,
    pin: null,
    confidence: 0,
  };
}

/**
 * Calculate confidence score based on what was found
 */
function calculateConfidence(text, lines) {
  let score = 0;
  
  // Check for gift card indicators
  const giftCardKeywords = ['GIFT', 'CARD', 'VALUE', 'BALANCE', 'REDEEM'];
  const hasKeywords = giftCardKeywords.some(keyword => text.includes(keyword));
  if (hasKeywords) score += 20;
  
  // Check for card number patterns
  if (text.match(/\d{13,19}/)) score += 30;
  
  // Check for dollar amounts
  if (text.match(/\$\s*\d+/)) score += 20;
  
  // Check for expiration date patterns
  if (text.match(/\d{1,2}[\/\-]\d{2,4}/)) score += 15;
  
  // Check for brand names
  if (lines.length > 0 && lines[0].length > 2) score += 15;
  
  return Math.min(score, 100);
}

/**
 * Extract card number with better validation
 * Only returns numbers that are likely actual card numbers
 */
function extractCardNumber(text, lines) {
  const cardNumberIndicators = [
    'CARD', 'NUMBER', 'ACCOUNT', '#', 'NUM', 'NO', 'NBR', 
    'GIFT', 'REDEMPTION', 'CODE', 'ID', 'CARD#', 'CARDNO'
  ];
  
  const excludeIndicators = [
    'CUSTOMER', 'SERVICE', 'PHONE', 'CALL', 'VISIT', 'WWW',
    'HTTP', 'TERMS', 'CONDITIONS', 'HELP', 'SUPPORT', 'BALANCE',
    'PRICE', 'COST', 'PURCHASE', 'INVOICE', 'RECEIPT', 'ORDER',
    'DATE', 'TIME', 'YEAR', 'MONTH', 'DAY', 'EXPIRES', 'VALID',
    'ZIP', 'POSTAL', 'CODE'
  ];

  // First pass: Look for card numbers with explicit labels
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevLine = i > 0 ? lines[i - 1] : '';
    const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
    const context = `${prevLine} ${line} ${nextLine}`;
    
    const hasIndicator = cardNumberIndicators.some(indicator => 
      context.includes(indicator)
    );
    
    const shouldExclude = excludeIndicators.some(indicator => 
      context.includes(indicator)
    );
    
    if (hasIndicator && !shouldExclude) {
      const cleaned = line.replace(/[\s-]/g, '');
      
      const patterns = [
        /\d{19}/,        // 19 digits (some gift cards)
        /\d{16}/,        // 16 digits (most common)
        /\d{15}/,        // 15 digits (Amex)
        /\d{13,14}/,     // 13-14 digits
      ];
      
      for (const pattern of patterns) {
        const match = cleaned.match(pattern);
        if (match && isValidCardNumber(match[0])) {
          console.log('Found card number (with indicator):', match[0]);
          return formatCardNumber(match[0]);
        }
      }
    }
  }
  
  // Second pass: Look for card-like numbers with context validation
  const cleaned = text.replace(/[\s-]/g, '');
  const allMatches = cleaned.match(/\d{13,19}/g) || [];
  
  console.log('Potential card numbers found:', allMatches.length);
  
  for (const match of allMatches) {
    const originalIndex = text.indexOf(match);
    if (originalIndex === -1) continue;
    
    const surroundingText = text.substring(
      Math.max(0, originalIndex - 50),
      Math.min(text.length, originalIndex + match.length + 50)
    );
    
    const hasGoodContext = cardNumberIndicators.some(indicator =>
      surroundingText.includes(indicator)
    );
    
    const hasBadContext = excludeIndicators.some(indicator =>
      surroundingText.includes(indicator)
    );
    
    if (hasGoodContext && !hasBadContext && isValidCardNumber(match)) {
      console.log('Found card number (with context):', match);
      return formatCardNumber(match);
    }
  }
  
  // Third pass: If exactly one 16-digit number exists, likely the card number
  const sixteenDigitMatches = cleaned.match(/\d{16}/g) || [];
  if (sixteenDigitMatches.length === 1 && isValidCardNumber(sixteenDigitMatches[0])) {
    console.log('Found single 16-digit number:', sixteenDigitMatches[0]);
    return formatCardNumber(sixteenDigitMatches[0]);
  }
  
  console.log('No valid card number found');
  return null;
}

/**
 * Validate if a number looks like a real card number
 */
function isValidCardNumber(number) {
  if (!number || number.length < 13 || number.length > 19) {
    return false;
  }
  
  // Reject all same digit (1111111111111111)
  if (/^(\d)\1+$/.test(number)) {
    console.log('Rejected: all same digits');
    return false;
  }
  
  // Reject sequential digits (123456789...)
  const digits = number.split('').map(d => parseInt(d));
  const isSequential = digits.every((digit, i, arr) => {
    if (i === 0) return true;
    return digit === arr[i - 1] + 1;
  });
  if (isSequential) {
    console.log('Rejected: sequential digits');
    return false;
  }
  
  // Reject alternating patterns (121212...)
  const isAlternating = digits.every((digit, i, arr) => {
    if (i < 2) return true;
    return digit === arr[i - 2];
  });
  if (isAlternating) {
    console.log('Rejected: alternating pattern');
    return false;
  }
  
  // For 16-digit numbers, use Luhn algorithm
  if (number.length === 16) {
    const isValid = luhnCheck(number);
    console.log('Luhn check result:', isValid);
    return isValid;
  }
  
  // For other lengths (gift cards), accept if passes basic checks
  console.log('Accepted: passed basic validation');
  return true;
}

/**
 * Luhn algorithm for credit card validation
 */
function luhnCheck(cardNumber) {
  let sum = 0;
  let isEven = false;
  
  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
}

/**
 * Extract balance/value with better validation
 */
function extractBalance(text) {
  const patterns = [
    // "BALANCE: $50.00" or "VALUE: $50"
    /(?:BALANCE|VALUE|AMOUNT|WORTH)[:\s]*\$?\s*(\d+\.?\d{0,2})/i,
    // "$50.00 BALANCE" or "$50 REMAINING"
    /\$\s*(\d+\.?\d{0,2})\s*(?:BALANCE|VALUE|REMAINING|USD|DOLLARS?)/i,
    // "50.00 USD" or "50 DOLLARS"
    /\b(\d+\.\d{2})\s*(?:USD|DOLLARS?)\b/i,
    // Just "$50" or "$50.00" (fallback)
    /\$\s*(\d{2,4}\.\d{2})/,
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      // Reasonable gift card range: $5 to $2000
      if (amount >= 5 && amount <= 2000) {
        console.log('Found balance:', amount);
        return amount.toFixed(2);
      }
    }
  }
  
  console.log('No balance found');
  return null;
}

/**
 * Extract expiration date with comprehensive detection
 */
function extractExpirationDate(text, lines) {
  console.log('=== EXPIRATION DATE EXTRACTION ===');
  
  const expirationKeywords = [
    'EXP', 'EXPIRES', 'EXPIRATION', 'EXPIRY', 'VALID', 'GOOD',
    'THRU', 'THROUGH', 'UNTIL', 'TILL', 'USE BY', 'BY'
  ];
  
  // First pass: Look for dates with explicit keywords
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevLine = i > 0 ? lines[i - 1] : '';
    const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
    const context = `${prevLine} ${line} ${nextLine}`;
    
    const hasExpirationKeyword = expirationKeywords.some(keyword =>
      context.includes(keyword)
    );
    
    if (hasExpirationKeyword) {
      console.log('Found expiration keyword near:', line);
      
      // Pattern 1: "EXP 12/25" or "EXPIRES: 12/2025"
      let match = context.match(/(?:EXP(?:IRES?)?|VALID|GOOD)[:\s]*(\d{1,2})[\/\-](\d{2,4})/i);
      if (match) {
        const date = parseDate(match[1], match[2]);
        if (date) return date;
      }
      
      // Pattern 2: "VALID THRU 12/25"
      match = context.match(/(?:VALID|GOOD)\s+(?:THRU|THROUGH|UNTIL)[:\s]*(\d{1,2})[\/\-](\d{2,4})/i);
      if (match) {
        const date = parseDate(match[1], match[2]);
        if (date) return date;
      }
      
      // Pattern 3: Any MM/YY or MM/YYYY in context
      match = context.match(/\b(0?[1-9]|1[0-2])[\/\-](\d{2,4})\b/);
      if (match) {
        const date = parseDate(match[1], match[2]);
        if (date) return date;
      }
      
      // Pattern 4: "EXPIRES DECEMBER 2025"
      match = context.match(/(?:EXP(?:IRES?)?|VALID)[:\s]*(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[A-Z]*[,\s]*(\d{4})/i);
      if (match) {
        const monthNames = {
          'JAN': 1, 'FEB': 2, 'MAR': 3, 'APR': 4, 'MAY': 5, 'JUN': 6,
          'JUL': 7, 'AUG': 8, 'SEP': 9, 'OCT': 10, 'NOV': 11, 'DEC': 12,
        };
        const month = monthNames[match[1].substring(0, 3).toUpperCase()];
        if (month) {
          const date = parseDate(month.toString(), match[2]);
          if (date) return date;
        }
      }
    }
  }
  
  // Second pass: Look for future dates (likely expiration)
  const datePatterns = [
    /\b(0?[1-9]|1[0-2])[\/\-](2[5-9]|[3-4][0-9])\b/,  // MM/YY (2025-2049)
    /\b(0?[1-9]|1[0-2])[\/\-](202[5-9]|20[3-4][0-9])\b/, // MM/YYYY
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      const date = parseDate(match[1], match[2]);
      if (date) {
        const dateObj = new Date(date);
        const now = new Date();
        if (dateObj > now) {
          console.log('Found future date:', date);
          return date;
        }
      }
    }
  }
  
  console.log('No expiration date found');
  return null;
}

/**
 * Parse and validate dates
 */
function parseDate(monthStr, yearStr) {
  let month = parseInt(monthStr);
  let year = parseInt(yearStr);
  
  // Convert 2-digit year to 4-digit
  if (year < 100) {
    year += year < 50 ? 2000 : 1900;
  }
  
  // Validate
  if (month < 1 || month > 12 || year < 2024 || year > 2040) {
    return null;
  }
  
  // Return as YYYY-MM-DD (last day of month)
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
}

/**
 * Extract PIN
 */
function extractPin(text) {
  const patterns = [
    /PIN[:\s#]*(\d{4,8})/i,
    /ACCESS[:\s]*(?:CODE|NUMBER)[:\s#]*(\d{4,8})/i,
    /SECURITY[:\s]*CODE[:\s#]*(\d{4,8})/i,
    /CVV[:\s]*(\d{3,4})/i,
    /CODE[:\s#]*(\d{4,8})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      console.log('Found PIN:', match[1]);
      return match[1];
    }
  }
  
  return null;
}

/**
 * Extract brand name
 */
function extractBrand(text, lines) {
  const brands = {
    'Target': ['TARGET', 'BULLSEYE'],
    'Walmart': ['WALMART', 'WAL-MART', 'WAL MART'],
    'Amazon': ['AMAZON', 'AMZN', 'AMAZON.COM'],
    'Starbucks': ['STARBUCKS', 'SBUX'],
    'Visa': ['VISA'],
    'Mastercard': ['MASTERCARD', 'MASTER CARD'],
    'American Express': ['AMERICAN EXPRESS', 'AMEX', 'AM EX'],
    'Best Buy': ['BEST BUY', 'BESTBUY'],
    'Home Depot': ['HOME DEPOT', 'HOMEDEPOT', 'THE HOME DEPOT'],
    'Lowes': ['LOWES', 'LOWE\'S', 'LOWE S'],
    'Apple': ['APPLE', 'ITUNES', 'APP STORE', 'APPLE STORE'],
    'Google Play': ['GOOGLE PLAY', 'PLAY STORE', 'GOOGLEPLAY'],
    'Nike': ['NIKE'],
    'Sephora': ['SEPHORA'],
    'Ulta': ['ULTA'],
    'CVS': ['CVS', 'CVS PHARMACY'],
    'Walgreens': ['WALGREENS'],
    'Dunkin': ['DUNKIN', 'DUNKIN DONUTS'],
    'Subway': ['SUBWAY'],
    'Chipotle': ['CHIPOTLE'],
    'Panera': ['PANERA', 'PANERA BREAD'],
    'Olive Garden': ['OLIVE GARDEN'],
    'GameStop': ['GAMESTOP', 'GAME STOP'],
    'Steam': ['STEAM'],
    'Xbox': ['XBOX', 'MICROSOFT'],
    'PlayStation': ['PLAYSTATION', 'SONY', 'PSN'],
    'Roblox': ['ROBLOX'],
    'Netflix': ['NETFLIX'],
    'Spotify': ['SPOTIFY'],
    'Uber': ['UBER', 'UBER EATS'],
    'DoorDash': ['DOORDASH', 'DOOR DASH'],
    'Grubhub': ['GRUBHUB', 'GRUB HUB'],
  };

  // Check first few lines (brand usually at top)
  const topLines = lines.slice(0, 5).join(' ');
  
  for (const [brandName, variations] of Object.entries(brands)) {
    for (const variation of variations) {
      if (topLines.includes(variation) || text.includes(variation)) {
        console.log('Found brand:', brandName);
        return brandName;
      }
    }
  }
  
  // Fallback: Use first substantial line as brand
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length > 2 && firstLine.length < 25) {
      const commonWords = ['GIFT', 'CARD', 'VALUE', 'BALANCE', 'THE', 'FOR', 'A'];
      if (!commonWords.includes(firstLine)) {
        const formatted = firstLine.split(' ')
          .map(word => word.charAt(0) + word.slice(1).toLowerCase())
          .join(' ');
        console.log('Using first line as brand:', formatted);
        return formatted;
      }
    }
  }
  
  return null;
}

/**
 * Format card number with spaces
 */
export function formatCardNumber(number) {
  if (!number) return '';
  const cleaned = number.replace(/\D/g, '');
  
  // Amex format: 4-6-5
  if (cleaned.length === 15) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 10)} ${cleaned.slice(10)}`;
  }
  
  // Standard format: 4-4-4-4 (or 4-4-4-4-N)
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
}

// Export for testing
export const testHelpers = {
  isValidCardNumber,
  luhnCheck,
  parseDate,
  calculateConfidence,
};