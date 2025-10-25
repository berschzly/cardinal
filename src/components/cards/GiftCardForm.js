import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
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
    locationNotificationsEnabled: initialData.locationNotificationsEnabled ?? true,
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

    // Card number (optional but validated if provided)
    if (formData.cardNumber) {
      const cardNumberResult = validateCardNumber(formData.cardNumber);
      if (!cardNumberResult.isValid) {
        newErrors.cardNumber = cardNumberResult.error;
        isValid = false;
      }
    }

    // Balance (optional but validated if provided)
    if (formData.balance) {
      const balanceResult = validateBalance(formData.balance);
      if (!balanceResult.isValid) {
        newErrors.balance = balanceResult.error;
        isValid = false;
      }
    }

    // Expiration date (optional but validated if provided)
    if (formData.expirationDate) {
      const expirationResult = validateExpirationDate(formData.expirationDate);
      if (!expirationResult.isValid) {
        newErrors.expirationDate = expirationResult.error;
        isValid = false;
      }
    }

    // Notes (optional but validated if provided)
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
    const balanceValue = formData.balance ? parseFloat(formData.balance) : null;
    
    const parsedData = {
      store_name: formData.storeName.trim(),
      card_number: formData.cardNumber.trim() || null,
      balance: balanceValue,
      currency: formData.currency || 'USD',
      expiration_date: formData.expirationDate || null,
      notes: formData.notes.trim() || null,
      is_online: formData.isOnline,
      location_notifications_enabled: formData.isOnline ? false : formData.locationNotificationsEnabled,
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
        label="Store Name *"
        value={formData.storeName}
        onChangeText={(value) => handleInputChange('storeName', value)}
        placeholder="e.g. Starbucks, Amazon, Target"
        error={errors.storeName}
        autoCapitalize="words"
      />

      {/* Card Number */}
      <Input
        label="Card Number / Code"
        value={formData.cardNumber}
        onChangeText={(value) => handleInputChange('cardNumber', value)}
        placeholder="Enter card number or code"
        error={errors.cardNumber}
        autoCapitalize="none"
      />

      {/* Balance */}
      <Input
        label="Current Balance"
        value={formData.balance}
        onChangeText={(value) => handleInputChange('balance', value)}
        placeholder="0.00"
        keyboardType="decimal-pad"
        error={errors.balance}
        leftIcon={<Text style={styles.currencySymbol}>$</Text>}
      />

      {/* Currency Info */}
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

      {/* Card Type Toggle */}
      <View style={styles.toggleContainer}>
        <Text style={styles.toggleLabel}>Card Type</Text>
        <View style={styles.toggleButtons}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              !formData.isOnline && styles.toggleButtonActive,
            ]}
            onPress={() => handleInputChange('isOnline', false)}
            activeOpacity={0.7}
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
            activeOpacity={0.7}
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

      {/* Location Notifications Toggle (only for in-store cards) */}
      {!formData.isOnline && (
        <View style={styles.notificationSection}>
          <View style={styles.notificationHeader}>
            <View style={styles.notificationInfo}>
              <Text style={styles.notificationLabel}>📍 Location Notifications</Text>
              <Text style={styles.notificationDescription}>
                Get notified when you're near this store
              </Text>
            </View>
            <Switch
              value={formData.locationNotificationsEnabled}
              onValueChange={(value) => handleInputChange('locationNotificationsEnabled', value)}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.background}
              ios_backgroundColor={COLORS.border}
            />
          </View>

          <View style={styles.notificationHint}>
            <Text style={styles.notificationHintText}>
              ℹ️ Requires location permissions. You can enable/disable this for each card individually.
            </Text>
          </View>
        </View>
      )}

      {/* Notes */}
      <Input
        label="Notes (Optional)"
        value={formData.notes}
        onChangeText={(value) => handleInputChange('notes', value)}
        placeholder="Add any notes about this card..."
        multiline
        numberOfLines={4}
        error={errors.notes}
      />

      {/* Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.infoCardIcon}>💡</Text>
        <View style={styles.infoCardContent}>
          <Text style={styles.infoCardTitle}>Quick Tip</Text>
          <Text style={styles.infoCardText}>
            Only the store name is required. You can add more details anytime by editing the card later.
          </Text>
        </View>
      </View>

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

  currencySymbol: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
    marginRight: SPACING.xs,
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
    lineHeight: FONTS.sizes.sm * 1.4,
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

  notificationSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },

  notificationInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },

  notificationLabel: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },

  notificationDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.sm * 1.4,
  },

  notificationHint: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
  },

  notificationHintText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.xs * 1.5,
  },

  infoCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.info,
  },

  infoCardIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },

  infoCardContent: {
    flex: 1,
  },

  infoCardTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },

  infoCardText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.sm * 1.5,
  },

  submitButton: {
    marginTop: SPACING.lg,
  },
});

export default GiftCardForm;