import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  FlatList,
  ActivityIndicator,
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
import { searchStoreLocations } from '../../services/database';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/constants';

/**
 * GiftCardForm Component
 * Reusable form for adding/editing gift cards with store location support
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
    storeLocationId: null,
    locationNotificationsEnabled: true,
  });

  // Location state
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);

  // Error state
  const [errors, setErrors] = useState({});

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        storeName: initialData.store_name || '',
        cardNumber: initialData.card_number || '',
        balance: initialData.balance?.toString() || '',
        currency: initialData.currency || 'USD',
        expirationDate: initialData.expiration_date || '',
        notes: initialData.notes || '',
        isOnline: initialData.is_online || false,
        storeAddress: initialData.store_address || '',
        storeLocationId: initialData.store_location_id || null,
        locationNotificationsEnabled: initialData.location_notifications_enabled ?? true,
      });
    }
  }, [initialData]);

  // Search for store locations when store name changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!formData.isOnline && formData.storeName.length >= 2) {
        searchLocations(formData.storeName);
      } else {
        setLocationSuggestions([]);
        setShowLocationSuggestions(false);
      }
    }, 300); // Debounce

    return () => clearTimeout(timer);
  }, [formData.storeName, formData.isOnline]);

  // Search for store locations
  const searchLocations = async (query) => {
    if (!query || query.length < 2) return;
    
    setLoadingLocations(true);
    
    const { data, error } = await searchStoreLocations(query);
    
    if (data && data.length > 0) {
      setLocationSuggestions(data);
      setShowLocationSuggestions(true);
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
    
    setLoadingLocations(false);
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    const fullAddress = [
      location.address,
      location.city,
      location.state,
      location.zip_code,
    ]
      .filter(Boolean)
      .join(', ');

    setFormData((prev) => ({
      ...prev,
      storeAddress: fullAddress,
      storeLocationId: location.id,
    }));

    setShowLocationSuggestions(false);
  };

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

    // Clear location ID when address is manually changed
    if (field === 'storeAddress') {
      setFormData((prev) => ({
        ...prev,
        storeLocationId: null,
      }));
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
      store_location_id: !formData.isOnline ? formData.storeLocationId : null,
      location_notifications_enabled: formData.isOnline ? false : formData.locationNotificationsEnabled,
    };

    onSubmit(parsedData);
  };

  const renderLocationSuggestion = ({ item }) => (
    <TouchableOpacity
      style={styles.locationSuggestion}
      onPress={() => handleLocationSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.locationIcon}>
        <Text style={styles.locationIconText}>📍</Text>
      </View>
      <View style={styles.locationInfo}>
        <Text style={styles.locationName}>{item.store_name}</Text>
        <Text style={styles.locationAddress}>
          {[item.address, item.city, item.state]
            .filter(Boolean)
            .join(', ')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
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
        <>
          <Input
            label="Store Location (Optional)"
            value={formData.storeAddress}
            onChangeText={(value) => handleInputChange('storeAddress', value)}
            placeholder="Enter address or select from suggestions"
            autoCapitalize="words"
            autoCorrect={false}
          />

          {/* Location Suggestions */}
          {showLocationSuggestions && locationSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <View style={styles.suggestionsHeader}>
                <Text style={styles.suggestionsTitle}>📍 Suggested Locations</Text>
                {loadingLocations && (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                )}
              </View>
              <FlatList
                data={locationSuggestions}
                renderItem={renderLocationSuggestion}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                style={styles.suggestionsList}
              />
            </View>
          )}

          {/* Location Helper Text */}
          {formData.storeLocationId && (
            <View style={styles.locationSelectedBadge}>
              <Text style={styles.locationSelectedText}>
                ✓ Location selected from database
              </Text>
            </View>
          )}
        </>
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
    </ScrollView>
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

  suggestionsContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    marginTop: -SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },

  suggestionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.primary + '10',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  suggestionsTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.primary,
  },

  suggestionsList: {
    maxHeight: 200,
  },

  locationSuggestion: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    alignItems: 'center',
  },

  locationIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },

  locationIconText: {
    fontSize: 20,
  },

  locationInfo: {
    flex: 1,
  },

  locationName: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
    marginBottom: 2,
  },

  locationAddress: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.sm * 1.4,
  },

  locationSelectedBadge: {
    backgroundColor: COLORS.success + '15',
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
    marginTop: -SPACING.xs,
  },

  locationSelectedText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.success,
    fontWeight: FONTS.weights.medium,
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
    paddingBottom: SPACING.xl,
  },

  submitButton: {
    marginBottom: SPACING.sm,
  },

  cancelButton: {
    marginBottom: SPACING.lg,
  },
});

export default GiftCardForm;