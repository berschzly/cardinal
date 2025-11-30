import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

export function PremiumBadge({ size = 'medium' }) {
  return (
    <View style={[styles.badge, styles[size]]}>
      <Text style={[styles.text, styles[`${size}Text`]]}>✨ Premium</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    backgroundColor: Colors.premiumGold,
    borderRadius: 12,
    alignSelf: 'flex-start',
    overflow: 'hidden',
  },
  small: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  medium: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  large: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  text: {
    color: Colors.background,
    fontWeight: '700',
  },
  smallText: {
    fontSize: 10,
  },
  mediumText: {
    fontSize: 12,
  },
  largeText: {
    fontSize: 14,
  },
});