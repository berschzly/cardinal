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
import Colors from '../../constants/Colors';

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
    setLoading(false);

    if (error) {
      Alert.alert('Error', 'Failed to save card. Please try again.');
      console.error(error);
    } else {
      Alert.alert('Success!', 'Card added successfully', [
        {
          text: 'OK',
          onPress: () => {
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
            
            // Go back to list
            router.push('/(tabs)');
          },
        },
      ]);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Add New Card</Text>

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
});