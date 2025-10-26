import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { getUserProfile, updateUserProfile } from '../../services/database';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { checkLocationPermission, requestLocationPermission } from '../../utils/permissions';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/constants';

const SettingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  // Settings state
  const [profile, setProfile] = useState(null);
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationPermissionStatus, setLocationPermissionStatus] = useState('denied');

  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Calculate bottom padding for tab bar
  const tabBarHeight = Platform.OS === 'ios' ? 95 : 82;
  const bottomPadding = tabBarHeight + SPACING.md;

  useEffect(() => {
    loadSettings();
    checkPermissions();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    setError('');

    const { data, error: profileError } = await getUserProfile();

    if (profileError) {
      setError(profileError);
      setLoading(false);
      return;
    }

    if (data) {
      setProfile(data);
      setNotificationsEnabled(data.notifications_enabled ?? true);
      setLocationEnabled(data.location_notifications_enabled ?? false);
    }

    setLoading(false);
  };

  const checkPermissions = async () => {
    const { granted } = await checkLocationPermission();
    setLocationPermissionStatus(granted ? 'granted' : 'denied');
  };

  const handleLocationToggle = async (value) => {
    if (value) {
      // User wants to enable location notifications
      const { granted } = await requestLocationPermission();

      if (!granted) {
        Alert.alert(
          'Permission Required',
          'Please enable location permissions in your device settings to receive location-based notifications.',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Open Settings',
              onPress: () => Linking.openSettings(),
            },
          ]
        );
        return;
      }

      setLocationPermissionStatus('granted');
    }

    // Update setting
    setSaving(true);
    const { error: updateError } = await updateUserProfile({
      location_notifications_enabled: value,
    });
    setSaving(false);

    if (updateError) {
      Alert.alert('Error', updateError);
      return;
    }

    setLocationEnabled(value);
  };

  const handleNotificationsToggle = async (value) => {
    setSaving(true);
    const { error: updateError } = await updateUserProfile({
      notifications_enabled: value,
    });
    setSaving(false);

    if (updateError) {
      Alert.alert('Error', updateError);
      return;
    }

    setNotificationsEnabled(value);
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  if (loading) {
    return <Loading fullScreen text="Loading settings..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Error Message */}
        {error && (
          <ErrorMessage
            message={error}
            variant="error"
            onRetry={loadSettings}
          />
        )}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingItemIcon}>👤</Text>
              <View style={styles.settingItemText}>
                <Text style={styles.settingItemLabel}>Profile</Text>
                <Text style={styles.settingItemDescription}>
                  {user?.user_metadata?.full_name || user?.email || 'Manage your profile'}
                </Text>
              </View>
            </View>
            <Text style={styles.settingItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              Alert.alert(
                'Change Password',
                'A password reset link will be sent to your email.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Send Link',
                    onPress: () => {
                      // TODO: Implement in Phase 9
                      Alert.alert('Success', 'Password reset link sent!');
                    },
                  },
                ]
              );
            }}
          >
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingItemIcon}>🔒</Text>
              <View style={styles.settingItemText}>
                <Text style={styles.settingItemLabel}>Change Password</Text>
                <Text style={styles.settingItemDescription}>
                  Update your password
                </Text>
              </View>
            </View>
            <Text style={styles.settingItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          {/* General Notifications Toggle */}
          <View style={styles.settingItem}>
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingItemIcon}>🔔</Text>
              <View style={styles.settingItemText}>
                <Text style={styles.settingItemLabel}>Enable Notifications</Text>
                <Text style={styles.settingItemDescription}>
                  Receive notifications about your gift cards
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              disabled={saving}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.background}
              ios_backgroundColor={COLORS.border}
            />
          </View>

          {/* Location Notifications Toggle */}
          <View style={[styles.settingItem, !notificationsEnabled && styles.settingItemDisabled]}>
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingItemIcon}>📍</Text>
              <View style={styles.settingItemText}>
                <Text style={[
                  styles.settingItemLabel,
                  !notificationsEnabled && styles.settingItemLabelDisabled
                ]}>
                  Location Notifications
                </Text>
                <Text style={[
                  styles.settingItemDescription,
                  !notificationsEnabled && styles.settingItemDescriptionDisabled
                ]}>
                  Get notified when near stores with gift cards
                </Text>
                {locationPermissionStatus === 'denied' && notificationsEnabled && (
                  <Text style={styles.permissionWarning}>
                    ⚠️ Location permission required
                  </Text>
                )}
              </View>
            </View>
            <Switch
              value={locationEnabled && notificationsEnabled}
              onValueChange={handleLocationToggle}
              disabled={saving || !notificationsEnabled}
              trackColor={{ false: COLORS.border, true: COLORS.primary }}
              thumbColor={COLORS.background}
              ios_backgroundColor={COLORS.border}
            />
          </View>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoText}>
                Location notifications work in the background to alert you when you're near a store where you have a gift card.
              </Text>
            </View>
          </View>
        </View>

        {/* Subscription Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Subscription</Text>

          <View style={styles.subscriptionCard}>
            <View style={styles.subscriptionBadge}>
              <Text style={styles.subscriptionBadgeText}>
                {profile?.subscription_status === 'premium' ? '⭐ Premium' : '🆓 Free'}
              </Text>
            </View>
            <Text style={styles.subscriptionTitle}>
              {profile?.subscription_status === 'premium' ? 'Premium Plan' : 'Free Plan'}
            </Text>
            <Text style={styles.subscriptionDescription}>
              {profile?.subscription_status === 'premium'
                ? 'Unlimited gift cards and all features'
                : 'Up to 15 gift cards'}
            </Text>

            {profile?.subscription_status !== 'premium' && (
              <TouchableOpacity
                style={styles.upgradeButton}
                onPress={() => {
                  navigation.navigate('Subscription');
                }}
              >
                <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              Alert.alert('Cardinal', 'Version 1.0.0\n\nA simple gift card manager.');
            }}
          >
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingItemIcon}>ℹ️</Text>
              <View style={styles.settingItemText}>
                <Text style={styles.settingItemLabel}>App Version</Text>
                <Text style={styles.settingItemDescription}>1.0.0</Text>
              </View>
            </View>
            <Text style={styles.settingItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              Linking.openURL('https://cardinal.app/privacy'); // TODO: Replace with actual URL
            }}
          >
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingItemIcon}>🔒</Text>
              <View style={styles.settingItemText}>
                <Text style={styles.settingItemLabel}>Privacy Policy</Text>
              </View>
            </View>
            <Text style={styles.settingItemArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.settingItem}
            onPress={() => {
              Linking.openURL('https://cardinal.app/terms'); // TODO: Replace with actual URL
            }}
          >
            <View style={styles.settingItemLeft}>
              <Text style={styles.settingItemIcon}>📄</Text>
              <View style={styles.settingItemText}>
                <Text style={styles.settingItemLabel}>Terms of Service</Text>
              </View>
            </View>
            <Text style={styles.settingItemArrow}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutButtonText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Delete Account Button */}
        <TouchableOpacity
          style={styles.deleteButton}
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
                    // TODO: Implement in Phase 9
                    Alert.alert('Coming Soon', 'Account deletion coming soon');
                  },
                },
              ]
            );
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.deleteButtonText}>Delete Account</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },

  headerTitle: {
    fontSize: FONTS.sizes['2xl'],
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: SPACING.md,
  },

  section: {
    marginBottom: SPACING.xl,
  },

  sectionTitle: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.xs,
  },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 1,
      },
    }),
  },

  settingItemDisabled: {
    opacity: 0.5,
  },

  settingItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  settingItemIcon: {
    fontSize: 24,
    marginRight: SPACING.md,
  },

  settingItemText: {
    flex: 1,
  },

  settingItemLabel: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },

  settingItemLabelDisabled: {
    color: COLORS.textLight,
  },

  settingItemDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.sm * 1.4,
  },

  settingItemDescriptionDisabled: {
    color: COLORS.textLight,
  },

  settingItemArrow: {
    fontSize: FONTS.sizes['2xl'],
    color: COLORS.textLight,
    fontWeight: FONTS.weights.light,
    marginLeft: SPACING.sm,
  },

  permissionWarning: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.warning,
    marginTop: SPACING.xs / 2,
  },

  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.info,
  },

  infoIcon: {
    fontSize: 20,
    marginRight: SPACING.sm,
  },

  infoContent: {
    flex: 1,
  },

  infoText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.sm * 1.5,
  },

  subscriptionCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
  },

  subscriptionBadge: {
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.sm,
  },

  subscriptionBadgeText: {
    fontSize: FONTS.sizes.sm,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.primary,
  },

  subscriptionTitle: {
    fontSize: FONTS.sizes.xl,
    fontWeight: FONTS.weights.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },

  subscriptionDescription: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },

  upgradeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.sm,
  },

  upgradeButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.background,
  },

  signOutButton: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  signOutButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.text,
  },

  deleteButton: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.error,
  },

  deleteButtonText: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.error,
  },
});

export default SettingsScreen;