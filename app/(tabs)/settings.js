// Settings & preferences

import { View, Text, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

export default function Settings() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings Screen (Coming Next)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: Colors.text,
    fontSize: 18,
  },
});