import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/constants';

/**
 * Reusable Input Component
 * @param {string} label - Input label
 * @param {string} value - Input value
 * @param {Function} onChangeText - Function to call on text change
 * @param {string} placeholder - Placeholder text
 * @param {boolean} secureTextEntry - Hide text (for passwords)
 * @param {string} error - Error message to display
 * @param {boolean} disabled - Disable input
 * @param {string} keyboardType - Keyboard type
 * @param {boolean} multiline - Allow multiple lines
 * @param {number} numberOfLines - Number of lines for multiline
 * @param {Object} style - Additional container styles
 * @param {Object} inputStyle - Additional input styles
 */
const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  error,
  disabled = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete = 'off',
  autoCorrect = false,
  multiline = false,
  numberOfLines = 1,
  style,
  inputStyle,
  leftIcon,
  rightIcon,
  onRightIconPress,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  return (
    <View style={[styles.container, style]}>
      {/* Label */}
      {label && <Text style={styles.label}>{label}</Text>}

      {/* Input Container */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
        ]}
      >
        {/* Left Icon */}
        {leftIcon && <View style={styles.leftIconContainer}>{leftIcon}</View>}

        {/* Text Input */}
        <TextInput
          style={[
            styles.input,
            multiline && styles.inputMultiline,
            leftIcon && styles.inputWithLeftIcon,
            (rightIcon || secureTextEntry) && styles.inputWithRightIcon,
            disabled && styles.inputDisabled,
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={COLORS.placeholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          editable={!disabled}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          autoCorrect={autoCorrect}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />

        {/* Right Icon or Password Toggle */}
        {secureTextEntry && (
          <TouchableOpacity
            onPress={togglePasswordVisibility}
            style={styles.rightIconContainer}
          >
            <Text style={styles.passwordToggle}>
              {isPasswordVisible ? '👁️' : '👁️‍🗨️'}
            </Text>
          </TouchableOpacity>
        )}

        {rightIcon && !secureTextEntry && (
          <TouchableOpacity
            onPress={onRightIconPress}
            style={styles.rightIconContainer}
            disabled={!onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {/* Error Message */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },

  label: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
  },

  inputContainerFocused: {
    borderWidth: 2,
    borderColor: COLORS.borderFocus,
  },

  inputContainerError: {
    borderColor: COLORS.error,
  },

  inputContainerDisabled: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.border,
  },

  input: {
    flex: 1,
    fontSize: FONTS.sizes.base,
    color: COLORS.text,
    paddingVertical: SPACING.md,
  },

  inputMultiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: SPACING.md,
  },

  inputWithLeftIcon: {
    marginLeft: SPACING.sm,
  },

  inputWithRightIcon: {
    marginRight: SPACING.sm,
  },

  inputDisabled: {
    color: COLORS.textMuted,
  },

  leftIconContainer: {
    marginRight: SPACING.xs,
  },

  rightIconContainer: {
    marginLeft: SPACING.xs,
    padding: SPACING.xs,
  },

  passwordToggle: {
    fontSize: FONTS.sizes.lg,
  },

  errorText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.error,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});

export default Input;