import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import Input from '../common/Input';
import Button from '../common/Button';
import {
  validateStoreName,
  validateCardNumber,
  validateBalance,
  validateExpirationDate,
  validateNotes,
} from '../../utils/validators';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/constants';

/**
 * GiftCardForm Component
 * Reusable form for adding/editing gift cards
 * @param {Object} initialData - Initial form values (for editing)
 * @param {Function} onSubmit - Function to call on form submission
 * @param {boolean} loading - Loading state
 * @param {string} submitButtonText - Text for submit button (default: "Save Card")
 */
const GiftCardForm = ({
  initialData = {},
  onSubmit,
  loading = false,
  submitButtonText = 'Save Card',
}) => {
  // Form state
  const [formData, setFormData] = useState({
    storeName: initialData.storeName || '',
    cardNumber: initialData.cardNumber || '',
    balance: initialData.balance?.toString() || '',
    currency: initialData.currency || 'USD',
    expirationDate: initialData.expirationDate || '',
    notes: initialData.notes || '',
    isOnline: initialData.isOnline || false,
  });

  // Error state
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Store name
    const storeNameResult = validateStoreName(formData.storeName);
    if (!storeNameResult.isValid) {
      newErrors.storeName = storeNameResult.error;
      isValid = false;
    }

    // Card number
    const cardNumberResult = validateCardNumber(formData.cardNumber);
    if (!cardNumberResult.isValid) {
      newErrors.cardNumber = cardNumberResult.error;
      isValid = false;
    }

    // Balance
    const balanceResult = validateBalance(formData.balance);
    if (!balanceResult.isValid) {
      newErrors.balance = balanceResult.error;
      isValid = false;
    }

    // Expiration date (optional)
    if (formData.expirationDate) {
      const expirationResult = validateExpirationDate(formData.expirationDate);
      if (!expirationResult.isValid) {
        newErrors.expirationDate = expirationResult.error;
        isValid = false;
      }
    }

    // Notes (optional)
    if (formData.notes) {
      const notesResult = validateNotes(formData.notes);
      if (!notesResult.isValid) {
        newErrors.notes = notesResult.error;
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle submit
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Parse balance to float
    const balanceResult = validateBalance(formData.balance);
    const parsedData = {
      ...formData,
      balance: balanceResult.value,
      // Convert date string to ISO format if provided
      expirationDate: formData.expirationDate
        ? new Date(formData.expirationDate).toISOString()
        : null,
    };

    onSubmit(parsedData);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Store Name */}
      <Input
        label="Store Name"
        value={formData.storeName}
        onChangeText={(value) => handleInputChange('storeName', value)}
        placeholder="e.g. Starbucks, Amazon, Target"
        error={errors.storeName}
        autoCapitalize="words"
        required
      />

      {/* Card Number */}
      <Input
        label="Card Number / Code"
        value={formData.cardNumber}
        onChangeText={(value) => handleInputChange('cardNumber', value)}
        placeholder="Enter card number or code"
        error={errors.cardNumber}
        autoCapitalize="none"
        required
      />

      {/* Balance */}
      <Input
        label="Current Balance"
        value={formData.balance}
        onChangeText={(value) => handleInputChange('balance', value)}
        placeholder="0.00"
        keyboardType="decimal-pad"
        error={errors.balance}
        prefix="$"
        required
      />

      {/* Currency (optional - default USD) */}
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>💵 Currency: USD</Text>
        <Text style={styles.infoSubtext}>
          Multi-currency support coming soon
        </Text>
      </View>

      {/* Expiration Date */}
      <Input
        label="Expiration Date (Optional)"
        value={formData.expirationDate}
        onChangeText={(value) => handleInputChange('expirationDate', value)}
        placeholder="YYYY-MM-DD"
        error={errors.expirationDate}
      />

      <View style={styles.helpText}>
        <Text style={styles.helpTextContent}>
          💡 Tip: Enter expiration date to get reminders before your card expires
        </Text>
      </View>

      {/* Online/In-Store Toggle */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Card Type</Text>
        <View style={styles.toggleButtons}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              !formData.isOnline && styles.toggleButtonActive,
            ]}
            onPress={() => handleInputChange('isOnline', false)}
          >
            <Text
              style={[
                styles.toggleButtonText,
                !formData.isOnline && styles.toggleButtonTextActive,
              ]}
            >
              🏪 In-Store
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              formData.isOnline && styles.toggleButtonActive,
            ]}
            onPress={() => handleInputChange('isOnline', true)}
          >
            <Text
              style={[
                styles.toggleButtonText,
                formData.isOnline && styles.toggleButtonTextActive,
              ]}
            >
              🌐 Online
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Notes */}
      <Input
        label="Notes (Optional)"
        value={formData.notes}
        onChangeText={(value) => handleInputChange('notes', value)}
        placeholder="Add any notes about this card..."
        multiline
        numberOfLines={3}
        error={errors.notes}
      />

      {/* Submit Button */}
      <Button
        title={submitButtonText}
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: SPACING.md,
    paddingBottom: Platform.OS === 'ios' ? 120 : 105, // Space for tab bar
  },

  infoBox: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },

  infoText: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },

  infoSubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
  },

  helpText: {
    marginBottom: SPACING.md,
    marginTop: -SPACING.sm,
  },

  helpTextContent: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },

  toggleContainer: {
    marginBottom: SPACING.md,
  },

  toggleLabel: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  toggleButtons: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },

  toggleButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },

  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  toggleButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },

  toggleButtonTextActive: {
    color: COLORS.background,
    fontWeight: FONTS.weights.semiBold,
  },

  submitButton: {
    marginTop: SPACING.lg,
  },
});

export default GiftCardForm;