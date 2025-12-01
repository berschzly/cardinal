// Individual card detail screen - Updated with matching card preview

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { getCard, deleteCard } from '../../lib/supabase';
import BarcodeDisplay from '../../components/modals/BarcodeDisplay';
import { formatDate, getExpirationStatus } from '../../utils/dateHelpers';
import { cancelCardNotifications } from '../../lib/notifications';
import { formatCardNumberDisplay, getMaskedCardNumber } from '../../utils/formatter';
import { LoadingScreen } from '../../components/common';

export default function CardDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFullNumber, setShowFullNumber] = useState(false);
  const [showPin, setShowPin] = useState(false);

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
    router.push(`/card/edit/${id}`);
  }

  async function handleShare() {
    try {
      const message = `${card.name}${card.brand ? ` (${card.brand})` : ''}\n` +
        `Balance: $${parseFloat(card.balance || 0).toFixed(2)}\n` +
        `Card: ${card.card_number || 'N/A'}${card.pin ? `\nPIN: ${card.pin}` : ''}`;
      
      await Share.share({
        message,
        title: `${card.name} Details`,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  }

  function handleDelete() {
    Alert.alert(
      'Delete Card',
      `Are you sure you want to delete "${card.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await cancelCardNotifications(id);
            const { error } = await deleteCard(id);
            if (error) {
              Alert.alert('Error', 'Failed to delete card');
            } else {
              router.push('/(tabs)');
            }
          },
        },
      ]
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingScreen message="Loading card..." icon="card-outline" />
      </SafeAreaView>
    );
  }

  if (!card) return null;

  const expirationStatus = card.expiration_date ? getExpirationStatus(card.expiration_date) : null;
  const balance = parseFloat(card.balance || 0);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          accessible={true}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Card Details</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEdit}
          accessible={true}
          accessibilityLabel="Edit card"
          accessibilityRole="button"
        >
          <Ionicons name="create-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Card Preview - Updated to match CardItem */}
        <View style={styles.cardSection}>
          <LinearGradient
            colors={['#3A1515', '#2A1515', '#1F1F1F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cardPreview}
          >
            {/* Subtle red accent overlay */}
            <View style={styles.redAccent} />
            
            {/* Decorative elements */}
            <View style={styles.decorCircle1} />
            <View style={styles.decorCircle2} />

            {/* Card Content */}
            <View style={styles.cardContent}>
              {/* Brand */}
              {card.brand && (
                <View style={styles.brandContainer}>
                  <Text style={styles.brand}>{card.brand.toUpperCase()}</Text>
                </View>
              )}

              {/* Main Content */}
              <View style={styles.cardMain}>
                <Text style={styles.cardName} numberOfLines={2}>
                  {card.name}
                </Text>

                <View style={styles.balanceContainer}>
                  <Text style={styles.balanceLabel}>BALANCE</Text>
                  <Text style={styles.cardBalance}>
                    ${balance.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.cardFooter}>
                {card.card_number && (
                  <View style={styles.cardNumberContainer}>
                    <Ionicons name="card-outline" size={14} color="#D1D5DB" />
                    <Text style={styles.cardNumber}>
                      •••• {card.card_number.slice(-4)}
                    </Text>
                  </View>
                )}
                {card.expiration_date && expirationStatus && (
                  <View style={styles.expirationContainer}>
                    <View 
                      style={[
                        styles.statusDot,
                        { backgroundColor: expirationStatus.urgency === 'error' ? '#DC2626' : '#EF4444' }
                      ]} 
                    />
                    <Text style={styles.expirationText}>
                      {formatDate(card.expiration_date, 'short')}
                    </Text>
                  </View>
                )}
              </View>

              {/* Chip */}
              <View style={styles.chip}>
                <View style={styles.chipInner} />
              </View>
            </View>
          </LinearGradient>

          {/* Expiration Warning */}
          {expirationStatus && expirationStatus.urgency !== 'none' && (
            <View style={styles.warningBanner}>
              <Ionicons name="time-outline" size={20} color="#DC2626" />
              <Text style={styles.warningText}>
                {expirationStatus.label} - {expirationStatus.daysUntil} days remaining
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShare}
            accessible={true}
            accessibilityLabel="Share card"
            accessibilityRole="button"
          >
            <Ionicons name="share-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.actionButtonDanger]}
            onPress={handleDelete}
            accessible={true}
            accessibilityLabel="Delete card"
            accessibilityRole="button"
          >
            <Ionicons name="trash-outline" size={20} color="#DC2626" />
            <Text style={[styles.actionButtonText, styles.actionButtonTextDanger]}>
              Delete
            </Text>
          </TouchableOpacity>
        </View>

        {/* Barcode Section */}
        {card.card_number && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scannable Barcode</Text>
            <View style={styles.barcodeCard}>
              <Text style={styles.barcodeInstructions}>
                Show this code at checkout to use your gift card
              </Text>
              <BarcodeDisplay card={card} />
            </View>
          </View>
        )}

        {/* Security Info */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Security Info</Text>
            <View style={styles.encryptedBadge}>
              <Ionicons name="lock-closed" size={12} color="#10B981" />
              <Text style={styles.encryptedText}>Encrypted</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            {card.card_number && (
              <>
                <TouchableOpacity
                  style={styles.infoRow}
                  onPress={() => setShowFullNumber(!showFullNumber)}
                  activeOpacity={0.7}
                  accessible={true}
                  accessibilityLabel={showFullNumber ? "Hide card number" : "Show card number"}
                  accessibilityRole="button"
                >
                  <View style={styles.infoLeft}>
                    <Text style={styles.infoLabel}>Card Number</Text>
                    <Text style={styles.infoValue}>
                      {showFullNumber 
                        ? formatCardNumberDisplay(card.card_number)
                        : getMaskedCardNumber(card.card_number)
                      }
                    </Text>
                  </View>
                  <Ionicons 
                    name={showFullNumber ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color="#9CA3AF" 
                  />
                </TouchableOpacity>

                {card.pin && <View style={styles.infoDivider} />}
              </>
            )}

            {card.pin && (
              <TouchableOpacity
                style={styles.infoRow}
                onPress={() => setShowPin(!showPin)}
                activeOpacity={0.7}
                accessible={true}
                accessibilityLabel={showPin ? "Hide PIN" : "Show PIN"}
                accessibilityRole="button"
              >
                <View style={styles.infoLeft}>
                  <Text style={styles.infoLabel}>PIN</Text>
                  <Text style={styles.infoValue}>
                    {showPin ? card.pin : '••••••••'}
                  </Text>
                </View>
                <Ionicons 
                  name={showPin ? "eye-off-outline" : "eye-outline"} 
                  size={20} 
                  color="#9CA3AF" 
                />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Card Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>

          <View style={styles.infoCard}>
            {/* Balance */}
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Text style={styles.infoLabel}>Current Balance</Text>
                <Text style={styles.infoValue}>${balance.toFixed(2)}</Text>
              </View>
              {balance > 0 && (
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              )}
            </View>

            {/* Expiration */}
            {card.expiration_date && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                    <Text style={styles.infoLabel}>Expiration Date</Text>
                    <Text style={styles.infoValue}>
                      {formatDate(card.expiration_date, 'long')}
                    </Text>
                    {expirationStatus && expirationStatus.daysUntil > 0 && (
                      <Text style={styles.infoHelper}>
                        {expirationStatus.daysUntil} days remaining
                      </Text>
                    )}
                  </View>
                </View>
              </>
            )}

            {/* Notes */}
            {card.notes && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoLeft}>
                    <Text style={styles.infoLabel}>Notes</Text>
                    <Text style={styles.infoValueMultiline}>{card.notes}</Text>
                  </View>
                </View>
              </>
            )}

            {/* Added Date */}
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <View style={styles.infoLeft}>
                <Text style={styles.infoLabel}>Added</Text>
                <Text style={styles.infoValue}>
                  {formatDate(card.created_at, 'long')}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F1F1F',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Content
  content: {
    padding: 24,
  },

  // Card Section - Updated to match CardItem
  cardSection: {
    marginBottom: 24,
  },
  cardPreview: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#DC262650',
    minHeight: 200,
    overflow: 'hidden',
    position: 'relative',
  },
  redAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#DC2626',
    opacity: 0.12,
  },
  decorCircle1: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#DC2626',
    opacity: 0.15,
  },
  decorCircle2: {
    position: 'absolute',
    bottom: -40,
    left: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#DC2626',
    opacity: 0.12,
  },
  cardContent: {
    padding: 24,
    minHeight: 200,
    justifyContent: 'space-between',
    zIndex: 1,
  },
  brandContainer: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  brand: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 2,
  },
  cardMain: {
    flex: 1,
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    lineHeight: 30,
  },
  balanceContainer: {
    marginTop: 8,
  },
  balanceLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#F87171',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  cardBalance: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  },
  cardNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cardNumber: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E7EB',
    letterSpacing: 1.5,
  },
  expirationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  expirationText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E7EB',
  },
  chip: {
    position: 'absolute',
    top: 20,
    right: 24,
    width: 48,
    height: 38,
    borderRadius: 6,
    backgroundColor: 'rgba(220, 38, 38, 0.25)',
    padding: 4,
  },
  chipInner: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },

  // Warning Banner
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#DC262620',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#DC262640',
  },
  warningText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  actionButtonDanger: {
    backgroundColor: '#DC262610',
    borderColor: '#DC2626',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtonTextDanger: {
    color: '#DC2626',
  },

  // Sections
  section: {
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
  encryptedBadge: {
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
  encryptedText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },

  // Barcode Card
  barcodeCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  barcodeInstructions: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },

  // Info Card
  infoCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLeft: {
    flex: 1,
    marginRight: 16,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 6,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoValueMultiline: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  infoHelper: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 4,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginVertical: 16,
  },

  // Badges
  activeBadge: {
    backgroundColor: '#10B98120',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#10B981',
  },

  bottomSpacer: {
    height: 40,
  },
});