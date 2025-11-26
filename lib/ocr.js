/**
 * Parse gift card text from OCR results
 * Enhanced version with better validation and context awareness
 */
export function parseGiftCardText(ocrText) {
  if (!ocrText) return getEmptyResult();
  
  const text = ocrText.toUpperCase();
  const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
  
  console.log('=== OCR PARSING ===');
  console.log('Raw text:', text);
  console.log('Lines:', lines);
  
  const result = {
    cardNumber: extractCardNumber(text, lines),
    balance: extractBalance(text),
    expirationDate: extractExpirationDate(text, lines),
    brand: extractBrand(text, lines),
    pin: extractPin(text),
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
  };
}

/**
 * Extract card number with better validation
 * Only returns numbers that are likely actual card numbers
 */
function extractCardNumber(text, lines) {
  // Words that indicate a card number is nearby
  const cardNumberIndicators = [
    'CARD', 'NUMBER', 'ACCOUNT', '#', 'NUM', 'NO', 'NBR', 
    'GIFT', 'REDEMPTION', 'CODE', 'ID'
  ];
  
  // Words that indicate this is NOT a card number
  const excludeIndicators = [
    'CUSTOMER', 'SERVICE', 'PHONE', 'CALL', 'VISIT', 'WWW',
    'HTTP', 'TERMS', 'CONDITIONS', 'HELP', 'SUPPORT', 'BALANCE',
    'PRICE', 'COST', 'PURCHASE', 'INVOICE', 'RECEIPT', 'ORDER',
    'DATE', 'TIME', 'YEAR', 'MONTH', 'DAY', 'EXPIRES', 'VALID'
  ];

  // First, try to find card numbers with explicit labels
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevLine = i > 0 ? lines[i - 1] : '';
    const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
    const context = `${prevLine} ${line} ${nextLine}`;
    
    // Check if this line or surrounding lines have card number indicators
    const hasIndicator = cardNumberIndicators.some(indicator => 
      context.includes(indicator)
    );
    
    // Check if this area should be excluded
    const shouldExclude = excludeIndicators.some(indicator => 
      context.includes(indicator)
    );
    
    if (hasIndicator && !shouldExclude) {
      // Look for numbers in this line
      const cleaned = line.replace(/[\s-]/g, '');
      
      // Try different card lengths
      const patterns = [
        /\b\d{16}\b/,     // 16 digits (most common)
        /\b\d{15}\b/,     // 15 digits (Amex)
        /\b\d{19}\b/,     // 19 digits (some gift cards)
        /\b\d{13,14}\b/,  // 13-14 digits (Visa, etc.)
      ];
      
      for (const pattern of patterns) {
        const match = cleaned.match(pattern);
        if (match && isValidCardNumber(match[0])) {
          return formatCardNumber(match[0]);
        }
      }
    }
  }
  
  // Second pass: look for card-like numbers anywhere, but be strict
  const cleaned = text.replace(/[\s-]/g, '');
  
  // Find all potential card numbers (13-19 digits)
  const allMatches = cleaned.match(/\d{13,19}/g) || [];
  
  for (const match of allMatches) {
    // Check if this number appears in a good context
    const numberPosition = text.indexOf(match);
    const surroundingText = text.substring(
      Math.max(0, numberPosition - 50),
      Math.min(text.length, numberPosition + match.length + 50)
    );
    
    const hasGoodContext = cardNumberIndicators.some(indicator =>
      surroundingText.includes(indicator)
    );
    
    const hasBadContext = excludeIndicators.some(indicator =>
      surroundingText.includes(indicator)
    );
    
    if (hasGoodContext && !hasBadContext && isValidCardNumber(match)) {
      return formatCardNumber(match);
    }
  }
  
  // Last resort: if we found exactly one 16-digit number, use it
  const sixteenDigitMatches = cleaned.match(/\d{16}/g) || [];
  if (sixteenDigitMatches.length === 1 && isValidCardNumber(sixteenDigitMatches[0])) {
    return formatCardNumber(sixteenDigitMatches[0]);
  }
  
  return null;
}

/**
 * Validate if a number looks like a real card number
 * Uses Luhn algorithm for credit cards, and pattern checks for gift cards
 */
