// Settings Screen - Performance optimized

import { useState, useCallback, memo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
  StatusBar,
  Image,  // Add this
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { handleAsync } from '../../../utils/errorHandling';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

// Memoized components
const SettingSection = memo(({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
));

const SettingRow = memo(({ 
  icon, 
  title, 
  subtitle, 
  value, 
  onPress, 
  showArrow = false,
  showToggle = false,
  toggleValue,
  onToggle,
  badge,
  destructive = false
}) => (
  <TouchableOpacity
    style={styles.settingRow}
    onPress={onPress}
    disabled={showToggle}
    activeOpacity={showToggle ? 1 : 0.7}
    accessible={true}
    accessibilityLabel={title}
    accessibilityRole={showToggle ? "switch" : "button"}
  >
    <View style={styles.settingLeft}>
      <View style={styles.settingIconContainer}>
        <Ionicons name={icon} size={20} color={destructive ? '#DC2626' : '#9CA3AF'} />
      </View>
      <View style={styles.settingContent}>
        <View style={styles.settingTitleRow}>
          <Text style={[styles.settingTitle, destructive && styles.destructiveText]}>
            {title}
          </Text>
          {badge && (
            <View style={styles.premiumBadge}>
              <Ionicons name="star" size={10} color="#141414" />
              <Text style={styles.premiumBadgeText}>{badge}</Text>
            </View>
          )}
        </View>
        {subtitle && (
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        )}
      </View>
    </View>

    <View style={styles.settingRight}>
      {value && <Text style={styles.settingValue}>{value}</Text>}
      {showToggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: '#2A2A2A', true: '#DC262640' }}
          thumbColor={toggleValue ? '#DC2626' : '#6B7280'}
          ios_backgroundColor="#2A2A2A"
        />
      )}
      {showArrow && (
        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
      )}
    </View>
  </TouchableOpacity>
));

const Divider = memo(() => <View style={styles.divider} />);

const PremiumBanner = memo(({ onPress }) => (
  <TouchableOpacity
    style={styles.premiumBanner}
    activeOpacity={0.9}
    onPress={onPress}
    accessible={true}
    accessibilityLabel="Upgrade to premium"
    accessibilityRole="button"
  >
    <View style={styles.premiumBannerContent}>
      <View style={styles.premiumBannerIcon}>
        <Ionicons name="star" size={24} color="#F59E0B" />
      </View>
      <View style={styles.premiumBannerText}>
        <Text style={styles.premiumBannerTitle}>Upgrade to Premium</Text>
        <Text style={styles.premiumBannerSubtitle}>
          Unlimited cards, location alerts & more
        </Text>
      </View>
    </View>
    <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
  </TouchableOpacity>
));

const Footer = memo(() => (
  <View style={styles.footer}>
    <View style={styles.footerLogo}>
      <Image 
        source={require('../../../assets/images/logo.png')} 
        style={styles.footerLogoImage}
        resizeMode="contain"
      />
    </View>
    <Text style={styles.footerTitle}>Cardinal</Text>
    <Text style={styles.footerText}>
      Never lose a gift card again
    </Text>
    <Text style={styles.footerCopyright}>
      © 2024 Cardinal. All rights reserved.
    </Text>
  </View>
));

