import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGiftCards } from '../../hooks/useGiftCards';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ErrorMessage from '../../components/common/ErrorMessage';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/constants';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../utils/constants';

const AddCardScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { addCard, canAddMore } = useGiftCards(false);

  // Form state
  const [storeName, setStoreName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [balance, setBalance] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [expirationDate, setExpirationDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isOnline, setIsOnline] = useState(false);
  const [storeAddress, setStoreAddress] = useState('');

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Calculate bottom padding for tab bar
  const tabBarHeight = Platform.OS === 'ios' ? 95 : 82;
  const bottomPadding = tabBarHeight + SPACING.md;

  const validateForm = () => {
    // Store name is required
    if (!storeName.trim()) {
      setError('Please enter the store name');
      return false;
    }

    if (storeName.trim().length < 2) {
      setError('Store name must be at least 2 characters');
      return false;
    }

    // Validate balance if provided
    if (balance && isNaN(parseFloat(balance))) {
      setError('Please enter a valid balance amount');
      return false;
    }

    if (balance && parseFloat(balance) < 0) {
      setError('Balance cannot be negative');
      return false;
    }

    // Validate expiration date format if provided (YYYY-MM-DD)
    if (expirationDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(expirationDate)) {
        setError('Expiration date must be in YYYY-MM-DD format');
        return false;
      }

      // Check if date is valid
      const date = new Date(expirationDate);
      if (isNaN(date.getTime())) {
        setError('Please enter a valid expiration date');
        return false;
      }
    }

    return true;
  };

  const handleAddCard = async () => {
    setError('');

    // Check if user can add more cards
    if (!canAddMore) {
      setError(ERROR_MESSAGES.cardLimitReached);
      return;
    }

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Prepare card data
    const cardData = {
      store_name: storeName.trim(),
      card_number: cardNumber.trim() || null,
      balance: balance ? parseFloat(balance) : null,
      currency: currency || 'USD',
      expiration_date: expirationDate || null,
      notes: notes.trim() || null,
      is_online: isOnline,
      store_address: !isOnline && storeAddress.trim() ? storeAddress.trim() : null,
      location_notifications_enabled: !isOnline, // Enable notifications for physical stores
    };

    // Add card
    setLoading(true);
    const { error: addError } = await addCard(cardData);
    setLoading(false);

    if (addError) {
      setError(addError);
      return;
    }

    // Success - show alert and navigate back
    Alert.alert(
      'Success!',
      SUCCESS_MESSAGES.cardAdded,
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const handleCancel = () => {
    if (storeName || cardNumber || balance || notes) {
      Alert.alert(
        'Discard Changes?',
        'Are you sure you want to discard this gift card?',
        [
          {
            text: 'Keep Editing',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } else {
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Add Gift Card</Text>

          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomPadding }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Info Banner */}
          {!canAddMore && (
            <View style={styles.warningBanner}>
              <Text style={styles.warningText}>
                ⚠️ You've reached your card limit. Upgrade to Premium for unlimited cards!
              </Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            {/* Store Name */}
            <Input
              label="Store Name *"
              value={storeName}
              onChangeText={setStoreName}
              placeholder="e.g., Starbucks, Amazon, Target"
              autoCapitalize="words"
            />

            {/* Card Number */}
            <Input
              label="Card Number"
              value={cardNumber}
              onChangeText={setCardNumber}
              placeholder="Enter card number or code"
              keyboardType="default"
            />

            {/* Balance */}
            <Input
              label="Current Balance"
              value={balance}
              onChangeText={setBalance}
              placeholder="e.g., 25.00"
              keyboardType="decimal-pad"
              leftIcon={<Text style={styles.currencySymbol}>$</Text>}
            />

            {/* Expiration Date */}
            <Input
              label="Expiration Date"
              value={expirationDate}
              onChangeText={setExpirationDate}
              placeholder="YYYY-MM-DD (e.g., 2025-12-31)"
              keyboardType="default"
            />

            <View style={styles.dateHint}>
              <Text style={styles.dateHintText}>
                💡 Tip: Leave blank if the card doesn't expire
              </Text>
            </View>

            {/* Card Type Toggle */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Card Type</Text>
              <View style={styles.toggleRow}>
                <View style={styles.toggleInfo}>
                  <Text style={styles.toggleLabel}>
                    {isOnline ? '🌐 Online Gift Card' : '🏪 Physical Store Card'}
                  </Text>
                  <Text style={styles.toggleDescription}>
                    {isOnline
                      ? 'Can be used online or in any store location'
                      : 'Can only be used at specific store locations'}
                  </Text>
                </View>
                <Switch
                  value={isOnline}
                  onValueChange={setIsOnline}
                  trackColor={{ false: COLORS.border, true: COLORS.primary }}
                  thumbColor={COLORS.background}
                  ios_backgroundColor={COLORS.border}
                />
              </View>
            </View>

            {/* Store Address (only for physical cards) */}
            {!isOnline && (
              <Input
                label="Store Location (Optional)"
                value={storeAddress}
                onChangeText={setStoreAddress}
                placeholder="e.g., 123 Main St, New York, NY"
                autoCapitalize="words"
              />
            )}

            {/* Notes */}
            <Input
              label="Notes (Optional)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Add any additional notes about this card"
              multiline
              numberOfLines={4}
            />

            {/* Error Message */}
            {error && (
              <ErrorMessage
                message={error}
                variant="error"
                onRetry={() => setError('')}
              />
            )}

            {/* Info Card */}
            <View style={styles.infoCard}>
              <Text style={styles.infoIcon}>ℹ️</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoTitle}>Getting Started</Text>
                <Text style={styles.infoText}>
                  Only the store name is required. You can add more details later by editing the card.
                </Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Button
                title="Add Gift Card"
                onPress={handleAddCard}
                loading={loading}
                disabled={!canAddMore}
                style={styles.addButton}
              />

              <Button
                title="Cancel"
                onPress={handleCancel}
                variant="outline"
                style={styles.cancelActionButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboardView: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },

  cancelButton: {
    padding: SPACING.sm,
  },

  cancelButtonText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },

  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
  },

  headerSpacer: {
    width: 60, // Same width as cancel button for centering
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: SPACING.md,
  },

  warningBanner: {
    backgroundColor: COLORS.expiringSoon,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.warning,
  },

  warningText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.expiringSoonText,
    fontWeight: FONTS.weights.medium,
  },

  form: {
    marginBottom: SPACING.xl,
  },

  currencySymbol: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },

  dateHint: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
  },

  dateHintText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.xs * 1.5,
  },

  section: {
    marginBottom: SPACING.lg,
  },

  sectionLabel: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  toggleInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },

  toggleLabel: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },

  toggleDescription: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.xs * 1.4,
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

  infoIcon: {
    fontSize: FONTS.sizes.xl,
    marginRight: SPACING.sm,
  },

  infoContent: {
    flex: 1,
  },

  infoTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },

  infoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.sm * 1.4,
  },

  actions: {
    marginTop: SPACING.lg,
  },

  addButton: {
    marginBottom: SPACING.sm,
  },

  cancelActionButton: {
    marginBottom: SPACING.sm,
  },
});

export default AddCardScreen;