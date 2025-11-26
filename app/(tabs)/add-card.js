// Add new card screen

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { createCard } from '../../lib/supabase';
import { validateCardData, sanitizeCardData } from '../../utils/validation';
import { scheduleExpirationReminder, scheduleUsageReminder } from '../../lib/notifications';
import Colors from '../../constants/Colors';
import { Modal } from 'react-native';
import OCRScanner from '../../components/add-cards/OCRScanner';
import { parseGiftCardText } from '../../lib/ocr';

export default function AddCard() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [balance, setBalance] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [pin, setPin] = useState('');
  const [notes, setNotes] = useState('');
  const [barcodeType, setBarcodeType] = useState('');
  const [barcodeValue, setBarcodeValue] = useState('');
  const [expirationDate, setExpirationDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  async function handleSaveCard() {
    // Build card data object
    const cardData = {
      name,
      brand,
      balance,
      card_number: cardNumber,
      pin,
      notes,
      barcode_type: barcodeType || null,
      barcode_value: barcodeValue,
      expiration_date: expirationDate ? expirationDate.toISOString().split('T')[0] : null,
    };

    // Validate
    const validation = validateCardData(cardData);
    if (!validation.isValid) {
      const errorMessages = Object.values(validation.errors).join('\n');
      Alert.alert('Validation Error', errorMessages);
      return;
    }

    // Sanitize and save
    setLoading(true);
    const cleanData = sanitizeCardData(cardData);
    const { data, error } = await createCard(cleanData);
    
    if (error) {
      setLoading(false);
      Alert.alert('Error', 'Failed to save card. Please try again.');
      console.error(error);
      return;
    }

    // 🎯 Schedule notifications for the new card
    try {
      // Make sure we have the card ID
      if (!data?.id) {
        console.error('⚠️ No card ID returned from database');
      } else {
        const cardForNotification = {
          id: data.id,
          brand: data.brand || name,
          balance: parseFloat(data.balance) || 0,
          expirationDate: data.expiration_date,
        };

        console.log('📅 Scheduling notifications for:', cardForNotification);

        if (data.expiration_date) {
          // Schedule expiration reminders (30, 7, 1 days before)
          const notificationIds = await scheduleExpirationReminder(cardForNotification);
          console.log('✅ Expiration reminders scheduled for card:', data.id, notificationIds);
        } else {
          // If no expiration, schedule a usage reminder (30 days from now)
          const notificationId = await scheduleUsageReminder(cardForNotification, 30);
          console.log('✅ Usage reminder scheduled for card:', data.id, notificationId);
        }
      }
    } catch (notificationError) {
      // Don't block the flow if notifications fail
      console.error('⚠️ Failed to schedule notifications:', notificationError);
    }

    setLoading(false);

    // Clear form
    setName('');
    setBrand('');
    setBalance('');
    setCardNumber('');
    setPin('');
    setNotes('');
    setBarcodeType('');
    setBarcodeValue('');
    setExpirationDate(null);
    
    Alert.alert('Success!', 'Card added successfully with reminders', [
      {
        text: 'OK',
        onPress: () => router.push('/(tabs)'), // Navigate to cards tab
      },
    ]);
  }

  function handleScanComplete(ocrData) {
    setShowScanner(false);
      
    // Pre-fill form with OCR data
    if (ocrData.brand) setBrand(ocrData.brand);
    if (ocrData.cardNumber) setCardNumber(ocrData.cardNumber);
    if (ocrData.balance) setBalance(ocrData.balance.toString());
    if (ocrData.pin) setPin(ocrData.pin);
    if (ocrData.expirationDate) {
      setExpirationDate(new Date(ocrData.expirationDate));
    }
      
    Alert.alert('Scan Complete', 'Review and edit the card details below');
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Add New Card</Text>
        <TouchableOpacity
          style={styles.scanButton}
          onPress={() => setShowScanner(true)}
        >
          <Text style={styles.scanButtonText}>📷 Scan Card with Camera</Text>
        </TouchableOpacity>

        {/* Required: Card Name */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>
            Card Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Target Gift Card"
            placeholderTextColor={Colors.textTertiary}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Brand */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Brand</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Target, Amazon, Starbucks"
            placeholderTextColor={Colors.textTertiary}
            value={brand}
            onChangeText={setBrand}
          />
        </View>

        {/* Balance */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Balance</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            placeholderTextColor={Colors.textTertiary}
            value={balance}
            onChangeText={setBalance}
            keyboardType="decimal-pad"
          />
        </View>

        {/* Card Number */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Card Number</Text>
          <TextInput
            style={styles.input}
            placeholder="1234 5678 9012 3456"
            placeholderTextColor={Colors.textTertiary}
            value={cardNumber}
            onChangeText={setCardNumber}
            keyboardType="number-pad"
          />
        </View>

        {/* PIN */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>PIN</Text>
          <TextInput
            style={styles.input}
            placeholder="4-8 digits"
            placeholderTextColor={Colors.textTertiary}
            value={pin}
            onChangeText={setPin}
            keyboardType="number-pad"
            secureTextEntry
            maxLength={8}
          />
        </View>

        {/* Expiration Date */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Expiration Date</Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {expirationDate
                ? expirationDate.toLocaleDateString()
                : 'Select Date'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.helperText}>
            💡 You'll get reminders 30, 7, and 1 day before expiration
          </Text>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={expirationDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setExpirationDate(selectedDate);
              }
            }}
          />
        )}

        {/* Barcode Type */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Barcode Type</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={barcodeType}
              onValueChange={setBarcodeType}
              style={styles.picker}
              dropdownIconColor={Colors.text}
            >
              <Picker.Item label="None" value="" />
              <Picker.Item label="Code 128" value="code128" />
              <Picker.Item label="QR Code" value="qr" />
              <Picker.Item label="EAN-13" value="ean13" />
              <Picker.Item label="UPC-A" value="upca" />
            </Picker>
          </View>
        </View>

        {/* Barcode Value */}
        {barcodeType && (
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Barcode Value</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter barcode number"
              placeholderTextColor={Colors.textTertiary}
              value={barcodeValue}
              onChangeText={setBarcodeValue}
            />
          </View>
        )}

        {/* Notes */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Notes</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Add any notes about this card..."
            placeholderTextColor={Colors.textTertiary}
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSaveCard}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Saving...' : 'Save Card'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
      <Modal
        visible={showScanner}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <OCRScanner
          onScanComplete={handleScanComplete}
          onClose={() => setShowScanner(false)}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  required: {
    color: Colors.error,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 16,
  },
  dateButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.text,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  pickerContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  picker: {
    color: Colors.text,
    backgroundColor: Colors.surface,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  bottomSpacer: {
    height: 40,
  },
  scanButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  scanButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});