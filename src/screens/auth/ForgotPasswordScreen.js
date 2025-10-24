import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import ErrorMessage from '../../components/common/ErrorMessage';
import { COLORS, FONTS, SPACING } from '../../utils/constants';
import { ERROR_MESSAGES, SUCCESS_MESSAGES, VALIDATION } from '../../utils/constants';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { resetPassword } = useAuth();

  const handleResetPassword = async () => {
    // Clear previous messages
    setError('');
    setSuccess(false);

    // Validation
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!VALIDATION.email.regex.test(email.trim())) {
      setError(ERROR_MESSAGES.invalidEmail);
      return;
    }

    // Attempt password reset
    setLoading(true);
    const { error: resetError } = await resetPassword(email.trim());
    setLoading(false);

    if (resetError) {
      setError(resetError);
    } else {
      setSuccess(true);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🔑</Text>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email and we'll send you instructions to reset your password
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {!success ? (
            <>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />

              {/* Error Message */}
              {error && (
                <ErrorMessage
                  message={error}
                  variant="error"
                  onRetry={() => setError('')}
                />
              )}

              {/* Reset Button */}
              <Button
                title="Send Reset Instructions"
                onPress={handleResetPassword}
                loading={loading}
                style={styles.resetButton}
              />
            </>
          ) : (
            <>
              {/* Success Message */}
              <View style={styles.successContainer}>
                <Text style={styles.successIcon}>✅</Text>
                <Text style={styles.successTitle}>Check Your Email</Text>
                <Text style={styles.successText}>
                  We've sent password reset instructions to{' '}
                  <Text style={styles.emailText}>{email}</Text>
                </Text>
                <Text style={styles.successSubtext}>
                  If you don't see the email, check your spam folder.
                </Text>
              </View>

              {/* Resend Button */}
              <Button
                title="Resend Email"
                onPress={handleResetPassword}
                loading={loading}
                variant="outline"
                style={styles.resendButton}
              />
            </>
          )}

          {/* Back to Login Link */}
          <View style={styles.backContainer}>
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text style={styles.backLink}>← Back to Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.xl,
  },

  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },

  logo: {
    fontSize: 64,
    marginBottom: SPACING.md,
  },

  title: {
    fontSize: FONTS.sizes['3xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },

  subtitle: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.md,
  },

  form: {
    width: '100%',
  },

  resetButton: {
    marginTop: SPACING.md,
  },

  successContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.success,
  },

  successIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },

  successTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },

  successText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },

  emailText: {
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.primary,
  },

  successSubtext: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textLight,
    textAlign: 'center',
  },

  resendButton: {
    marginBottom: SPACING.md,
  },

  backContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },

  backLink: {
    fontSize: FONTS.sizes.base,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },
});

export default ForgotPasswordScreen;