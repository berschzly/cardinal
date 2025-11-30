import { View, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

const styles = StyleSheet.create({
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 12,
  },
});