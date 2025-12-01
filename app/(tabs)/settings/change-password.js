// app/(tabs)/settings/change-password.js
// Change Password Screen - Optimized

import { useState, useCallback, memo, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { handleAsync } from '../../../utils/errorHandling';
import { isValidPassword } from '../../../utils/validation';

const PasswordInput = memo(({ label, value, onChangeText, show, toggleShow, placeholder }) => (
  <View style={styles.inputGroup}>
    <Text style={styles.inputLabel}>{label}</Text>
    <View style={styles.inputCard}>
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed-outline" size={20} color="#9CA3AF" />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#6B7280"
          secureTextEntry={!show}
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="off"
        />
        <TouchableOpacity
          onPress={toggleShow}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          accessible={true}
          accessibilityLabel={show ? "Hide password" : "Show password"}
          accessibilityRole="button"
        >
          <Ionicons 
            name={show ? "eye-outline" : "eye-off-outline"} 
            size={20} 
            color="#9CA3AF" 
          />
        </TouchableOpacity>
      </View>
    </View>
  </View>
));

const HeroSection = memo(() => (
  <View style={styles.heroSection}>
    <View style={styles.heroIcon}>
      <Ionicons name="shield-checkmark" size={40} color="#FFFFFF" />
    </View>
    <Text style={styles.heroTitle}>Update Your Password</Text>
    <Text style={styles.heroSubtitle}>
      Choose a strong password to keep your account secure
    </Text>
  </View>
));

const RequirementItem = memo(({ met, text }) => (
  <View style={styles.requirementItem}>
    <Ionicons 
      name={met ? "checkmark-circle" : "ellipse-outline"} 
      size={20} 
      color={met ? "#10B981" : "#6B7280"} 
    />
    <Text style={[styles.requirementText, met && styles.requirementMet]}>
      {text}
    </Text>
  </View>
));

const TipCard = memo(() => (
  <View style={styles.tipCard}>
    <View style={styles.tipIconContainer}>
      <Ionicons name="information-circle" size={24} color="#3B82F6" />
    </View>
    <View style={styles.tipContent}>
      <Text style={styles.tipTitle}>Security Tip</Text>
      <Text style={styles.tipText}>
        Use a unique password you don't use on other websites. Consider using a password manager.
      </Text>
    </View>
  </View>
));

export default function ChangePassword() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const passwordStrength = useMemo(() => {
    if (newPassword.length === 0) return null;
    if (newPassword.length < 8) return { text: 'Weak', color: '#DC2626', width: '25%' };
    if (newPassword.length < 12) return { text: 'Fair', color: '#F59E0B', width: '50%' };
    if (!/[A-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      return { text: 'Good', color: '#3B82F6', width: '75%' };
    }
    return { text: 'Strong', color: '#10B981', width: '100%' };
  }, [newPassword]);

  const requirements = useMemo(() => [
    { met: newPassword.length >= 8, text: 'At least 8 characters' },
    { met: /[A-Z]/.test(newPassword), text: 'One uppercase letter' },
    { met: /[0-9]/.test(newPassword), text: 'One number' },
  ], [newPassword]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const toggleCurrentPassword = useCallback(() => {
    setShowCurrentPassword(prev => !prev);
  }, []);

  const toggleNewPassword = useCallback(() => {
    setShowNewPassword(prev => !prev);
  }, []);

  const toggleConfirmPassword = useCallback(() => {
    setShowConfirmPassword(prev => !prev);
  }, []);

  const handleChangePassword = useCallback(async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const passwordValidation = isValidPassword(newPassword);
    if (!passwordValidation.isValid) {
      Alert.alert('Invalid Password', passwordValidation.error);
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    const verifyResult = await handleAsync(
      async () => {
        const { error } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: currentPassword,
        });
        if (error) throw error;
        return { data: { success: true } };
      },
      { showDefaultError: false }
    );

    if (verifyResult.error) {
      setLoading(false);
      Alert.alert('Error', 'Current password is incorrect');
      return;
    }

    const result = await handleAsync(
      async () => {
        const { error } = await supabase.auth.updateUser({ 
          password: newPassword 
        });
        if (error) throw error;
        return { data: { success: true } };
      },
      { showDefaultError: false }
    );
    
    setLoading(false);

    if (result.error) {
      Alert.alert('Update Failed', result.error);
      return;
    }

    Alert.alert(
      'Success',
      'Your password has been changed successfully',
      [{ text: 'OK', onPress: () => router.back() }]
    );
  }, [currentPassword, newPassword, confirmPassword, router]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#141414" />
      
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          accessible={true}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <HeroSection />

        <View style={styles.section}>
          <PasswordInput
            label="Current Password"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            show={showCurrentPassword}
            toggleShow={toggleCurrentPassword}
            placeholder="Enter current password"
          />

          <PasswordInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            show={showNewPassword}
            toggleShow={toggleNewPassword}
            placeholder="Enter new password"
          />

          {passwordStrength && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBar}>
                <View 
                  style={[
                    styles.strengthFill, 
                    { 
                      width: passwordStrength.width,
                      backgroundColor: passwordStrength.color 
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                {passwordStrength.text}
              </Text>
            </View>
          )}

          <PasswordInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            show={showConfirmPassword}
            toggleShow={toggleConfirmPassword}
            placeholder="Re-enter new password"
          />
        </View>

        <View style={styles.requirementsCard}>
          <Text style={styles.requirementsTitle}>Password Requirements</Text>
          <View style={styles.requirementsList}>
            {requirements.map((req, idx) => (
              <RequirementItem key={idx} met={req.met} text={req.text} />
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.updateButton}
          onPress={handleChangePassword}
          disabled={loading}
          activeOpacity={0.8}
          accessible={true}
          accessibilityLabel="Update password"
          accessibilityRole="button"
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.updateButtonText}>Update Password</Text>
          )}
        </TouchableOpacity>

        <TipCard />

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1F1F1F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  headerRight: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },

  // Hero Section
  heroSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 22,
  },

  // Form Section
  section: {
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  inputCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    padding: 0,
  },

  // Password Strength
  strengthContainer: {
    marginTop: -8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  strengthBar: {
    height: 6,
    backgroundColor: '#1F1F1F',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Requirements Card
  requirementsCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2A2A2A',
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  requirementsList: {
    gap: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  requirementText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  requirementMet: {
    color: '#10B981',
  },

  // Update Button
  updateButton: {
    height: 56,
    backgroundColor: '#DC2626',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  updateButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Tip Card
  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#3B82F640',
  },
  tipIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F620',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    lineHeight: 20,
  },

  bottomSpacer: {
    height: 40,
  },
});