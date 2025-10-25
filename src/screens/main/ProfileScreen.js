import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../hooks/useAuth';
import { COLORS, FONTS, SPACING, RADIUS } from '../../utils/constants';

const SettingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { user, signOut } = useAuth();

  // Calculate bottom padding for tab bar
  const tabBarHeight = Platform.OS === 'ios' ? 95 : 82;
  const bottomPadding = tabBarHeight + SPACING.md;

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
            const { error } = await signOut();
            if (error) {
              Alert.alert('Error', error);
            }
          },
        },
      ]
    );
  };

  const handleContactSupport = () => {
    const email = 'support@cardinalapp.com';
    const subject = 'Cardinal Support Request';
    const body = `User ID: ${user?.id}\n\n`;

    Linking.openURL(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const SettingRow = ({ icon, title, subtitle, onPress, rightElement, danger }) => (
    <TouchableOpacity
      style={[styles.settingRow, danger && styles.dangerRow]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        {icon && <Text style={styles.settingIcon}>{icon}</Text>}
        <View style={styles.settingTextContainer}>
          <Text style={[styles.settingTitle, danger && styles.dangerText]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {rightElement || (
        <Text style={styles.chevron}>›</Text>
      )}
    </TouchableOpacity>
  );

  const SettingToggle = ({ icon, title, subtitle, value, onValueChange }) => (
    <View style={styles.settingRow}>
      <View style={styles.settingLeft}>
        {icon && <Text style={styles.settingIcon}>{icon}</Text>}
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingTitle}>{title}</Text>
          {subtitle && (
            <Text style={styles.settingSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.border, true: COLORS.primary }}
        thumbColor={COLORS.background}
        ios_backgroundColor={COLORS.border}
      />
    </View>
  );

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
        {/* Account Section */}
        <SettingSection title="Account">
          <SettingRow
            icon="👤"
            title="Profile"
            subtitle={user?.user_metadata?.full_name || user?.email || 'View and edit your profile'}
            onPress={() => navigation.navigate('Profile')}
          />

          <SettingRow
            icon="💳"
            title="Subscription"
            subtitle="Free Plan • 15 cards limit"
            onPress={() => {
              Alert.alert('Coming Soon', 'Premium subscriptions coming soon!');
            }}
          />
        </SettingSection>

        {/* Notifications Section */}
        <SettingSection title="Notifications">
          <SettingToggle
            icon="🔔"
            title="Push Notifications"
            subtitle="Get notified about expiring cards"
            value={true}
            onValueChange={(value) => {
              // TODO: Update notification preferences
              Alert.alert('Coming Soon', 'Notification settings coming soon!');
            }}
          />

          <SettingToggle
            icon="📍"
            title="Location Notifications"
            subtitle="Get notified when near stores"
            value={false}
            onValueChange={(value) => {
              // TODO: Update location notification preferences
              Alert.alert('Coming Soon', 'Location notifications coming soon!');
            }}
          />
        </SettingSection>

        {/* Data & Privacy Section */}
        <SettingSection title="Data & Privacy">
          <SettingRow
            icon="📦"
            title="Export Data"
            subtitle="Download all your gift card data"
            onPress={() => {
              Alert.alert('Coming Soon', 'Data export coming soon!');
            }}
          />

          <SettingRow
            icon="🗑️"
            title="Clear All Cards"
            subtitle="Delete all gift cards (cannot be undone)"
            onPress={() => {
              Alert.alert(
                'Clear All Cards',
                'This will permanently delete all your gift cards. This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Delete All',
                    style: 'destructive',
                    onPress: () => {
                      // TODO: Implement clear all cards
                      Alert.alert('Coming Soon', 'This feature is coming soon!');
                    },
                  },
                ]
              );
            }}
          />
        </SettingSection>

        {/* Support Section */}
        <SettingSection title="Support">
          <SettingRow
            icon="❓"
            title="Help Center"
            subtitle="FAQs and tutorials"
            onPress={() => {
              Linking.openURL('https://cardinalapp.com/help');
            }}
          />

          <SettingRow
            icon="✉️"
            title="Contact Support"
            subtitle="Get help from our team"
            onPress={handleContactSupport}
          />

          <SettingRow
            icon="⭐"
            title="Rate Cardinal"
            subtitle="Share your feedback"
            onPress={() => {
              // TODO: Implement app store rating
              Alert.alert('Coming Soon', 'App store rating coming soon!');
            }}
          />
        </SettingSection>

        {/* About Section */}
        <SettingSection title="About">
          <SettingRow
            icon="📄"
            title="Privacy Policy"
            onPress={() => {
              Linking.openURL('https://cardinalapp.com/privacy');
            }}
          />

          <SettingRow
            icon="📜"
            title="Terms of Service"
            onPress={() => {
              Linking.openURL('https://cardinalapp.com/terms');
            }}
          />

          <SettingRow
            icon="ℹ️"
            title="App Version"
            rightElement={
              <Text style={styles.versionText}>1.0.0</Text>
            }
            onPress={() => {}}
          />
        </SettingSection>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ by Cardinal Team
          </Text>
          <Text style={styles.footerSubtext}>
            © 2025 Cardinal. All rights reserved.
          </Text>
        </View>
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

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.xs,
  },

  dangerRow: {
    borderWidth: 1,
    borderColor: COLORS.error + '30',
  },

  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  settingIcon: {
    fontSize: FONTS.sizes.xl,
    marginRight: SPACING.sm,
  },

  settingTextContainer: {
    flex: 1,
  },

  settingTitle: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.medium,
    color: COLORS.text,
    marginBottom: SPACING.xs / 2,
  },

  dangerText: {
    color: COLORS.error,
  },

  settingSubtitle: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    lineHeight: FONTS.sizes.sm * 1.3,
  },

  chevron: {
    fontSize: FONTS.sizes['2xl'],
    color: COLORS.textLight,
    fontWeight: FONTS.weights.light,
    marginLeft: SPACING.sm,
  },

  versionText: {
    fontSize: FONTS.sizes.base,
    color: COLORS.textSecondary,
    fontWeight: FONTS.weights.medium,
  },

  signOutButton: {
    backgroundColor: COLORS.error,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  signOutText: {
    fontSize: FONTS.sizes.base,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.background,
  },

  footer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },

  footerText: {
    fontSize: FONTS.sizes.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },

  footerSubtext: {
    fontSize: FONTS.sizes.xs,
    color: COLORS.textLight,
  },
});

export default SettingsScreen;