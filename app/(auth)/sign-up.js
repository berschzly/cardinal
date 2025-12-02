/**
 * Sign Up Screen
 * 
 * Handles new user registration with email verification.
 * Integrates with Supabase Auth for secure account creation.
 * 
 * Features:
 * - Email format validation
 * - Password strength requirements (minimum 6 characters)
 * - Password confirmation matching
 * - Loading state during registration
 * - Email verification flow
 * - Error handling with user feedback
 * - Keyboard-aware scrolling
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { signUp } from '../../lib/supabase';
import logo from '../../assets/images/logo.png';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  /**
   * Validates registration form inputs
   * Checks for required fields, password strength, matching passwords, and email format
   * @returns {boolean} - True if validation passes, false otherwise
   */
  function validateForm() {
    // Check for empty fields
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    // Validate password length
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return false;
    }

    // Verify passwords match
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  }

  /**
   * Handles user registration
   * Validates form and creates new account via Supabase
   */
  async function handleSignUp() {
    if (!validateForm()) return;

    // Attempt account creation
    setLoading(true);
    const { data, error: signUpError } = await signUp(email, password);
    setLoading(false);

    // Handle registration response
    if (signUpError) {
      Alert.alert('Error', signUpError.message || 'Failed to create account');
    } else {
      Alert.alert(
        'Success! 🎉',
        'Check your email to verify your account, then sign in.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/sign-in') }]
      );
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header with logo and close button */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <Image 
                  source={logo} 
                  style={styles.logoImage}
                  resizeMode="contain"
                />
              </View>
            </View>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => router.push('/(auth)/welcome')}
              accessibilityLabel="Close and return to welcome"
            >
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Title and description */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>Create your account</Text>
            <Text style={styles.subtitle}>
              Store and manage all your gift cards in one secure place
            </Text>
          </View>

          {/* Registration form */}
          <View style={styles.form}>
            {/* Email input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Your email address"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                editable={!loading}
              />
            </View>

            {/* Password input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            {/* Password confirmation input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter your password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
          </View>

          {/* Submit button */}
          <TouchableOpacity 
            style={[styles.continueButton, loading && styles.continueButtonDisabled]}
            onPress={handleSignUp}
            disabled={loading}
            activeOpacity={0.8}
            accessibilityLabel="Create account"
          >
            <Text style={styles.continueButtonText}>
              {loading ? 'Creating Account...' : 'Continue'}
            </Text>
          </TouchableOpacity>

          {/* Navigation to sign in */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity 
              onPress={() => router.push('/(auth)/sign-in')}
              accessibilityLabel="Sign in to existing account"
            >
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  logoContainer: {
    flex: 1,
  },
  logo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoEmoji: {
    fontSize: 28,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '400',
  },

  // Title Section
  titleSection: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#9CA3AF',
    lineHeight: 24,
  },

  // Form
  form: {
    marginBottom: 32,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    height: 56,
    backgroundColor: '#1F1F1F',
    borderWidth: 2,
    borderColor: '#DC2626',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '400',
  },

  // Continue Button
  continueButton: {
    height: 56,
    backgroundColor: '#DC2626',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 15,
    fontWeight: '400',
    color: '#9CA3AF',
  },
  footerLink: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: 25,
  },
});