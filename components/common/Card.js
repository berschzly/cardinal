import { View, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

export function Card({ children, style, noPadding }) {
  return (
    <View style={[styles.card, !noPadding && styles.padding, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
  },
  padding: {
    padding: 20,
  },
});