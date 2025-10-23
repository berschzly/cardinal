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
import { ERROR_MESSAGES, VALIDATION } from '../../utils/constants';

const SignupScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signUp } = useAuth();

  const validateForm = () => {
    // Full name validation
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return false;
    }

    if (fullName.trim().length < VALIDATION.name.minLength) {
      setError(`Name must be at least ${VALIDATION.name.minLength} characters`);
      return false;
    }

    // Email validation
    if (!email.trim()) {
      setError('Please enter your email');
      return false;
    }

    if (!VALIDATION.email.regex.test(email.trim())) {
      setError(ERROR_MESSAGES.invalidEmail);
      return false;
    }

    // Password validation
    if (!password) {
      setError('Please enter a password');
      return false;
    }

    if (password.length < VALIDATION.password.minLength) {
      setError(ERROR_MESSAGES.weakPassword);
      return false;
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSignup = async () => {
    // Clear previous errors
    setError('');

    // Validate form
    if (!validateForm()) {
      return;
    }

    // Attempt signup
    setLoading(true);
    const { error: signUpError } = await signUp(
      email.trim(),
      password,
      fullName.trim()
    );
    setLoading(false);

    if (signUpError) {
      setError(signUpError);
    }
    // If successful, AuthContext will handle navigation
  };

  const handleLogin = () => {
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
          <Text style={styles.logo}>🎁</Text>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Sign up to get started with Cardinal</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Input
            label="Full Name"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Enter your full name"
            autoCapitalize="words"
            autoComplete="name"
          />

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
          />

          <Input
            label="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password-new"
          />

          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password must:</Text>
            <Text style={styles.requirementText}>• Be at least 8 characters</Text>
          </View>

          {/* Error Message */}
          {error && (
            <ErrorMessage
              message={error}
              variant="error"
              onRetry={() => setError('')}
            />
          )}

          {/* Signup Button */}
          <Button
            title="Sign Up"
            onPress={handleSignup}
            loading={loading}
            style={styles.signupButton}
          />

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}>Sign In</Text>
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
  },

  form: {
    width: '100%',
  },

  requirementsContainer: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: SPACING.sm,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },

  requirementsTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },

  requirementText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs / 2,
  },

  signupButton: {
    marginTop: SPACING.md,
  },

  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },

  loginText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
  },

  loginLink: {
    fontSize: FONTS.sizes.base,
    color: COLORS.primary,
    fontWeight: FONTS.weights.semiBold,
  },
});

export default SignupScreen;