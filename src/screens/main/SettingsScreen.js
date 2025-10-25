import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, updateUserProfile } from '../../services/database';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/constants';

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, updateUserMetadata } = useAuth();

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState('');

  // Calculate bottom padding for tab bar
  const tabBarHeight = Platform.OS === 'ios' ? 95 : 82;
  const bottomPadding = tabBarHeight + SPACING.md;

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError('');

    // Get profile from database
    const { data, error: profileError } = await getUserProfile();

    if (profileError) {
      setError(profileError);
      setLoading(false);
      return;
    }

    // Set form data
    if (data) {
      setFullName(data.full_name || user?.user_metadata?.full_name || '');
      setEmail(user?.email || '');
      setNotificationsEnabled(data.notifications_enabled ?? true);
    } else {
      // Fallback to user metadata
      setFullName(user?.user_metadata?.full_name || '');
      setEmail(user?.email || '');
    }

    setLoading(false);
  };

  const validateForm = () => {
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return false;
    }

    if (fullName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    setError('');

    // Validate
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    // Update profile in database
    const { error: updateError } = await updateUserProfile({
      full_name: fullName.trim(),
      notifications_enabled: notificationsEnabled,
    });

    if (updateError) {
      setError(updateError);
      setSaving(false);
      return;
    }

    // Update user metadata in Supabase Auth
    const { error: metadataError } = await updateUserMetadata({
      full_name: fullName.trim(),
    });

    setSaving(false);

    if (metadataError) {
      setError(metadataError);
      return;
    }

    // Success
    setEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleCancel = () => {
    // Reset form
    setFullName(user?.user_metadata?.full_name || '');
    setEmail(user?.email || '');
    setEditing(false);
    setError('');
  };

  if (loading) {
    return <Loading fullScreen text="Loading profile..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Profile</Text>

          {!editing && (
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setEditing(true)}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}

          {editing && <View style={styles.headerSpacer} />}
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: bottomPadding }
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {fullName.charAt(0).toUpperCase() || '?'}
              </Text>
            </View>
            {editing && (
              <TouchableOpacity style={styles.changePhotoButton}>
                <Text style={styles.changePhotoText}>Change Photo</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Error Message */}
          {error && (
            <ErrorMessage
              message={error}
              variant="error"
              onRetry={() => setError('')}
            />
          )}

          {/* Form */}
          {editing ? (
            <View style={styles.form}>
              <Input
                label="Full Name"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Enter your full name"
                autoCapitalize="words"
                editable={editing}
              />

              <Input
                label="Email"
                value={email}
                placeholder="Your email"
                editable={false}
                inputStyle={styles.disabledInput}
              />

              <View style={styles.emailNote}>
                <Text style={styles.emailNoteText}>
                  ℹ️ Email cannot be changed. Contact support if you need to update your email.
                </Text>
              </View>

              {/* Action Buttons */}
              <View style={styles.actions}>
                <Button
                  title="Save Changes"
                  onPress={handleSave}
                  loading={saving}
                  style={styles.actionButton}
                />

                <Button
                  title="Cancel"
                  onPress={handleCancel}
                  variant="outline"
                  style={styles.actionButton}
                />
              </View>
            </View>
          ) : (
            // View Mode
            <View style={styles.infoSection}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Full Name</Text>
                <Text style={styles.infoValue}>{fullName || 'Not set'}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{email}</Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Account Created</Text>
                <Text style={styles.infoValue}>
                  {new Date(user?.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          )}

          {/* Account Actions */}
          {!editing && (
            <View style={styles.accountActions}>
              <Text style={styles.accountActionsTitle}>Account Actions</Text>

              <TouchableOpacity
                style={styles.actionItem}
                onPress={() => {
                  Alert.alert(
                    'Change Password',
                    'A password reset link will be sent to your email.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Send Link',
                        onPress: () => {
                          // TODO: Implement password reset
                          Alert.alert('Success', 'Password reset link sent to your email!');
                        },
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.actionItemText}>Change Password</Text>
                <Text style={styles.actionItemIcon}>›</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionItem, styles.dangerActionItem]}
                onPress={() => {
                  Alert.alert(
                    'Delete Account',
                    'This action cannot be undone. All your gift cards will be permanently deleted.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => {
                          // TODO: Implement account deletion
                          Alert.alert('Account deletion coming soon');
                        },
                      },
                    ]
                  );
                }}
              >
                <Text style={styles.dangerActionItemText}>Delete Account</Text>
                <Text style={styles.actionItemIcon}>›</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  keyboardView: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },

  backButton: {
    padding: SPACING.sm,
  },

  backButtonText: {
    fontSize: FONTS.sizes['3xl'],
    color: COLORS.primary,
  },

  headerTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
  },

  editButton: {
    padding: SPACING.sm,
  },

  editButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.primary,
  },

  headerSpacer: {
    width: 60,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: SPACING.md,
  },

  avatarSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },

  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },

  avatarText: {
    fontSize: FONTS.sizes['4xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.background,
  },

  changePhotoButton: {
    paddingVertical: SPACING.xs,
  },

  changePhotoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.primary,
    fontWeight: FONTS.weights.medium,
  },

  form: {
    marginBottom: SPACING.xl,
  },

  disabledInput: {
    backgroundColor: COLORS.disabled,
    color: COLORS.textSecondary,
  },

  emailNote: {
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    marginTop: -SPACING.sm,
    marginBottom: SPACING.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.info,
  },

  emailNoteText: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.xs * 1.5,
  },

  actions: {
    marginTop: SPACING.lg,
  },

  actionButton: {
    marginBottom: SPACING.sm,
  },

  infoSection: {
    marginBottom: SPACING.xl,
  },

  infoRow: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },

  infoLabel: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },

  infoValue: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
  },

  accountActions: {
    marginTop: SPACING.lg,
  },

  accountActionsTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },

  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },

  actionItemText: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
  },

  actionItemIcon: {
    fontSize: FONTS.sizes['2xl'],
    color: COLORS.textLight,
    fontWeight: FONTS.weights.light,
  },

  dangerActionItem: {
    borderWidth: 1,
    borderColor: COLORS.error,
  },

  dangerActionItemText: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.medium,
    color: COLORS.error,
  },
});

export default ProfileScreen;