import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';

export default function SimpleLoadingScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.loaderBox}>
        <ActivityIndicator size="large" color="#DC2626" />
      </View>
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1F1F1F',
    borderWidth: 2,
    borderColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    marginTop: 16,
    color: '#fff',
    fontSize: 16,
    opacity: 0.8,
  },
});