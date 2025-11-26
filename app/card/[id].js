// Individual card detail screen

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { getCard, deleteCard } from '../../lib/supabase';
import BarcodeDisplay from '../../components/modals/BarcodeDisplay';
import Colors, { CardGradients, Shadows } from '../../constants/Colors';
import { formatDate, getExpirationStatus } from '../../utils/dateHelpers';

export default function CardDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCard();
  }, [id]);

  async function loadCard() {
    const { data, error } = await getCard(id);
    if (error) {
      Alert.alert('Error', 'Failed to load card');
      router.back();
    } else {
      setCard(data);
    }
    setLoading(false);
  }

  function handleEdit() {
    // Navigate to edit screen (we'll build this next)
    router.push(`/card/edit/${id}`);
  }

  function handleDelete() {
    Alert.alert(
      'Delete Card',
      'Are you sure you want to delete this card? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteCard(id);
            if (error) {
              Alert.alert('Error', 'Failed to delete card');
            } else {
              Alert.alert('Success', 'Card deleted', [
                { text: 'OK', onPress: () => router.push('/(tabs)') },
              ]);
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!card) return null;

  const expirationStatus = getExpirationStatus(card.expiration_date);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Card Preview */}
        <LinearGradient
          colors={CardGradients.default}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardPreview}
        >
          <Text style={styles.cardName}>{card.name}</Text>
          {card.brand && <Text style={styles.cardBrand}>{card.brand}</Text>}
          {card.balance && (
            <Text style={styles.cardBalance}>
              ${parseFloat(card.balance).toFixed(2)}
            </Text>
          )}
          {card.card_number && (
            <Text style={styles.cardNumber}>
              •••• {card.card_number.slice(-4)}
            </Text>
          )}
        </LinearGradient>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>Edit Card</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>

        {/* Card Details */}
        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Card Details</Text>

          {card.card_number && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Card Number</Text>
              <Text style={styles.detailValue}>{card.card_number}</Text>
            </View>
          )}

          {card.pin && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>PIN</Text>
              <Text style={styles.detailValue}>{card.pin}</Text>
            </View>
          )}

          {card.expiration_date && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Expires</Text>
              <View style={styles.expirationRow}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: Colors[expirationStatus.urgency] },
                  ]}
                />
                <Text style={styles.detailValue}>
                  {formatDate(card.expiration_date, 'long')}
                </Text>
              </View>
            </View>
          )}

          {card.notes && (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Notes</Text>
              <Text style={styles.detailValue}>{card.notes}</Text>
            </View>
          )}

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Added</Text>
            <Text style={styles.detailValue}>
              {formatDate(card.created_at, 'long')}
            </Text>
          </View>
        </View>

        {/* Barcode */}
        {card.barcode_value && card.barcode_type && (
          <View style={styles.barcodeContainer}>
            <Text style={styles.sectionTitle}>Barcode</Text>
            <BarcodeDisplay
              value={card.barcode_value}
              type={card.barcode_type}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 20,
  },
  cardPreview: {
    borderRadius: 16,
    padding: 24,
    minHeight: 180,
    justifyContent: 'space-between',
    ...Shadows.card,
  },
  cardName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  cardBrand: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  cardBalance: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
  },
  cardNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  editButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  editButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.error,
  },
  deleteButtonText: {
    color: Colors.error,
    fontSize: 16,
    fontWeight: '600',
  },
  detailsContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.text,
  },
  expirationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  barcodeContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginTop: 20,
  },
});