import Constants from 'expo-constants';

// Get Google Vision API key from env
const GOOGLE_VISION_API_KEY = Constants.expoConfig?.extra?.googleVisionApiKey;

/**
 * Extract text from image using Google Vision API
 * @param {string} imageUri - Local URI or base64 of image
 * @returns {Promise<{text: string, error: string|null}>}
 */
export const extractTextFromImage = async (imageUri) => {
  try {
    if (!GOOGLE_VISION_API_KEY) {
      throw new Error('Google Vision API key not configured');
    }

    // Convert image to base64
    const base64Image = await convertImageToBase64(imageUri);

    // Call Google Vision API
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'TEXT_DETECTION',
                  maxResults: 1,
                },
              ],
            },
          ],
        }),
      }
    );

    const result = await response.json();

    if (result.responses && result.responses[0]) {
      const detection = result.responses[0];
      
      if (detection.error) {
        throw new Error(detection.error.message);
      }

      if (detection.textAnnotations && detection.textAnnotations.length > 0) {
        const fullText = detection.textAnnotations[0].description;
        return { text: fullText, error: null };
      }
    }

    return { text: '', error: 'No text detected in image' };
  } catch (error) {
    console.error('OCR error:', error);
    return { text: '', error: error.message };
  }
};

/**
 * Convert image URI to base64
 * @param {string} imageUri - Local image URI
 * @returns {Promise<string>} Base64 encoded image
 */
const convertImageToBase64 = async (imageUri) => {
  try {
    const response = await fetch(imageUri);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(',')[1];
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Image conversion error:', error);
    throw new Error('Failed to convert image to base64');
  }
};

/**
 * Parse gift card information from OCR text
 * Attempts to extract: store name, card number, balance
 * @param {string} text - Raw OCR text
 * @returns {Object} Parsed card data
 */
export const parseGiftCardInfo = (text) => {
  const parsed = {
    storeName: '',
    cardNumber: '',
    balance: '',
  };

  if (!text) return parsed;

  // Clean up text
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);

  // Extract card number patterns
  // Look for sequences of numbers/letters grouped together
  const cardNumberPatterns = [
    /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, // 16 digits
    /\b\d{13,19}\b/g, // Long number sequences
    /\b[A-Z0-9]{8,20}\b/g, // Alphanumeric codes
  ];

  for (const pattern of cardNumberPatterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      parsed.cardNumber = matches[0].replace(/\s|-/g, '');
      break;
    }
  }

  // Extract balance
  // Look for currency amounts
  const balancePatterns = [
    /\$\s?(\d+\.?\d{0,2})/gi,
    /balance:?\s*\$?\s?(\d+\.?\d{0,2})/gi,
    /amount:?\s*\$?\s?(\d+\.?\d{0,2})/gi,
    /value:?\s*\$?\s?(\d+\.?\d{0,2})/gi,
  ];

  for (const pattern of balancePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const amount = parseFloat(match[1]);
      if (amount > 0 && amount < 10000) {
        parsed.balance = amount.toString();
        break;
      }
    }
  }

  // Extract store name
  // Take the first substantial line (likely the store name/brand)
  const substantialLines = lines.filter((line) => line.length > 3);
  if (substantialLines.length > 0) {
    // Prioritize lines that look like brand names (capitalized words)
    const brandLikeLine = substantialLines.find((line) => {
      return /^[A-Z][a-z]+(\s[A-Z][a-z]+)*$/g.test(line);
    });
    
    parsed.storeName = brandLikeLine || substantialLines[0];
  }

  return parsed;
};

/**
 * Scan gift card image and extract information
 * @param {string} imageUri - Local image URI
 * @returns {Promise<{data: Object, error: string|null}>}
 */
export const scanGiftCard = async (imageUri) => {
  try {
    // Extract text using OCR
    const { text, error: ocrError } = await extractTextFromImage(imageUri);

    if (ocrError) {
      return { data: null, error: ocrError };
    }

    if (!text) {
      return { 
        data: null, 
        error: 'No text detected. Try taking a clearer photo.' 
      };
    }

    // Parse gift card info
    const parsedData = parseGiftCardInfo(text);

    return { data: parsedData, error: null };
  } catch (error) {
    console.error('Scan gift card error:', error);
    return { data: null, error: error.message };
  }
};

export default {
  extractTextFromImage,
  parseGiftCardInfo,
  scanGiftCard,
};