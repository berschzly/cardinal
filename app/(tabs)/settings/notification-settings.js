// app/(tabs)/settings/notification-settings.js
// Notification Settings Screen

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationSettings() {
  const router = useRouter();
  const [isPremium, setIsPremium] = useState(false);

  // Notification toggles
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  
  // Expiration alerts
  const [expirationAlerts, setExpirationAlerts] = useState(true);
  const [expiring30Days, setExpiring30Days] = useState(true);
  const [expiring14Days, setExpiring14Days] = useState(true);
  const [expiring7Days, setExpiring7Days] = useState(true);
  const [expiring1Day, setExpiring1Day] = useState(true);
  
  // Usage reminders
  const [usageReminders, setUsageReminders] = useState(true);
  const [unusedCardReminders, setUnusedCardReminders] = useState(true);
  
  // Location alerts (Premium)
  const [locationAlerts, setLocationAlerts] = useState(false);
  const [locationRadius, setLocationRadius] = useState('0.5'); // miles

  // Marketing
  const [marketingEmails, setMarketingEmails] = useState(false);

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingToggle = ({ icon, title, subtitle, value, onToggle, badge, disabled }) => (
    <View style={[styles.settingRow, disabled && styles.settingRowDisabled]}>
      <View style={styles.settingLeft}>
        <View style={styles.settingIconContainer}>
          <Ionicons name={icon} size={20} color={disabled ? '#6B7280' : '#9CA3AF'} />
        </View>
        <View style={styles.settingContent}>
          <View style={styles.settingTitleRow}>
            <Text style={[styles.settingTitle, disabled && styles.disabledText]}>
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
            <Text style={[styles.settingSubtitle, disabled && styles.disabledText]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: '#2A2A2A', true: '#DC262640' }}
        thumbColor={value ? '#DC2626' : '#6B7280'}
        ios_backgroundColor="#2A2A2A"
      />
    </View>
  );

  const RadiusOption = ({ value, label, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.radiusOption, selected && styles.radiusOptionSelected]}
      onPress={onPress}
      activeOpacity={0.7}
      accessible={true}
      accessibilityLabel={`${label} radius`}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
    >
      <View style={[styles.radioCircle, selected && styles.radioCircleSelected]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={[styles.radiusText, selected && styles.radiusTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#141414" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          accessible={true}
          accessibilityLabel="Go back"
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Master Controls */}
        <SettingSection title="Master Controls">
          <View style={styles.settingsCard}>
            <SettingToggle
              icon="notifications"
              title="Push Notifications"
              subtitle="Receive alerts on this device"
              value={pushEnabled}
              onToggle={setPushEnabled}
            />
            <View style={styles.divider} />
            <SettingToggle
              icon="mail"
              title="Email Notifications"
              subtitle="Receive alerts via email"
              value={emailEnabled}
              onToggle={setEmailEnabled}
            />
          </View>
        </SettingSection>

        {/* Expiration Alerts */}
        <SettingSection title="Expiration Alerts">
          <View style={styles.settingsCard}>
            <SettingToggle
              icon="time"
              title="Expiration Reminders"
              subtitle="Get notified before cards expire"
              value={expirationAlerts}
              onToggle={setExpirationAlerts}
            />
            
            {expirationAlerts && (
              <>
                <View style={styles.divider} />
                <View style={styles.subSettingsSection}>
                  <Text style={styles.subSectionTitle}>Remind me at:</Text>
                  <View style={styles.subSettings}>
                    <SettingToggle
                      icon="calendar-outline"
                      title="30 days before"
                      value={expiring30Days}
                      onToggle={setExpiring30Days}
                    />
                    <View style={styles.subDivider} />
                    <SettingToggle
                      icon="calendar-outline"
                      title="14 days before"
                      value={expiring14Days}
                      onToggle={setExpiring14Days}
                    />
                    <View style={styles.subDivider} />
                    <SettingToggle
                      icon="calendar-outline"
                      title="7 days before"
                      value={expiring7Days}
                      onToggle={setExpiring7Days}
                    />
                    <View style={styles.subDivider} />
                    <SettingToggle
                      icon="calendar-outline"
                      title="1 day before"
                      value={expiring1Day}
                      onToggle={setExpiring1Day}
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        </SettingSection>

        {/* Usage Reminders */}
        <SettingSection title="Usage Reminders">
          <View style={styles.settingsCard}>
            <SettingToggle
              icon="refresh"
              title="Usage Reminders"
              subtitle="Reminders to use your gift cards"
              value={usageReminders}
              onToggle={setUsageReminders}
            />
            <View style={styles.divider} />
            <SettingToggle
              icon="alert-circle"
              title="Unused Card Alerts"
              subtitle="Alert after 30 days of no use"
              value={unusedCardReminders}
              onToggle={setUnusedCardReminders}
            />
          </View>
        </SettingSection>

        {/* Location Alerts (Premium) */}
        <SettingSection title="Location Alerts">
          {!isPremium && (
            <TouchableOpacity
              style={styles.premiumBanner}
              activeOpacity={0.9}
              onPress={() => Alert.alert('Premium Feature', 'Upgrade to Premium to enable location-based alerts.')}
              accessible={true}
              accessibilityLabel="Upgrade to premium"
              accessibilityRole="button"
            >
              <View style={styles.premiumBannerContent}>
                <View style={styles.premiumBannerIcon}>
                  <Ionicons name="star" size={24} color="#F59E0B" />
                </View>
                <View style={styles.premiumBannerText}>
                  <Text style={styles.premiumBannerTitle}>Premium Feature</Text>
                  <Text style={styles.premiumBannerSubtitle}>
                    Get notified when near stores
                  </Text>
                </View>
              </View>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          
          <View style={styles.settingsCard}>
            <SettingToggle
              icon="location"
              title="Location-Based Alerts"
              subtitle="Notify me when near a store"
              badge="PRO"
              value={locationAlerts}
              onToggle={(value) => {
                if (!isPremium) {
                  Alert.alert('Premium Feature', 'Location alerts are only available with Premium.');
                } else {
                  setLocationAlerts(value);
                }
              }}
              disabled={!isPremium}
            />
            
            {locationAlerts && isPremium && (
              <>
                <View style={styles.divider} />
                <View style={styles.radiusSection}>
                  <Text style={styles.radiusTitle}>Alert Radius</Text>
                  <View style={styles.radiusOptions}>
                    <RadiusOption
                      value="0.25"
                      label="0.25 mi"
                      selected={locationRadius === '0.25'}
                      onPress={() => setLocationRadius('0.25')}
                    />
                    <RadiusOption
                      value="0.5"
                      label="0.5 mi"
                      selected={locationRadius === '0.5'}
                      onPress={() => setLocationRadius('0.5')}
                    />
                    <RadiusOption
                      value="1"
                      label="1 mi"
                      selected={locationRadius === '1'}
                      onPress={() => setLocationRadius('1')}
                    />
                  </View>
                </View>
              </>
            )}
          </View>
        </SettingSection>

        {/* Marketing */}
        <SettingSection title="Marketing">
          <View style={styles.settingsCard}>
            <SettingToggle
              icon="megaphone"
              title="Marketing Emails"
              subtitle="Tips, offers, and product updates"
              value={marketingEmails}
              onToggle={setMarketingEmails}
            />
          </View>
        </SettingSection>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconContainer}>
            <Ionicons name="information-circle" size={24} color="#3B82F6" />
          </View>
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Privacy Note</Text>
            <Text style={styles.infoText}>
              You can change these settings anytime. We respect your privacy and only send notifications you've enabled.
            </Text>
          </View>
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
  settingRowDisabled: {
    opacity: 0.5,
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
  settingSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
    marginTop: 2,
  },
  disabledText: {
    color: '#6B7280',
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
  subDivider: {
    height: 1,
    backgroundColor: '#2A2A2A',
  },

  // Sub Settings
  subSettingsSection: {
    paddingTop: 12,
    paddingBottom: 4,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9CA3AF',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  subSettings: {
    paddingLeft: 16,
  },

  // Radius Section
  radiusSection: {
    padding: 16,
  },
  radiusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  radiusOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  radiusOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2A2A2A',
  },
  radiusOptionSelected: {
    backgroundColor: '#DC262620',
    borderColor: '#DC2626',
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#6B7280',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioCircleSelected: {
    borderColor: '#DC2626',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#DC2626',
  },
  radiusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  radiusTextSelected: {
    color: '#DC2626',
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
    padding: 16,
    marginBottom: 16,
  },
  premiumBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  premiumBannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F59E0B20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  premiumBannerText: {
    flex: 1,
  },
  premiumBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  premiumBannerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9CA3AF',
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#1F1F1F',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#3B82F640',
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

  bottomSpacer: {
    height: 40,
  },
});