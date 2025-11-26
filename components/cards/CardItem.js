import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Colors, { CardGradients, Shadows } from '../../constants/Colors';
import { formatDate, getExpirationStatus } from '../../utils/dateHelpers';

export default function CardItem({ card }) {
  const router = useRouter();
  const expirationStatus = getExpirationStatus(card.expiration_date);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => router.push(`/card/${card.id}`)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={CardGradients.default}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {/* Top Row: Name and Brand */}
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {card.name}
          </Text>
          {card.brand && (
            <Text style={styles.brand} numberOfLines={1}>
              {card.brand}
            </Text>
          )}
        </View>

        {/* Balance */}
        {card.balance && (
          <Text style={styles.balance}>
            ${parseFloat(card.balance).toFixed(2)}
          </Text>
        )}

        {/* Bottom Row: Card Number and Expiration */}
        <View style={styles.bottomRow}>
          {card.card_number && (
            <Text style={styles.cardNumber}>
              •••• {card.card_number.slice(-4)}
            </Text>
          )}
          {card.expiration_date && (
            <View style={styles.expirationContainer}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: Colors[expirationStatus.urgency] },
                ]}
              />
              <Text style={styles.expiration}>
                {formatDate(card.expiration_date, 'short')}
              </Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: 16,
    ...Shadows.card,
  },
  gradient: {
    borderRadius: 16,
    padding: 20,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  brand: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    textTransform: 'uppercase',
  },
  balance: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.text,
    marginVertical: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 2,
  },
  expirationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  expiration: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
});