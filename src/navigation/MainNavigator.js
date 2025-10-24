import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import DashboardScreen from '../screens/main/DashboardScreen';
import CardDetailsScreen from '../screens/main/CardDetailsScreen';
import AddCardScreen from '../screens/main/AddCardScreen';
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

// Dashboard Stack Navigator
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

/**
 * Main Navigator with Beautiful Tab Bar
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
          backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.9)' : COLORS.background,
          borderTopColor: COLORS.border,
          borderTopWidth: 0.5,
          paddingBottom: Platform.OS === 'ios' ? 32 : 20,
          paddingTop: 16,
          height: Platform.OS === 'ios' ? 95 : 82,
          elevation: 24,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.12,
          shadowRadius: 16,
        },
        tabBarBackground: () => (
          Platform.OS === 'ios' ? (
            <BlurView
              intensity={95}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : null
        ),
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
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 6,
  },

  iconWrapper: {
    width: 52,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginBottom: 6,
    backgroundColor: 'transparent',
  },

  iconWrapperFocused: {
    backgroundColor: COLORS.primary + '15', // 15% opacity
  },

  tabIcon: {
    fontSize: 26,
    opacity: 0.5,
  },

  tabIconFocused: {
    fontSize: 28,
    opacity: 1,
  },

  tabLabel: {
    fontSize: 10.5,
    fontWeight: FONTS.weights.medium,
    color: COLORS.textSecondary,
    marginTop: 2,
    letterSpacing: 0.2,
  },

  tabLabelFocused: {
    fontSize: 10.5,
    fontWeight: FONTS.weights.semiBold,
    color: COLORS.primary,
    letterSpacing: 0.2,
  },
});

export default MainNavigator;