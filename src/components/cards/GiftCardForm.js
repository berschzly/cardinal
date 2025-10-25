import React, { useState, useEffect } from 'react';
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
 * @param {Function} onCancel - Function to call when canceling
 * @param {boolean} loading - Loading state
 * @param {string} submitButtonText - Text for submit button
 */
const GiftCardForm = ({
  initialData = {},
  onSubmit,
  onCancel,
  loading = false,
  submitButtonText = 'Save Card',
}) => {
  // Form state
  const [formData, setFormData] = useState({
    storeName: '',
    cardNumber: '',
    balance: '',
    currency: 'USD',
    expirationDate: '',
    notes: '',
    isOnline: false,
    storeAddress: '',
    locationNotificationsEnabled: true,
  });

  // Error state
  const [errors, setErrors] = useState({});

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        storeName: initialData.storeName || '',
        cardNumber: initialData.cardNumber || '',
        balance: initialData.balance?.toString() || '',
        currency: initialData.currency || 'USD',
        expirationDate: initialData.expirationDate || '',
        notes: initialData.notes || '',
        isOnline: initialData.isOnline || false,
        storeAddress: initialData.storeAddress || '',
        locationNotificationsEnabled: initialData.locationNotificationsEnabled ?? true,
      });
    }
  }, [initialData]);

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Store name (required)
    const storeNameResult = validateStoreName(formData.storeName);
    if (!storeNameResult.isValid) {
      newErrors.storeName = storeNameResult.error;
      isValid = false;
    }

    // Card number (optional)
    if (formData.cardNumber) {
      const cardNumberResult = validateCardNumber(formData.cardNumber);
      if (!cardNumberResult.isValid) {
        newErrors.cardNumber = cardNumberResult.error;
        isValid = false;
      }
    }

    // Balance (optional)
    if (formData.balance) {
      const balanceResult = validateBalance(formData.balance);
      if (!balanceResult.isValid) {
        newErrors.balance = balanceResult.error;
        isValid = false;
      }
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
    const balanceValue = formData.balance ? parseFloat(formData.balance) : null;
    
    const parsedData = {
      store_name: formData.storeName.trim(),
      card_number: formData.cardNumber.trim() || null,
      balance: balanceValue,
      currency: formData.currency || 'USD',
      expiration_date: formData.expirationDate || null,
      notes: formData.notes.trim() || null,
      is_online: formData.isOnline,
      store_address: !formData.isOnline && formData.storeAddress ? formData.storeAddress.trim() : null,
      location_notifications_enabled: formData.isOnline ? false : formData.locationNotificationsEnabled,
    };

    onSubmit(parsedData);
  };

  return (
    <View style={styles.container}>
      {/* Store Name */}
      <Input
        label="Store Name *"
        value={formData.storeName}
        onChangeText={(value) => handleInputChange('storeName', value)}
        placeholder="e.g., Starbucks, Amazon, Target"
        error={errors.storeName}
        autoCapitalize="words"
        autoCorrect={false}
      />

      {/* Card Number */}
      <Input
        label="Card Number / Code"
        value={formData.cardNumber}
        onChangeText={(value) => handleInputChange('cardNumber', value)}
        placeholder="Enter card number or code"
        error={errors.cardNumber}
        autoCapitalize="none"
        autoCorrect={false}
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
        placeholder="YYYY-MM-DD (e.g., 2025-12-31)"
        error={errors.expirationDate}
        autoCapitalize="none"
        autoCorrect={false}
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

      {/* Store Address (only for physical cards) */}
      {!formData.isOnline && (
        <Input
          label="Store Location (Optional)"
          value={formData.storeAddress}
          onChangeText={(value) => handleInputChange('storeAddress', value)}
          placeholder="e.g., 123 Main St, New York, NY"
          autoCapitalize="words"
          autoCorrect={false}
        />
      )}

      {/* Location Notifications Toggle (only for physical cards) */}
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
              ℹ️ Requires location permissions. Can be changed later in settings.
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
        autoCapitalize="sentences"
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

      {/* Action Buttons */}
      <View style={styles.actions}>
        <Button
          title={submitButtonText}
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />

        {onCancel && (
          <Button
            title="Cancel"
            onPress={onCancel}
            variant="outline"
            style={styles.cancelButton}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  currencySymbol: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
    marginRight: SPACING.xs / 2,
  },

  infoBox: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    marginTop: -SPACING.xs,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },

  infoText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },

  infoSubtext: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
  },

  helpText: {
    marginBottom: SPACING.md,
    marginTop: -SPACING.xs,
  },

  helpTextContent: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.sm * 1.5,
  },

  toggleContainer: {
    marginBottom: SPACING.lg,
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },

  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  toggleButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
  },

  toggleButtonTextActive: {
    color: COLORS.background,
    fontWeight: FONTS.weights.bold,
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

  actions: {
    marginTop: SPACING.md,
  },

  submitButton: {
    marginBottom: SPACING.sm,
  },

  cancelButton: {
    marginBottom: SPACING.lg,
  },
});

export default GiftCardForm;