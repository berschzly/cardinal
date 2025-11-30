import { View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';
import Colors from '../../constants/Colors';

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  features,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {onAction && (
        <Button onPress={onAction} style={styles.button}>
          {actionLabel}
        </Button>
      )}
      {features && (
        <View style={styles.features}>
          {features.map((feature, index) => (
            <Text key={index} style={styles.feature}>
              {feature}
            </Text>
          ))}
        </View>
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
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    minWidth: 200,
  },
  features: {
    marginTop: 32,
    alignItems: 'flex-start',
  },
  feature: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
});