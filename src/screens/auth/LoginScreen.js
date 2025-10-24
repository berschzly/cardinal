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
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/constants';
import { ERROR_MESSAGES } from '../../utils/constants';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuth();

  const handleLogin = async () => {
    // Clear previous errors
    setError('');

    // Validation
    if (!email.trim()) {
      setError('Please enter your email');
      return;
    }

    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }

    // Attempt login
    setLoading(true);
    const { error: signInError } = await signIn(email.trim(), password);
    setLoading(false);

    if (signInError) {
      setError(signInError);
    }
  };

  const handleForgotPassword = () => {
    navigation.navigate('ForgotPassword');
  };

  const handleSignUp = () => {
    navigation.navigate('Signup');
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
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue to Cardinal</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
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
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="password"
          />

          {/* Forgot Password Link */}
          <TouchableOpacity
            onPress={handleForgotPassword}
            style={styles.forgotPasswordButton}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          {/* Error Message */}
          {error && (
            <ErrorMessage
              message={error}
              variant="error"
              onRetry={() => setError('')}
            />
          )}

          {/* Login Button */}
          <Button
            title="Sign In"
            onPress={handleLogin}
            loading={loading}
            style={styles.loginButton}
          />

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signupLink}>Sign Up</Text>
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

  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.lg,
  },

  forgotPasswordText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },

  loginButton: {
    marginTop: SPACING.md,
  },

  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },

  signupText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
  },

  signupLink: {
    fontSize: FONTS.sizes.base,
    color: COLORS.primary,
    fontWeight: FONTS.weights.semiBold,
  },
});

export default LoginScreen;