export default function Settings() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationAlertsEnabled, setLocationAlertsEnabled] = useState(false);
  const [expirationAlerts, setExpirationAlerts] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [showDeleteDataModal, setShowDeleteDataModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = useCallback(async () => {
    const result = await handleAsync(
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserEmail(user.email || 'user@example.com');
        }
        
        // Load user settings if you have them
        const { data: settings } = await supabase
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single();
        
        if (settings) {
          setNotificationsEnabled(settings.push_notifications ?? true);
          setExpirationAlerts(settings.expiration_alerts ?? true);
          setLocationAlertsEnabled(settings.location_alerts ?? false);
          setIsPremium(settings.is_premium ?? false);
        }
        
        return { data: { success: true } };
      },
      { showDefaultError: false }
    );
    
    setLoading(false);
  }, []);

  const handleSignOut = useCallback(() => {
    setShowSignOutModal(true);
  }, []);

  const confirmSignOut = useCallback(async () => {
    setModalLoading(true);
    const result = await handleAsync(
      async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        return { data: { success: true } };
      },
      { showDefaultError: false }
    );
    setModalLoading(false);

    if (result.error) {
      setShowSignOutModal(false);
      Alert.alert('Sign Out Failed', result.error);
    } else {
      router.replace('/(auth)/welcome');
    }
  }, [router]);

  const handleDeleteData = useCallback(() => {
    setShowDeleteDataModal(true);
  }, []);

  const confirmDeleteData = useCallback(async () => {
    setModalLoading(true);
    const result = await handleAsync(
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        const { error: cardsError } = await supabase
          .from('cards')
          .delete()
          .eq('user_id', user.id);
        
        if (cardsError) throw cardsError;

        const { error: settingsError } = await supabase
          .from('user_settings')
          .update({
            push_notifications: true,
            email_notifications: true,
            expiration_alerts: true,
            expiring_30_days: true,
            expiring_14_days: true,
            expiring_7_days: true,
            expiring_1_day: true,
            usage_reminders: true,
            unused_card_reminders: true,
            location_alerts: false,
            location_radius: '0.5',
            marketing_emails: false,
          })
          .eq('user_id', user.id);

        if (settingsError) throw settingsError;

        return { data: { success: true } };
      },
      { showDefaultError: false }
    );
    setModalLoading(false);

    if (result.error) {
      setShowDeleteDataModal(false);
      Alert.alert('Delete Failed', result.error);
    } else {
      setShowDeleteDataModal(false);
      Alert.alert(
        'Data Deleted',
        'All your cards have been permanently deleted.',
        [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
      );
    }
  }, [router]);

  const handleDeleteAccount = useCallback(() => {
    setShowDeleteAccountModal(true);
  }, []);

  const confirmDeleteAccount = useCallback(async () => {
    setModalLoading(true);
    const result = await handleAsync(
      async () => {
        const { data: { user } } = await supabase.auth.getUser();
        
        await supabase
          .from('cards')
          .delete()
          .eq('user_id', user.id);

        await supabase
          .from('user_settings')
          .delete()
          .eq('user_id', user.id);

        const { error } = await supabase.auth.admin.deleteUser(user.id);
        
        if (error && error.message.includes('service_role')) {
          await supabase.auth.signOut();
          Alert.alert(
            'Account Deletion Requested',
            'Your data has been cleared. Please contact support@usecardinal.app to complete account deletion.',
            [{ text: 'OK', onPress: () => router.replace('/(auth)/welcome') }]
          );
          return { data: { success: true } };
        }

        if (error) throw error;

        return { data: { success: true } };
      },
      { showDefaultError: false }
    );
    setModalLoading(false);

    if (result.error) {
      setShowDeleteAccountModal(false);
      Alert.alert('Deletion Failed', result.error);
    } else {
      router.replace('/(auth)/welcome');
    }
  }, [router]);

  const handlePremiumPress = useCallback(() => {
    Alert.alert('Premium Coming Soon', 'Premium subscriptions will be available after launch.');
  }, []);

  const handleEmailPress = useCallback(() => {
    router.push('/settings/email-preferences');
  }, [router]);

  const handlePasswordPress = useCallback(() => {
    router.push('/settings/change-password');
  }, [router]);

  const handleNotificationPrefsPress = useCallback(() => {
    router.push('/settings/notification-settings');
  }, [router]);

  const handleHelpPress = useCallback(() => {
    Linking.openURL('mailto:support@usecardinal.app');
  }, []);

  const handleRatePress = useCallback(() => {
    Alert.alert('Rate Us', 'Thank you for your support!');
  }, []);

  const handleSharePress = useCallback(() => {
    Alert.alert('Share', 'Share Cardinal with friends!');
  }, []);

  const handleTermsPress = useCallback(() => {
    Linking.openURL('https://usecardinal.app/terms');
  }, []);

  const handlePrivacyPress = useCallback(() => {
    Linking.openURL('https://usecardinal.app/privacy');
  }, []);

  const handleLocationToggle = useCallback((value) => {
    if (!isPremium) {
      Alert.alert('Premium Feature', 'Location alerts are only available with Premium.');
    } else {
      setLocationAlertsEnabled(value);
    }
  }, [isPremium]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#141414" />
      
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Settings</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {!isPremium && <PremiumBanner onPress={handlePremiumPress} />}

        <SettingSection title="Account">
          <View style={styles.settingsCard}>
            <SettingRow
              icon="mail-outline"
              title="Email"
              value={userEmail}
              showArrow
              onPress={handleEmailPress}
            />
            <Divider />
            <SettingRow
              icon="key-outline"
              title="Change Password"
              showArrow
              onPress={handlePasswordPress}
            />
          </View>
        </SettingSection>

        <SettingSection title="Notifications">
          <View style={styles.settingsCard}>
            <SettingRow
              icon="notifications-outline"
              title="Push Notifications"
              subtitle="Allow Cardinal to send you alerts"
              showToggle
              toggleValue={notificationsEnabled}
              onToggle={setNotificationsEnabled}
            />
            <Divider />
            <SettingRow
              icon="time-outline"
              title="Expiration Alerts"
              subtitle="Remind me before cards expire"
              showToggle
              toggleValue={expirationAlerts}
              onToggle={setExpirationAlerts}
            />
            <Divider />
            <SettingRow
              icon="location-outline"
              title="Location Alerts"
              subtitle="Notify me near stores"
              badge="PRO"
              showToggle
              toggleValue={locationAlertsEnabled}
              onToggle={handleLocationToggle}
            />
            <Divider />
            <SettingRow
              icon="settings-outline"
              title="Notification Preferences"
              subtitle="Customize when and how you're notified"
              showArrow
              onPress={handleNotificationPrefsPress}
            />
          </View>
        </SettingSection>

        <SettingSection title="App">
          <View style={styles.settingsCard}>
            <SettingRow
              icon="help-circle-outline"
              title="Help & Support"
              showArrow
              onPress={handleHelpPress}
            />
            <Divider />
            <SettingRow
              icon="star-outline"
              title="Rate Cardinal"
              showArrow
              onPress={handleRatePress}
            />
            <Divider />
            <SettingRow
              icon="share-outline"
              title="Share Cardinal"
              showArrow
              onPress={handleSharePress}
            />
          </View>
        </SettingSection>

        <SettingSection title="About">
          <View style={styles.settingsCard}>
            <SettingRow
              icon="information-circle-outline"
              title="Version"
              value="1.0.0"
            />
            <Divider />
            <SettingRow
              icon="document-outline"
              title="Terms of Service"
              showArrow
              onPress={handleTermsPress}
            />
            <Divider />
            <SettingRow
              icon="shield-outline"
              title="Privacy Policy"
              showArrow
              onPress={handlePrivacyPress}
            />
          </View>
        </SettingSection>

        <SettingSection title="Danger Zone">
          <View style={styles.settingsCard}>
            <SettingRow
              icon="log-out-outline"
              title="Sign Out"
              destructive
              showArrow
              onPress={handleSignOut}
            />
            <Divider />
            <SettingRow
              icon="trash-outline"
              title="Delete Data"
              subtitle="Permanently delete all your cards and data"
              destructive
              showArrow
              onPress={handleDeleteData}
            />
            <Divider />
            <SettingRow
              icon="close-circle-outline"
              title="Delete Account"
              subtitle="Permanently delete your account"
              destructive
              showArrow
              onPress={handleDeleteAccount}
            />
          </View>
        </SettingSection>

        <Footer />

        <View style={styles.bottomSpacer} />
      </ScrollView>
      {/* Sign Out Modal */}
      <ConfirmationModal
        visible={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={confirmSignOut}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        confirmText="Sign Out"
        cancelText="Cancel"
        confirmDestructive={true}
        icon="log-out-outline"
        iconColor="#F59E0B"
        loading={modalLoading}
      />

      {/* Delete Data Modal */}
      <ConfirmationModal
        visible={showDeleteDataModal}
        onClose={() => setShowDeleteDataModal(false)}
        onConfirm={confirmDeleteData}
        title="Delete All Data"
        message="This will permanently delete all your cards and data. Your account will remain active. This action cannot be undone."
        confirmText="Delete Data"
        cancelText="Cancel"
        confirmDestructive={true}
        icon="trash-outline"
        iconColor="#DC2626"
        loading={modalLoading}
      />

      {/* Delete Account Modal */}
      <ConfirmationModal
        visible={showDeleteAccountModal}
        onClose={() => setShowDeleteAccountModal(false)}
        onConfirm={confirmDeleteAccount}
        title="Delete Account"
        message="This will permanently delete your account and all associated data. This action cannot be undone."
        confirmText="Delete Account"
        cancelText="Cancel"
        confirmDestructive={true}
        icon="close-circle-outline"
        iconColor="#DC2626"
        loading={modalLoading}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
  },
  
  // Page Header
  pageHeader: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
  },

  // Premium Banner
  premiumBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1F1F1F',
    borderWidth: 2,
    borderColor: '#F59E0B40',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
  },
  premiumBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  premiumBannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F59E0B20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  premiumBannerText: {
    flex: 1,
  },
  premiumBannerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  premiumBannerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
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

  // Settings Card
  settingsCard: {
    backgroundColor: '#1F1F1F',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2A2A2A',
    overflow: 'hidden',
  },

  // Setting Row
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    minHeight: 68,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingContent: {
    flex: 1,
  },
  settingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  destructiveText: {
    color: '#DC2626',
  },
  settingSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 2,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingValue: {
    fontSize: 15,
    fontWeight: '500',
    color: '#9CA3AF',
  },

  // Premium Badge
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#141414',
    letterSpacing: 0.5,
  },

  // Divider
  divider: {
    height: 1,
    backgroundColor: '#2A2A2A',
    marginLeft: 68,
  },

  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 24,
  },
  footerLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: 16,
  },
  footerCopyright: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
  },

  bottomSpacer: {
    height: 40,
  },
  footerLogoImage: {
    width: 48,
    height: 48,
    borderRadius: 25,
  },
});