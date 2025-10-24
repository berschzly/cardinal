import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import GiftCardForm from '../../components/cards/GiftCardForm';
import { useGiftCards } from '../../hooks/useGiftCards';
import { COLORS, FONTS, SPACING } from '../../utils/constants';

/**
 * AddCardScreen
 * Screen for adding a new gift card manually
 */
const AddCardScreen = ({ navigation }) => {
  const { addCard, canAddMore } = useGiftCards(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData) => {
    // Check if user can add more cards
    if (!canAddMore) {
      Alert.alert(
        'Card Limit Reached',
        'You have reached the maximum number of gift cards for your plan. Upgrade to Premium for unlimited cards!',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Upgrade',
            onPress: () => {
              // TODO: Navigate to subscription screen
              console.log('Navigate to subscription screen');
            },
          },
        ]
      );
      return;
    }

    setLoading(true);

    const { data, error } = await addCard({
      store_name: formData.storeName,
      card_number: formData.cardNumber,
      balance: formData.balance,
      currency: formData.currency,
      expiration_date: formData.expirationDate,
      notes: formData.notes,
      is_online: formData.isOnline,
    });

    setLoading(false);

    if (error) {
      Alert.alert('Error', error, [{ text: 'OK' }]);
      return;
    }

    // Success!
    Alert.alert(
      'Card Added! 🎉',
      `Your ${formData.storeName} gift card has been added successfully.`,
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back to dashboard
            navigation.navigate('Dashboard');
          },
        },
      ]
    );
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
          <Text style={styles.title}>Add Gift Card</Text>
          <Text style={styles.subtitle}>
            Enter your gift card details below
          </Text>
        </View>

        {/* Form */}
        <GiftCardForm
          onSubmit={handleSubmit}
          loading={loading}
          submitButtonText="Add Card"
        />
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  title: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },

  subtitle: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
  },
});

export default AddCardScreen;