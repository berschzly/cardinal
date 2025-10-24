import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import DashboardScreen from '../screens/main/DashboardScreen';
import AddCardScreen from '../screens/main/AddCardScreen';
import { COLORS, FONTS } from '../utils/constants';

const Tab = createBottomTabNavigator();

/**
 * Main Navigator
 * Bottom tab navigator for authenticated users
 */
const MainNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: FONTS.sizes.xs,
          fontWeight: FONTS.weights.medium,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Cards',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>🎁</Text>
          ),
        }}
      />

      <Tab.Screen
        name="AddCard"
        component={AddCardScreen}
        options={{
          tabBarLabel: 'Add Card',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size }}>➕</Text>
          ),
        }}
      />

      {/* TODO: Add more tabs in later phases:
      - Notifications tab (Phase 14)
      - Settings tab (Phase 9)
      */}
    </Tab.Navigator>
  );
};

export default MainNavigator;