function isValidCardNumber(number) {
  if (!number || number.length < 13 || number.length > 19) {
    return false;
  }
  
  // Check for obviously fake patterns
  // All same digit
  if (/^(\d)\1+$/.test(number)) {
    return false;
  }
  
  // Sequential digits (123456...)
  const isSequential = number.split('').every((digit, i, arr) => {
    if (i === 0) return true;
    return parseInt(digit) === parseInt(arr[i - 1]) + 1;
  });
  if (isSequential) {
    return false;
  }
  
  // For 16-digit numbers, try Luhn algorithm (credit card validation)
  if (number.length === 16) {
    return luhnCheck(number);
  }
  
  // For gift cards (13-19 digits), we're more lenient
  // Just check it's not obviously fake
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
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      // Reasonable gift card range: $5 to $2000
      // Most gift cards are $10-$500
      if (amount >= 5 && amount <= 2000) {
        return amount.toFixed(2);
      }
    }
  }
  
  return null;
}

/**
 * Extract expiration date with much better detection
 */
function extractExpirationDate(text, lines) {
  console.log('=== EXPIRATION DATE EXTRACTION ===');
  
  // Keywords that indicate expiration info is nearby
  const expirationKeywords = [
    'EXP', 'EXPIRES', 'EXPIRATION', 'EXPIRY', 'VALID', 'GOOD',
    'THRU', 'THROUGH', 'UNTIL', 'TILL', 'USE BY'
  ];
  
  // First pass: Look for dates near expiration keywords
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const prevLine = i > 0 ? lines[i - 1] : '';
    const nextLine = i < lines.length - 1 ? lines[i + 1] : '';
    const context = `${prevLine} ${line} ${nextLine}`;
    
    console.log(`Checking line ${i}: "${line}"`);
    console.log(`Context: "${context}"`);
    
    // Check if context has expiration keywords
    const hasExpirationKeyword = expirationKeywords.some(keyword =>
      context.includes(keyword)
    );
    
    if (hasExpirationKeyword) {
      console.log('Found expiration keyword in context');
      
      // Pattern 1: "EXP 12/25" or "EXPIRES: 12/2025"
      let match = context.match(/(?:EXP(?:IRES?)?|VALID|GOOD)[:\s]*(\d{1,2})[\/\-](\d{2,4})/i);
      if (match) {
        console.log('Match pattern 1:', match[0]);
        const date = parseDate(match[1], match[2]);
        if (date) return date;
      }
      
      // Pattern 2: "VALID THRU 12/25"
      match = context.match(/(?:VALID|GOOD)\s+(?:THRU|THROUGH|UNTIL)[:\s]*(\d{1,2})[\/\-](\d{2,4})/i);
      if (match) {
        console.log('Match pattern 2:', match[0]);
        const date = parseDate(match[1], match[2]);
        if (date) return date;
      }
      
      // Pattern 3: Just look for MM/YY or MM/YYYY in context
      match = context.match(/\b(0?[1-9]|1[0-2])[\/\-](\d{2,4})\b/);
      if (match) {
        console.log('Match pattern 3:', match[0]);
        const date = parseDate(match[1], match[2]);
        if (date) return date;
      }
      
      // Pattern 4: "EXPIRES DECEMBER 2025"
      match = context.match(/(?:EXP(?:IRES?)?|VALID)[:\s]*(JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC|JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)[,\s]*(\d{4})/i);
      if (match) {
        console.log('Match pattern 4:', match[0]);
        const monthNames = {
          'JAN': 1, 'JANUARY': 1,
          'FEB': 2, 'FEBRUARY': 2,
          'MAR': 3, 'MARCH': 3,
          'APR': 4, 'APRIL': 4,
          'MAY': 5,
          'JUN': 6, 'JUNE': 6,
          'JUL': 7, 'JULY': 7,
          'AUG': 8, 'AUGUST': 8,
          'SEP': 9, 'SEPTEMBER': 9,
          'OCT': 10, 'OCTOBER': 10,
          'NOV': 11, 'NOVEMBER': 11,
          'DEC': 12, 'DECEMBER': 12,
        };
        const month = monthNames[match[1].toUpperCase()];
        const date = parseDate(month.toString(), match[2]);
        if (date) return date;
      }
    }
  }
  
  // Second pass: Look for any date-like patterns that could be expiration
  // But only if they're reasonable (2024-2040)
  const datePatterns = [
    /\b(0?[1-9]|1[0-2])[\/\-](2[0-9]|[2-4][0-9])\b/,  // MM/YY format
    /\b(0?[1-9]|1[0-2])[\/\-](20[2-4][0-9])\b/,       // MM/YYYY format
  ];
  
  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      console.log('Found date pattern (no keyword):', match[0]);
      const date = parseDate(match[1], match[2]);
      if (date) {
        // Only return if date is in reasonable future (not past)
        const dateObj = new Date(date);
        const now = new Date();
        if (dateObj > now) {
          console.log('Date is in future, using it');
          return date;
        }
      }
    }
  }
  
  console.log('No expiration date found');
  return null;
}

