import { View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';
import Colors from '../../constants/Colors';

export function ErrorState({
  title = 'Something Went Wrong',
  message,
  onRetry,
  onSecondaryAction,
  secondaryActionLabel,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>⚠️</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <Button onPress={onRetry} style={styles.button}>
          Try Again
        </Button>
      )}
      {onSecondaryAction && (
        <Button 
          variant="secondary" 
          onPress={onSecondaryAction}
          style={styles.secondaryButton}
        >
          {secondaryActionLabel}
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    minWidth: 200,
    marginBottom: 12,
  },
  secondaryButton: {
    minWidth: 200,
  },
});