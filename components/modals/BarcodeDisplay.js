import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import QRCode from 'react-native-qrcode-svg';
import Colors from '../../constants/Colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MAX_BARCODE_WIDTH = SCREEN_WIDTH - 48; // Reduced padding for more space

export default function BarcodeDisplay({ card }) {
  // Use card_number for barcode generation
  const value = card?.card_number;
  
  if (!value) return null;

  // Auto-detect barcode type based on card number
  const barcodeType = detectBarcodeType(value);

  // QR Code
  if (barcodeType === 'qr') {
    const qrSize = Math.min(240, MAX_BARCODE_WIDTH - 24);
    
    return (
      <View style={styles.container}>
        <View style={styles.qrContainer}>
          <QRCode value={value} size={qrSize} backgroundColor="white" />
        </View>
        <Text style={styles.value}>{value}</Text>
      </View>
    );
  }

  // Linear barcodes - calculate optimal width
  const barcodeFormat = {
    code128: 'CODE128',
    ean13: 'EAN13',
    upca: 'UPC',
  }[barcodeType] || 'CODE128';

  // Calculate bar width to fit screen - aim for larger bars
  const estimatedBars = value.length * 11; // Rough estimate
  const maxBarWidth = MAX_BARCODE_WIDTH / estimatedBars;
  const barWidth = Math.min(2.5, Math.max(1.5, maxBarWidth));

  return (
    <View style={styles.container}>
      <View style={styles.barcodeContainer}>
        <Barcode
          value={value}
          format={barcodeFormat}
          width={barWidth}
          height={120}
          background="white"
          lineColor="black"
          maxWidth={MAX_BARCODE_WIDTH - 24}
        />
      </View>
      <Text style={styles.value}>{value}</Text>
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
    paddingHorizontal: 12,
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
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
});