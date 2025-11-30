import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

export function Banner({ 
  type = 'info', // info, warning, error, success
  message, 
  onDismiss,
  icon,
  style 
}) {
  return (
    <View style={[styles.banner, styles[type], style]}>
      <Text style={[styles.text, styles[`${type}Text`]]}>
        {icon} {message}
      </Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={[styles.dismiss, styles[`${type}Text`]]}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderLeftWidth: 4,
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    backgroundColor: Colors.primary + '20',
    borderLeftColor: Colors.primary,
  },
  warning: {
    backgroundColor: Colors.warning + '30',
    borderLeftColor: Colors.warning,
  },
  error: {
    backgroundColor: Colors.error + '20',
    borderLeftColor: Colors.error,
  },
  success: {
    backgroundColor: Colors.success + '20',
    borderLeftColor: Colors.success,
  },
  text: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  infoText: {
    color: Colors.primary,
  },
  warningText: {
    color: Colors.background,
  },
  errorText: {
    color: Colors.error,
  },
  successText: {
    color: Colors.success,
  },
  dismiss: {
    fontSize: 20,
    fontWeight: '700',
    paddingLeft: 12,
  },
});