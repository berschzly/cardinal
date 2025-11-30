import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { formatDate, getExpirationStatus } from '../../utils/dateHelpers';

export default function CardItem({ card }) {
  const router = useRouter();
  const expirationStatus = card.expiration_date ? getExpirationStatus(card.expiration_date) : null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/card/${card.id}`)}
      activeOpacity={0.9}
      accessible={true}
      accessibilityLabel={`${card.name} gift card, balance ${card.balance ? '$' + parseFloat(card.balance).toFixed(2) : 'unknown'}`}
      accessibilityRole="button"
    >
      <LinearGradient
        colors={['#3A1515', '#2A1515', '#1F1F1F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Subtle red accent overlay */}
        <View style={styles.redAccent} />
        
        {/* Decorative elements */}
        <View style={styles.decorCircle1} />
        <View style={styles.decorCircle2} />

        {/* Card Content */}
        <View style={styles.content}>
          {/* Header: Brand (if exists) */}
          {card.brand && (
            <View style={styles.brandContainer}>
              <Text style={styles.brand} numberOfLines={1} ellipsizeMode="tail">
                {card.brand.toUpperCase()}
              </Text>
            </View>
          )}

          {/* Main Content Area */}
          <View style={styles.mainContent}>
            {/* Card Name */}
            <Text 
              style={styles.name} 
              numberOfLines={2} 
              ellipsizeMode="tail"
              adjustsFontSizeToFit
              minimumFontScale={0.8}
            >
              {card.name}
            </Text>

            {/* Balance - Large and prominent */}
            {card.balance !== null && card.balance !== undefined && (
              <View style={styles.balanceContainer}>
                <Text style={styles.balanceLabel}>BALANCE</Text>
                <Text 
                  style={styles.balance}
                  adjustsFontSizeToFit
                  numberOfLines={1}
                  minimumFontScale={0.7}
                >
                  ${parseFloat(card.balance).toFixed(2)}
                </Text>
              </View>
            )}
          </View>

          {/* Footer: Card Number and Expiration */}
          <View style={styles.footer}>
            {/* Card Number */}
            {card.card_number && (
              <View style={styles.cardNumberContainer}>
                <Ionicons name="card-outline" size={14} color="#D1D5DB" />
                <Text 
                  style={styles.cardNumber}
                  numberOfLines={1}
                  ellipsizeMode="middle"
                >
                  •••• {card.card_number.slice(-4)}
                </Text>
              </View>
            )}

            {/* Expiration */}
            {card.expiration_date && expirationStatus && (
              <View style={styles.expirationContainer}>
                <View
                  style={[
                    styles.statusDot,
                    { backgroundColor: expirationStatus.urgency === 'error' ? '#DC2626' : '#EF4444' },
                  ]}
                />
                <Text 
                  style={styles.expiration}
                  numberOfLines={1}
                >
                  {formatDate(card.expiration_date, 'short')}
                </Text>
              </View>
            )}
          </View>

          {/* Chip/Security Element */}
          <View style={styles.chip}>
            <View style={styles.chipInner} />
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#DC262650',
    minHeight: 200,
    position: 'relative',
    overflow: 'hidden',
  },
  
  // Subtle red accent overlay
  redAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#DC2626',
    opacity: 0.12,
  },
  
  // Decorative elements
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

  // Content
  content: {
    padding: 24,
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 200,
    zIndex: 1,
  },

  // Brand
  brandContainer: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  brand: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EF4444',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },

  // Main content
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
    lineHeight: 30,
  },

  // Balance
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
  balance: {
    fontSize: 40,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -1,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  cardNumberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
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
  expiration: {
    fontSize: 13,
    fontWeight: '600',
    color: '#E5E7EB',
  },

  // Chip element (like on credit cards)
  chip: {
    position: 'absolute',
    top: 20,
    right: 24,
    width: 48,
    height: 38,
    borderRadius: 6,
    backgroundColor: 'rgba(220, 38, 38, 0.25)',
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipInner: {
    width: '100%',
    height: '100%',
    borderRadius: 3,
    backgroundColor: 'rgba(220, 38, 38, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(220, 38, 38, 0.3)',
  },
});