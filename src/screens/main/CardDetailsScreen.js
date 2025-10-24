import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGiftCards } from '../../hooks/useGiftCards';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import ExpirationBadge from '../../components/cards/ExpirationBadge';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../utils/constants';

const CardDetailsScreen = ({ route, navigation }) => {
  const { cardId } = route.params;
  const { fetchCard, updateCard, deleteCard, markAsUsed } = useGiftCards(false);

  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [storeName, setStoreName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [balance, setBalance] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [notes, setNotes] = useState('');

  // Load card data
  useEffect(() => {
    loadCard();
  }, [cardId]);

  const loadCard = async () => {
    setLoading(true);
    setError('');

    const { data, error: fetchError } = await fetchCard(cardId);

    if (fetchError) {
      setError(fetchError);
      setLoading(false);
      return;
    }

    if (data) {
      setCard(data);
      // Initialize form with card data
      setStoreName(data.store_name || '');
      setCardNumber(data.card_number || '');
      setBalance(data.balance?.toString() || '');
      setExpirationDate(data.expiration_date || '');
      setNotes(data.notes || '');
    }

    setLoading(false);
  };

  const handleSave = async () => {
    setError('');

    // Validation
    if (!storeName.trim()) {
      setError('Store name is required');
      return;
    }

    // Prepare updates
    const updates = {
      store_name: storeName.trim(),
      card_number: cardNumber.trim() || null,
      balance: balance ? parseFloat(balance) : null,
      expiration_date: expirationDate || null,
      notes: notes.trim() || null,
    };

    setSaving(true);
    const { error: updateError } = await updateCard(cardId, updates);
    setSaving(false);

    if (updateError) {
      setError(updateError);
      return;
    }

    // Reload card data and exit edit mode
    await loadCard();
    setEditing(false);
    Alert.alert('Success', 'Card updated successfully!');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this gift card? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            const { error: deleteError } = await deleteCard(cardId);
            setSaving(false);

            if (deleteError) {
              Alert.alert('Error', deleteError);
              return;
            }

            Alert.alert('Success', 'Card deleted successfully!');
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleMarkAsUsed = () => {
    Alert.alert(
      'Mark as Used',
      'Mark this gift card as fully used?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Mark as Used',
          onPress: async () => {
            setSaving(true);
            const { error: markError } = await markAsUsed(cardId);
            setSaving(false);

            if (markError) {
              Alert.alert('Error', markError);
              return;
            }

            await loadCard();
            Alert.alert('Success', 'Card marked as used!');
          },
        },
      ]
    );
  };

  const handleCancel = () => {
    // Reset form to original values
    if (card) {
      setStoreName(card.store_name || '');
      setCardNumber(card.card_number || '');
      setBalance(card.balance?.toString() || '');
      setExpirationDate(card.expiration_date || '');
      setNotes(card.notes || '');
    }
    setEditing(false);
    setError('');
  };

  const formatCurrency = (amount, currency = 'USD') => {
    if (!amount && amount !== 0) return 'No balance';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No expiration';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return <Loading fullScreen text="Loading card details..." />;
  }

  if (!card) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage
          message="Card not found"
          onRetry={loadCard}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Card Details</Text>

          {!editing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(true)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Card Image */}
          {card.image_url && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: card.image_url }} style={styles.image} />
            </View>
          )}

          {/* Error Message */}
          {error && (
            <ErrorMessage
              message={error}
              variant="error"
              onRetry={() => setError('')}
            />
          )}

          {editing ? (
            // Edit Mode
            <View style={styles.form}>
              <Input
                label="Store Name *"
                value={storeName}
                onChangeText={setStoreName}
                placeholder="e.g., Starbucks"
              />

              <Input
                label="Card Number"
                value={cardNumber}
                onChangeText={setCardNumber}
                placeholder="Enter card number"
                keyboardType="numeric"
              />

              <Input
                label="Balance"
                value={balance}
                onChangeText={setBalance}
                placeholder="e.g., 25.00"
                keyboardType="decimal-pad"
              />

              <Input
                label="Expiration Date"
                value={expirationDate}
                onChangeText={setExpirationDate}
                placeholder="YYYY-MM-DD"
              />

              <Input
                label="Notes"
                value={notes}
                onChangeText={setNotes}
                placeholder="Add notes about this card"
                multiline
                numberOfLines={3}
              />

              {/* Action Buttons */}
              <View style={styles.editActions}>
                <Button
                  title="Cancel"
                  onPress={handleCancel}
                  variant="outline"
                  style={styles.editActionButton}
                />
                <Button
                  title="Save Changes"
                  onPress={handleSave}
                  loading={saving}
                  style={styles.editActionButton}
                />
              </View>
            </View>
          ) : (
            // View Mode
            <View style={styles.details}>
              {/* Store Name */}
              <View style={styles.detailSection}>
                <Text style={styles.storeName}>{card.store_name}</Text>
              </View>

              {/* Balance */}
              <View style={styles.balanceCard}>
                <Text style={styles.balanceLabel}>Current Balance</Text>
                <Text style={styles.balance}>
                  {formatCurrency(card.balance, card.currency)}
                </Text>
              </View>

              {/* Card Number */}
              {card.card_number && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Card Number</Text>
                  <Text style={styles.infoValue}>
                    •••• •••• •••• {card.card_number.slice(-4)}
                  </Text>
                </View>
              )}

              {/* Expiration */}
              {card.expiration_date && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Expiration Date</Text>
                  <View style={styles.expirationContainer}>
                    <Text style={styles.infoValue}>
                      {formatDate(card.expiration_date)}
                    </Text>
                    <ExpirationBadge
                      expirationDate={card.expiration_date}
                      style={styles.expirationBadge}
                    />
                  </View>
                </View>
              )}

              {/* Card Type */}
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Card Type</Text>
                <Text style={styles.infoValue}>
                  {card.is_online ? '🌐 Online' : '🏪 In-Store'}
                </Text>
              </View>

              {/* Store Address */}
              {card.store_address && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Store Location</Text>
                  <Text style={styles.infoValue}>{card.store_address}</Text>
                </View>
              )}

              {/* Notes */}
              {card.notes && (
                <View style={styles.notesSection}>
                  <Text style={styles.infoLabel}>Notes</Text>
                  <Text style={styles.notesText}>{card.notes}</Text>
                </View>
              )}

              {/* Metadata */}
              <View style={styles.metadataSection}>
                <Text style={styles.metadataText}>
                  Added on {formatDate(card.created_at)}
                </Text>
                {card.updated_at && card.updated_at !== card.created_at && (
                  <Text style={styles.metadataText}>
                    Last updated {formatDate(card.updated_at)}
                  </Text>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                {!card.is_used && (
                  <Button
                    title="Mark as Used"
                    onPress={handleMarkAsUsed}
                    variant="secondary"
                    loading={saving}
                    style={styles.actionButton}
                  />
                )}

                <Button
                  title="Delete Card"
                  onPress={handleDelete}
                  variant="outline"
                  loading={saving}
                  style={[
                    styles.actionButton,
                    { borderColor: COLORS.error },
                  ]}
                  textStyle={{ color: COLORS.error }}
                />
              </View>
            </View>
          )}
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

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },

  backButton: {
    padding: SPACING.sm,
  },

  backButtonText: {
    fontSize: FONTS.sizes['3xl'],
    color: COLORS.primary,
  },

  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
  },

  editButton: {
    padding: SPACING.sm,
  },

  editButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.primary,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: SPACING.md,
  },

  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    marginBottom: SPACING.lg,
    ...SHADOWS.md,
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  form: {
    marginBottom: SPACING.xl,
  },

  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.lg,
  },

  editActionButton: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },

  details: {
    marginBottom: SPACING.xl,
  },

  detailSection: {
    marginBottom: SPACING.lg,
  },

  storeName: {
    fontSize: FONTS.sizes['3xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    textAlign: 'center',
  },

  balanceCard: {
    backgroundColor: COLORS.primary,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    ...SHADOWS.lg,
  },

  balanceLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.background,
    opacity: 0.8,
    marginBottom: SPACING.xs,
  },

  balance: {
    fontSize: FONTS.sizes['4xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.background,
  },

  infoRow: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },

  infoLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },

  infoValue: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
  },

  expirationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  expirationBadge: {
    marginLeft: SPACING.sm,
  },

  notesSection: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },

  notesText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
    lineHeight: FONTS.sizes.base * 1.5,
  },

  metadataSection: {
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },

  metadataText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
    marginBottom: SPACING.xs / 2,
  },

  actions: {
    marginTop: SPACING.xl,
  },

  actionButton: {
    marginBottom: SPACING.sm,
  },
});

export default CardDetailsScreen;