/**
 * Helper to parse and validate dates
 */
function parseDate(monthStr, yearStr) {
  let month = parseInt(monthStr);
  let year = parseInt(yearStr);
  
  console.log(`Parsing date: month=${month}, year=${year}`);
  
  // Convert 2-digit year to 4-digit
  if (year < 100) {
    if (year < 50) {
      year += 2000;
    } else {
      year += 1900;
    }
  }
  
  console.log(`After conversion: month=${month}, year=${year}`);
  
  // Validate
  if (month < 1 || month > 12) {
    console.log('Invalid month');
    return null;
  }
  
  if (year < 2024 || year > 2040) {
    console.log('Invalid year (out of range 2024-2040)');
    return null;
  }
  
  // Return as YYYY-MM-DD format (last day of month)
  const lastDay = new Date(year, month, 0).getDate();
  const result = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  console.log('Parsed date result:', result);
  return result;
}

/**
 * Extract PIN
 */
function extractPin(text) {
  const patterns = [
    // "PIN: 1234" or "PIN #1234"
    /PIN[:\s#]*(\d{4,8})/i,
    // "ACCESS CODE: 1234"
    /ACCESS[:\s]*(?:CODE|NUMBER)[:\s#]*(\d{4,8})/i,
    // "SECURITY CODE: 1234"
    /SECURITY[:\s]*CODE[:\s#]*(\d{4,8})/i,
    // "CVV: 123" (for some gift cards)
    /CVV[:\s]*(\d{3,4})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
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
    'Mastercard': ['MASTERCARD', 'MASTER CARD', 'MC'],
    'American Express': ['AMERICAN EXPRESS', 'AMEX', 'AM EX'],
    'Best Buy': ['BEST BUY', 'BESTBUY'],
    'Home Depot': ['HOME DEPOT', 'HOMEDEPOT', 'THE HOME DEPOT'],
    'Lowes': ['LOWES', 'LOWE\'S', 'LOWE S'],
    'Apple': ['APPLE', 'ITUNES', 'APP STORE', 'APPLE STORE'],
    'Google Play': ['GOOGLE PLAY', 'PLAY STORE', 'GOOGLE'],
    'Nike': ['NIKE'],
    'Sephora': ['SEPHORA'],
    'Ulta': ['ULTA'],
    'CVS': ['CVS', 'CVS PHARMACY'],
    'Walgreens': ['WALGREENS'],
    'Dunkin': ['DUNKIN', 'DUNKIN DONUTS', 'DUNKIN\''],
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
        return brandName;
      }
    }
  }
  
  // If no match found, try to find the most prominent text in first line
  if (lines.length > 0) {
    const firstLine = lines[0];
    if (firstLine.length > 2 && firstLine.length < 25) {
      const commonWords = ['GIFT', 'CARD', 'VALUE', 'BALANCE', 'THE', 'FOR'];
      if (!commonWords.includes(firstLine)) {
        return firstLine.split(' ')
          .map(word => word.charAt(0) + word.slice(1).toLowerCase())
          .join(' ');
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
  
  // Standard format: 4-4-4-4
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(' ') : cleaned;
}