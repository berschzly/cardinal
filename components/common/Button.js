import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

export function Button({
  children,
  onPress,
  variant = 'primary', // primary, secondary, danger, ghost
  loading,
  disabled,
  style,
  textStyle,
  ...props
}) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        isDisabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      accessible={true}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          color={variant === 'primary' ? '#FFFFFF' : '#DC2626'} 
          size="small"
        />
      ) : (
        <Text style={[styles.text, styles[`${variant}Text`], textStyle]}>
          {children}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 28,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primary: {
    backgroundColor: '#DC2626',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  secondary: {
    backgroundColor: '#1F1F1F',
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  danger: {
    backgroundColor: '#1F1F1F',
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  primaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  secondaryText: {
    color: '#DC2626',
    fontWeight: '700',
  },
  dangerText: {
    color: '#EF4444',
    fontWeight: '700',
  },
  ghostText: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
});