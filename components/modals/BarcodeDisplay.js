import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import Colors from '../../constants/Colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PADDING = 43;
const MAX_BARCODE_WIDTH = SCREEN_WIDTH - (PADDING * 2);

export default function BarcodeDisplay({ card }) {
  // Strip any spaces from card number for barcode generation
  const rawValue = card?.card_number?.replace(/\s/g, '') || '';
  
  console.log('🔍 BarcodeDisplay Debug:');
  console.log('  Original card_number:', card?.card_number);
  console.log('  Raw value (stripped):', rawValue);
  console.log('  Length:', rawValue.length);
  console.log('  Is numeric:', /^\d+$/.test(rawValue));
  console.log('  Is alphanumeric:', /^[A-Za-z0-9]+$/.test(rawValue));
  
  if (!rawValue) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>No card number</Text>
          <Text style={styles.errorSubtext}>
            Add a card number to generate a barcode
          </Text>
        </View>
      </View>
    );
  }

  // Calculate dynamic font size
  const calculateFontSize = () => {
    const availableWidth = MAX_BARCODE_WIDTH - 32;
    const charCount = rawValue.length;
    const baseSize = availableWidth / (charCount * 0.6);
    return Math.min(Math.max(baseSize, 10), 16);
  };

  const dynamicFontSize = calculateFontSize();

  // Format display value with spaces
  const displayValue = rawValue.match(/.{1,4}/g)?.join(' ') || rawValue;

  // Determine best barcode format and VALIDATE it
  const barcodeConfig = getBarcodeConfig(rawValue);
  
  console.log('  Barcode config:', barcodeConfig);
  
  if (!barcodeConfig || !barcodeConfig.isValid) {
    // Show error - card number format not supported
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to generate barcode</Text>
          <Text style={styles.errorSubtext}>
            Card number: {displayValue}
          </Text>
          <Text style={styles.errorHelp}>
            {barcodeConfig?.errorMessage || 
              "The card number format isn't compatible with standard barcode formats. You can still use the number manually at checkout."}
          </Text>
        </View>
      </View>
    );
  }

  const estimatedBars = rawValue.length * 11;
  const maxBarWidth = (MAX_BARCODE_WIDTH - 32) / estimatedBars;
  const barWidth = Math.min(2.8, Math.max(1.7, maxBarWidth));

  console.log('  ✅ Rendering barcode with format:', barcodeConfig.format);

  return (
    <View style={styles.container}>
      <View style={styles.barcodeContainer}>
        <Barcode
          value={barcodeConfig.value}
          format={barcodeConfig.format}
          width={barWidth}
          height={130}
          background="white"
          lineColor="black"
          maxWidth={MAX_BARCODE_WIDTH - 32}
        />
      </View>
      <Text 
        style={[styles.value, { fontSize: dynamicFontSize, width: MAX_BARCODE_WIDTH - 32 }]} 
        numberOfLines={1} 
        adjustsFontSizeToFit
      >
        {displayValue}
      </Text>
      {barcodeConfig.note && (
        <Text style={styles.noteText}>{barcodeConfig.note}</Text>
      )}
    </View>
  );
}

// Validate and determine the best barcode format
function getBarcodeConfig(value) {
  if (!value || value.length === 0) {
    return { isValid: false, errorMessage: 'Card number is empty' };
  }
  
  const numericOnly = /^\d+$/.test(value);
  const alphanumeric = /^[A-Za-z0-9]+$/.test(value);
  
  // For alphanumeric codes, always use CODE128
  if (!numericOnly && alphanumeric) {
    if (value.length >= 1 && value.length <= 48) {
      return { 
        isValid: true,
        value: value.toUpperCase(), 
        format: 'CODE128',
        note: null
      };
    } else if (value.length > 48) {
      return {
        isValid: false,
        errorMessage: `Card number too long (${value.length} characters). CODE128 supports up to 48 characters.`
      };
    }
  }
  
  // For numeric codes, prefer CODE128 for flexibility
  // Only use EAN/UPC if specifically needed
  if (numericOnly) {
    // Most gift cards work fine with CODE128
    if (value.length >= 1 && value.length <= 48) {
      return { 
        isValid: true,
        value, 
        format: 'CODE128', 
        note: null 
      };
    } else if (value.length > 48) {
      return {
        isValid: false,
        errorMessage: `Card number too long (${value.length} digits). Maximum supported length is 48.`
      };
    }
  }
  
  // Check for special characters that aren't supported
  if (/[^A-Za-z0-9]/.test(value)) {
    return {
      isValid: false,
      errorMessage: 'Card number contains unsupported characters. Only letters and numbers are allowed for barcodes.'
    };
  }
  
  // Unknown/unsupported format
  return {
    isValid: false,
    errorMessage: `Card number format not recognized. Length: ${value.length}`
  };
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: PADDING,
  },
  barcodeContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    width: MAX_BARCODE_WIDTH,
    alignItems: 'center',
  },
  value: {
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 1,
    textAlign: 'center',
  },
  noteText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#DC262615',
    borderRadius: 12,
    padding: 24,
    borderWidth: 2,
    borderColor: '#DC262630',
    width: MAX_BARCODE_WIDTH,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: 1,
  },
  errorHelp: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
});