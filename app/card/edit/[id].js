// Edit card screen - Polished design

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getCard, updateCard } from '../../../lib/supabase';
import { 
  validateCardData, 
  sanitizeCardData,
  isValidCardName,
  isValidBalance,
  isValidCardNumber,
  isValidPin,
  formatValidationErrors,
} from '../../../utils/validation';
import { handleAsync } from '../../../utils/errorHandling';
import { 
  cancelCardNotifications,
  scheduleExpirationReminder, 
  scheduleUsageReminder 
} from '../../../lib/notifications';

import {
  FormInput,
  Button,
  DatePickerInput,
} from '../../../components/common';
import { formatCardNumberInput, stripCardNumberFormatting, formatCardNumberDisplay } from '../../../utils/formatter';
import { LoadingScreen } from '../../../components/common';

export default function EditCard() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  
  // Form state
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [balance, setBalance] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [pin, setPin] = useState('');
  const [notes, setNotes] = useState('');
  const [expirationDate, setExpirationDate] = useState(null);
  
  // Validation
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [error, setError] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    loadCard();
  }, [id]);

  useEffect(() => {
    // Track if form has changes (basic implementation)
    setHasChanges(true);
  }, [name, brand, balance, cardNumber, pin, notes, expirationDate]);

  async function loadCard() {
    const result = await handleAsync(() => getCard(id), { showDefaultError: false });
    
    if (result.error) {
      Alert.alert('Error', 'Failed to load card details');
      router.back();
      return;
    }

    const card = result.data;
    setName(card.name || '');
    setBrand(card.brand || '');
    setBalance(card.balance?.toString() || '');
    setCardNumber(formatCardNumberDisplay(card.card_number || ''));
    setPin(card.pin || '');
    setNotes(card.notes || '');
    setExpirationDate(card.expiration_date ? new Date(card.expiration_date) : null);
    
    setInitialLoading(false);
    setHasChanges(false);
  }

  function validateField(field, value) {
    let validation = { isValid: true, error: null };
    switch (field) {
      case 'name': validation = isValidCardName(value); break;
      case 'balance': validation = isValidBalance(value); break;
      case 'card_number': validation = isValidCardNumber(value); break;
      case 'pin': validation = isValidPin(value); break;
    }
    setFieldErrors(prev => ({
      ...prev,
      [field]: validation.isValid ? null : validation.error,
    }));
  }

  function handleFieldChange(field, value, setter) {
    setter(value);
    if (touched[field]) validateField(field, value);
  }

  function handleFieldBlur(field) {
    setTouched(prev => ({ ...prev, [field]: true }));
  }

  async function handleSaveCard() {
    setTouched({ name: true, balance: true, card_number: true, pin: true });

    const cardData = {
      name, 
      brand, 
      balance,
      card_number: stripCardNumberFormatting(cardNumber), // Removes spaces before DB save
      pin, 
      notes,
      expiration_date: expirationDate ? formatDateForInput(expirationDate) : null,
    };

    const validation = validateCardData(cardData);
    if (!validation.isValid) {
      Alert.alert('Please Fix These Errors', formatValidationErrors(validation.errors));
      return;
    }

    setLoading(true);
    setError(null);
    
    const result = await handleAsync(
      () => updateCard(id, sanitizeCardData(cardData)),
      { showDefaultError: false }
    );
    
    setLoading(false);

    if (result.error) {
      setError(result.error);
      Alert.alert('Update Failed', result.error, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retry', onPress: handleSaveCard },
      ]);
      return;
    }

    // Update notifications
    try {
      await cancelCardNotifications(id);
      
      const cardForNotification = {
        id: id,
        brand: brand || name,
        balance: parseFloat(balance) || 0,
        expirationDate: cardData.expiration_date,
      };
      
      if (cardData.expiration_date) {
        await scheduleExpirationReminder(cardForNotification);
      } else {
        await scheduleUsageReminder(cardForNotification, 30);
      }
    } catch (notificationError) {
      console.error('⚠️ Notification update failed:', notificationError);
    }

    setHasChanges(false);
    Alert.alert('Success!', 'Card updated successfully', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }

  function handleCancel() {
    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  }

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#141414" />
        <LoadingScreen message="Loading card..." icon="create-outline" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#141414" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.headerButton}
          onPress={handleCancel}
          accessible={true}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Card</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Error Banner */}
          {error && (
            <View style={styles.errorBanner}>
              <View style={styles.errorBannerContent}>
                <Ionicons name="warning" size={20} color="#FFFFFF" />
                <Text style={styles.errorBannerText}>{error}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setError(null)}
                accessible={true}
                accessibilityLabel="Dismiss error"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Form Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Card Details</Text>
            
            <FormInput
              label="Card Name"
              value={name}
              onChangeText={(val) => handleFieldChange('name', val, setName)}
              onBlur={() => handleFieldBlur('name')}
              error={fieldErrors.name}
              touched={touched.name}
              required
              placeholder="e.g., Target Gift Card"
              maxLength={100}
            />

            <FormInput
              label="Brand"
              value={brand}
              onChangeText={setBrand}
              placeholder="e.g., Target, Amazon, Starbucks"
              maxLength={50}
              helperText="We'll use this to style your card"
            />

            <FormInput
              label="Current Balance"
              value={balance}
              onChangeText={(val) => handleFieldChange('balance', val, setBalance)}
              onBlur={() => handleFieldBlur('balance')}
              error={fieldErrors.balance}
              touched={touched.balance}
              placeholder="0.00"
              keyboardType="decimal-pad"
              helperText="Track your remaining value"
            />
          </View>

          {/* Security Section */}
          <View style={styles.formSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Security Info</Text>
              <View style={styles.securityBadge}>
                <Ionicons name="lock-closed" size={12} color="#10B981" />
                <Text style={styles.securityBadgeText}>Encrypted</Text>
              </View>
            </View>

            <FormInput
              label="Card Number"
              value={cardNumber}
              onChangeText={(val) => {
                const formatted = formatCardNumberInput(val);
                handleFieldChange('card_number', formatted, setCardNumber);
              }}
              onBlur={() => handleFieldBlur('card_number')}
              error={fieldErrors.card_number}
              touched={touched.card_number}
              placeholder="1234 5678 9012 3456"
              helperText="Used to generate your scannable barcode"
              maxLength={35}
              keyboardType="default"
              autoCapitalize="characters"
            />

            <FormInput
              label="PIN"
              value={pin}
              onChangeText={(val) => handleFieldChange('pin', val, setPin)}
              onBlur={() => handleFieldBlur('pin')}
              error={fieldErrors.pin}
              touched={touched.pin}
              placeholder="4-8 digits"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={8}
              helperText="Your PIN is securely encrypted"
            />
          </View>

          {/* Additional Info Section */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Additional Info</Text>
            
            <DatePickerInput
              label="Expiration Date"
              value={expirationDate}
              onChange={setExpirationDate}
              helperText="We'll remind you before it expires"
              placeholder="Select Date (Optional)"
            />

            <FormInput
              label="Notes"
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any notes about this card..."
              multiline
              numberOfLines={4}
              maxLength={1000}
              helperText="Gift occasion, restrictions, etc."
            />
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancel}
              accessible={true}
              accessibilityLabel="Cancel editing"
              accessibilityRole="button"
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <View style={styles.saveButtonWrapper}>
              <Button onPress={handleSaveCard} loading={loading} disabled={!hasChanges}>
                Save Changes
              </Button>
            </View>
          </View>

          {/* Bottom Info Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoIconContainer}>
              <Ionicons name="information-circle" size={24} color="#DC2626" />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Editing Tip</Text>
              <Text style={styles.infoText}>
                Changes are saved when you tap "Save Changes". You can also go back to discard all changes.
              </Text>
            </View>
          </View>

          <View style={styles.bottomSpacer} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F1F1F',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Error Banner
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#DC2626',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorBannerContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 20,
  },

  // Form Sections
  formSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B98120',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B98140',
  },
  securityBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },

  // Action Buttons
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#1F1F1F',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  saveButtonWrapper: {
    flex: 1,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2A2A2A',
    marginBottom: 24,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DC262620',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    lineHeight: 20,
  },

  bottomSpacer: {
    height: 40,
  },
});