import { View, Text, StyleSheet } from 'react-native';
import Barcode from '@kichiyaki/react-native-barcode-generator';
import QRCode from 'react-native-qrcode-svg';
import Colors from '../../constants/Colors';

export default function BarcodeDisplay({ value, type }) {
  if (!value || !type) return null;

  // QR Code
  if (type === 'qr') {
    return (
      <View style={styles.container}>
        <View style={styles.qrContainer}>
          <QRCode value={value} size={200} backgroundColor="white" />
        </View>
        <Text style={styles.value}>{value}</Text>
      </View>
    );
  }

  // Linear barcodes (Code128, EAN13, UPCA)
  const barcodeFormat = {
    code128: 'CODE128',
    ean13: 'EAN13',
    upca: 'UPC',
  }[type] || 'CODE128';

  return (
    <View style={styles.container}>
      <View style={styles.barcodeContainer}>
        <Barcode
          value={value}
          format={barcodeFormat}
          width={2}
          height={100}
          background="white"
          lineColor="black"
        />
      </View>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  barcodeContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  qrContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
});