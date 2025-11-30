import { View, Text, TextInput, StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

export function FormInput({
  label,
  value,
  onChangeText,
  onBlur,
  error,
  touched,
  required,
  placeholder,
  helperText,
  multiline,
  numberOfLines,
  secureTextEntry,
  keyboardType,
  maxLength,
  ...props
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        {label} {required && <Text style={styles.required}>*</Text>}
      </Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.multiline,
          touched && error && styles.inputError,
        ]}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical={multiline ? 'top' : 'center'}
        {...props}
      />
      {helperText && !error && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
      {touched && error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  required: {
    color: Colors.error,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  multiline: {
    minHeight: 100,
    paddingTop: 16,
  },
  inputError: {
    borderColor: Colors.error,
    borderWidth: 2,
  },
  helperText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 6,
    fontStyle: 'italic',
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
});