import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, Platform, StyleSheet, View } from 'react-native';
import DashboardScreen from '../screens/main/DashboardScreen';
import CardDetailsScreen from '../screens/main/CardDetailsScreen';
import AddCardScreen from '../screens/main/AddCardScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import SettingsScreen from '../screens/main/SettingsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import SubscriptionScreen from '../screens/main/SubscriptionScreen';
import SupportScreen from '../screens/main/SupportScreen';
import { COLORS, FONTS, SPACING } from '../utils/constants';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom Tab Bar Icon Component
const TabBarIcon = ({ focused, icon, label }) => {
  return (
    <View style={styles.tabIconContainer}>
      <View style={[
        styles.iconWrapper,
        focused && styles.iconWrapperFocused,
      ]}>
        <Text style={[
          styles.tabIcon,
          focused && styles.tabIconFocused,
        ]}>
          {icon}
        </Text>
      </View>
      <Text style={[
        styles.tabLabel,
        focused && styles.tabLabelFocused,
      ]}>
        {label}
      </Text>
    </View>
  );
};

// Dashboard Stack Navigator (includes CardDetailsScreen)
const DashboardStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="DashboardHome" component={DashboardScreen} />
      <Stack.Screen name="CardDetails" component={CardDetailsScreen} />
    </Stack.Navigator>
  );
};

// Settings Stack Navigator (includes ProfileScreen, SubscriptionScreen, SupportScreen)
const SettingsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: COLORS.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="SettingsHome" component={SettingsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Subscription" component={SubscriptionScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
    </Stack.Navigator>
  );
};

/**
 * Main Navigator with Notifications Tab
 */
const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: COLORS.background,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === 'ios' ? 28 : 16,
          paddingTop: 12,
          height: Platform.OS === 'ios' ? 88 : 75,
          elevation: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon="🎁" label="Cards" />
          ),
        }}
      />

      <Tab.Screen
        name="AddCard"
        component={AddCardScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon="➕" label="Add Card" />
          ),
        }}
      />

      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon="🔔" label="Alerts" />
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsStack}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} icon="⚙️" label="Settings" />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 4,
  },

  iconWrapper: {
    width: 48,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    marginBottom: 4,
  },

  iconWrapperFocused: {
    backgroundColor: COLORS.primaryLight + '20',
  },

  tabIcon: {
    fontSize: 24,
    opacity: 0.6,
  },

  tabIconFocused: {
    fontSize: 26,
    opacity: 1,
    transform: [{ scale: 1.05 }],
  },

  tabLabel: {
    fontSize: 11,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    marginTop: 2,
  },

  tabLabelFocused: {
    fontSize: 11,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.primary,
  },
});

export default MainNavigator;