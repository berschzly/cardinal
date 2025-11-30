import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import QRCode from 'react-native-qrcode-svg';
import Colors from '../../constants/Colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const PADDING = 43;
const MAX_BARCODE_WIDTH = SCREEN_WIDTH - (PADDING * 2); // 43 padding on each side

export default function BarcodeDisplay({ card }) {
  // Use card_number for barcode generation
  const value = card?.card_number;
  
  if (!value) return null;

  // Auto-detect barcode type based on card number
  const barcodeType = detectBarcodeType(value);

  // Calculate dynamic font size based on barcode width and value length
  const calculateFontSize = () => {
    const availableWidth = MAX_BARCODE_WIDTH - 32; // Account for container padding
    const charCount = value.length;
    const baseSize = availableWidth / (charCount * 0.6); // 0.6 is approximate char width ratio
    return Math.min(Math.max(baseSize, 10), 16); // Clamp between 10 and 16
  };

  const dynamicFontSize = calculateFontSize();

  // QR Code
  if (barcodeType === 'qr') {
    const qrSize = Math.min(260, MAX_BARCODE_WIDTH - 32);
    
    return (
      <View style={styles.container}>
        <View style={styles.qrContainer}>
          <QRCode value={value} size={qrSize} backgroundColor="white" />
        </View>
        <Text style={[styles.value, { fontSize: dynamicFontSize }]}>{value}</Text>
      </View>
    );
  }

  // Linear barcodes - calculate optimal width
  const barcodeFormat = {
    code128: 'CODE128',
    ean13: 'EAN13',
    upca: 'UPC',
  }[barcodeType] || 'CODE128';

  // Calculate bar width to fit screen
  const estimatedBars = value.length * 11;
  const maxBarWidth = (MAX_BARCODE_WIDTH - 32) / estimatedBars;
  const barWidth = Math.min(2.8, Math.max(1.7, maxBarWidth));

  return (
    <View style={styles.container}>
      <View style={styles.barcodeContainer}>
        <Barcode
          value={value}
          format={barcodeFormat}
          width={barWidth}
          height={130}
          background="white"
          lineColor="black"
          maxWidth={MAX_BARCODE_WIDTH - 32}
        />
      </View>
      <Text style={[styles.value, { fontSize: dynamicFontSize, width: MAX_BARCODE_WIDTH - 32 }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

// Auto-detect barcode type based on the card number
function detectBarcodeType(value) {
  const numericOnly = /^\d+$/.test(value);
  
  if (numericOnly) {
    if (value.length === 13) return 'ean13';
    if (value.length === 12) return 'upca';
    if (value.length === 8) return 'ean13'; // EAN8 uses EAN13 format
  }
  
  // For very long strings or special characters, use QR
  if (value.length > 50 || /[^A-Za-z0-9\-\s]/.test(value)) {
    return 'qr';
  }
  
  // Default to Code128 for everything else
  return 'code128';
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
  qrContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  value: {
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 1,
    textAlign: 'center',
  },
});