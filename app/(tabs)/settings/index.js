// Settings Screen - Redesigned to match Dashboard/Add Card

import { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../../../lib/supabase';
import { handleAsync } from '../../../utils/errorHandling';

export default function Settings() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationAlertsEnabled, setLocationAlertsEnabled] = useState(false);
  const [expirationAlerts, setExpirationAlerts] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [isPremium, setIsPremium] = useState(false);

  // Sign Out Function
  async function handleSignOut() {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            const result = await handleAsync(
              async () => {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                return { data: { success: true } };
              },
              { showDefaultError: false }
            );

            if (result.error) {
              Alert.alert('Sign Out Failed', result.error);
            } else {
              // Navigation will be handled by auth listener in _layout.js
              router.replace('/(auth)/welcome');
            }
          }
        }
      ]
    );
  }

  // Delete All Data Function
  async function handleDeleteData() {
    Alert.alert(
      'Delete All Data',
      'This action cannot be undone. All your cards and data will be permanently deleted. Your account will remain active.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            // Second confirmation
            Alert.alert(
              'Are You Sure?',
              'This will delete all your cards permanently. Type DELETE to confirm.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Everything',
                  style: 'destructive',
                  onPress: async () => {
                    const result = await handleAsync(
                      async () => {
                        const { data: { user } } = await supabase.auth.getUser();
                        
                        // Delete all cards
                        const { error: cardsError } = await supabase
                          .from('cards')
                          .delete()
                          .eq('user_id', user.id);
                        
                        if (cardsError) throw cardsError;

                        // Reset user settings to defaults
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

                    if (result.error) {
                      Alert.alert('Delete Failed', result.error);
                    } else {
                      Alert.alert(
                        'Data Deleted',
                        'All your cards have been permanently deleted.',
                        [{ text: 'OK', onPress: () => router.push('/(tabs)') }]
                      );
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  }

  // Delete Account Function
  async function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. Your account and all associated data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            // Second confirmation
            Alert.alert(
              'Final Confirmation',
              'Are you absolutely sure? This will permanently delete your account and all data.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete My Account',
                  style: 'destructive',
                  onPress: async () => {
                    const result = await handleAsync(
                      async () => {
                        const { data: { user } } = await supabase.auth.getUser();
                        
                        // Delete all cards
                        await supabase
                          .from('cards')
                          .delete()
                          .eq('user_id', user.id);

                        // Delete user settings
                        await supabase
                          .from('user_settings')
                          .delete()
                          .eq('user_id', user.id);

                        // Delete the auth user (this will cascade delete everything)
                        const { error } = await supabase.auth.admin.deleteUser(user.id);
                        
                        // If admin.deleteUser doesn't work (requires service role key),
                        // we can just sign out and let the user know to contact support
                        if (error && error.message.includes('service_role')) {
                          // Sign out instead
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

                    if (result.error) {
                      Alert.alert('Deletion Failed', result.error);
                    } else {
                      router.replace('/(auth)/welcome');
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  }

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingRow = ({ 
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
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#141414" />
      
      {/* Page Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Settings</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Premium Banner */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.premiumBanner}
            activeOpacity={0.9}
            onPress={() => Alert.alert('Premium Coming Soon', 'Premium subscriptions will be available after launch.')}
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
        )}

        {/* Account Section */}
        <SettingSection title="Account">
          <View style={styles.settingsCard}>
            <SettingRow
              icon="mail-outline"
              title="Email"
              value="user@example.com"
              showArrow
              onPress={() => router.push('/settings/email-preferences')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="key-outline"
              title="Change Password"
              showArrow
              onPress={() => router.push('/settings/change-password')}
            />
          </View>
        </SettingSection>

        {/* Notifications Section */}
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
            <View style={styles.divider} />
            <SettingRow
              icon="time-outline"
              title="Expiration Alerts"
              subtitle="Remind me before cards expire"
              showToggle
              toggleValue={expirationAlerts}
              onToggle={setExpirationAlerts}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="location-outline"
              title="Location Alerts"
              subtitle="Notify me near stores"
              badge="PRO"
              showToggle
              toggleValue={locationAlertsEnabled}
              onToggle={(value) => {
                if (!isPremium) {
                  Alert.alert('Premium Feature', 'Location alerts are only available with Premium.');
                } else {
                  setLocationAlertsEnabled(value);
                }
              }}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="settings-outline"
              title="Notification Preferences"
              subtitle="Customize when and how you're notified"
              showArrow
              onPress={() => router.push('/settings/notification-settings')}
            />
          </View>
        </SettingSection>

        {/* App Section */}
        <SettingSection title="App">
          <View style={styles.settingsCard}>
            <SettingRow
              icon="help-circle-outline"
              title="Help & Support"
              showArrow
              onPress={() => Linking.openURL('mailto:support@usecardinal.app')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="star-outline"
              title="Rate Cardinal"
              showArrow
              onPress={() => Alert.alert('Rate Us', 'Thank you for your support!')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="share-outline"
              title="Share Cardinal"
              showArrow
              onPress={() => Alert.alert('Share', 'Share Cardinal with friends!')}
            />
          </View>
        </SettingSection>

        {/* About Section */}
        <SettingSection title="About">
          <View style={styles.settingsCard}>
            <SettingRow
              icon="information-circle-outline"
              title="Version"
              value="1.0.0"
            />
            <View style={styles.divider} />
            <SettingRow
              icon="document-outline"
              title="Terms of Service"
              showArrow
              onPress={() => Linking.openURL('https://usecardinal.app/terms')}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="shield-outline"
              title="Privacy Policy"
              showArrow
              onPress={() => Linking.openURL('https://usecardinal.app/privacy')}
            />
          </View>
        </SettingSection>

        {/* Danger Zone */}
        <SettingSection title="Danger Zone">
          <View style={styles.settingsCard}>
            <SettingRow
              icon="log-out-outline"
              title="Sign Out"
              destructive
              showArrow
              onPress={handleSignOut}
            />
            <View style={styles.divider} />
            <SettingRow
              icon="trash-outline"
              title="Delete Data"
              subtitle="Permanently delete all your cards and data"
              destructive
              showArrow
              onPress={handleDeleteData}
            />
            <View style={styles.divider} />
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

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLogo}>
            <Ionicons name="card" size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.footerTitle}>Cardinal</Text>
          <Text style={styles.footerText}>
            Never lose a gift card again
          </Text>
          <Text style={styles.footerCopyright}>
            © 2024 Cardinal. All rights reserved.
          </Text>
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
});