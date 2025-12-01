// app/(tabs)/settings/email-preferences.js
// Email Preferences Screen - Optimized

import { useState, useEffect, useCallback, memo } from 'react';
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
import { isValidEmail } from '../../../utils/validation';

const EmailCard = memo(({ email }) => (
  <View style={styles.emailCard}>
    <View style={styles.emailIconContainer}>
      <Ionicons name="mail" size={24} color="#DC2626" />
    </View>
    <View style={styles.emailContent}>
      <Text style={styles.emailLabel}>Email Address</Text>
      <Text style={styles.emailValue}>{email}</Text>
      <Text style={styles.emailStatus}>
        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
        {' '}Verified
      </Text>
    </View>
  </View>
));

const InfoCard = memo(() => (
  <View style={styles.infoCard}>
    <View style={styles.infoIconContainer}>
      <Ionicons name="information-circle" size={24} color="#3B82F6" />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoTitle}>Important Note</Text>
      <Text style={styles.infoText}>
        Changing your email will require verification. You'll receive a confirmation email at your new address.
      </Text>
    </View>
  </View>
));

const NotificationsCard = memo(({ email }) => (
  <View style={styles.notificationsCard}>
    <Text style={styles.notificationsTitle}>
      Receive updates via email
    </Text>
    <Text style={styles.notificationsDescription}>
      We'll send important updates, security alerts, and account notifications to {email}
    </Text>
  </View>
));

export default function EmailPreferences() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadCurrentEmail();
  }, []);

  const loadCurrentEmail = useCallback(async () => {
    const result = await handleAsync(
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        return { data: user?.email };
      },
      { showDefaultError: false }
    );

    if (!result.error && result.data) {
      setEmail(result.data);
    }
    setInitialLoading(false);
  }, []);

  const handleUpdateEmail = useCallback(async () => {
    if (!newEmail) {
      Alert.alert('Error', 'Please enter a new email address');
      return;
    }

    const validation = isValidEmail(newEmail);
    if (!validation.isValid) {
      Alert.alert('Invalid Email', validation.error);
      return;
    }

    if (newEmail === email) {
      Alert.alert('Error', 'New email must be different from current email');
      return;
    }

    setLoading(true);
    
    const result = await handleAsync(
      async () => {
        const { error } = await supabase.auth.updateUser({ email: newEmail });
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

    setEmail(newEmail);
    setNewEmail('');
    setIsEditing(false);
    Alert.alert(
      'Verification Required', 
      'A confirmation email has been sent to your new address. Please verify it to complete the change.'
    );
  }, [newEmail, email]);

  const handleStartEditing = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleCancelEditing = useCallback(() => {
    setNewEmail('');
    setIsEditing(false);
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  if (initialLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="light-content" backgroundColor="#141414" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#DC2626" />
        </View>
      </SafeAreaView>
    );
  }

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
        <Text style={styles.headerTitle}>Email Preferences</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Email</Text>
          <EmailCard email={email} />
        </View>

        {!isEditing ? (
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={handleStartEditing}
              activeOpacity={0.8}
              accessible={true}
              accessibilityLabel="Change email address"
              accessibilityRole="button"
            >
              <Ionicons name="create-outline" size={20} color="#FFFFFF" />
              <Text style={styles.changeButtonText}>Change Email Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>New Email Address</Text>
            <View style={styles.inputCard}>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
                <TextInput
                  style={styles.input}
                  value={newEmail}
                  onChangeText={setNewEmail}
                  placeholder="Enter new email address"
                  placeholderTextColor="#6B7280"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelEditing}
                disabled={loading}
                accessible={true}
                accessibilityLabel="Cancel"
                accessibilityRole="button"
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleUpdateEmail}
                disabled={loading}
                activeOpacity={0.8}
                accessible={true}
                accessibilityLabel="Save new email"
                accessibilityRole="button"
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveButtonText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        <InfoCard />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Notifications</Text>
          <NotificationsCard email={email} />
        </View>

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

  // Sections
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  // Email Card
  emailCard: {
    flexDirection: 'row',
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  emailIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DC262620',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  emailContent: {
    flex: 1,
  },
  emailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
  },
  emailValue: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emailStatus: {
    fontSize: 14,
    fontWeight: '500',
    color: '#10B981',
  },

  // Change Button
  changeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 56,
    backgroundColor: '#1F1F1F',
    borderWidth: 2,
    borderColor: '#DC2626',
    borderRadius: 28,
  },
  changeButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Input Card
  inputCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2A2A2A',
    marginBottom: 16,
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

  // Button Row
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#1F1F1F',
    borderWidth: 2,
    borderColor: '#2A2A2A',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  saveButton: {
    flex: 1,
    height: 56,
    backgroundColor: '#DC2626',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#3B82F640',
    marginBottom: 32,
  },
  infoIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F620',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    lineHeight: 20,
  },

  // Notifications Card
  notificationsCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  notificationsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  notificationsDescription: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    lineHeight: 20,
  },

  bottomSpacer: {
    height: 40,
  },
});