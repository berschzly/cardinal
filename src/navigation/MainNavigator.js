import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';  // Add this import
import DashboardScreen from '../screens/main/DashboardScreen';
import { COLORS, FONTS } from '../utils/constants';

const Tab = createBottomTabNavigator();

/**
 * Main Navigator
 * Bottom tab navigator for authenticated users
 * Currently only has Dashboard tab (more tabs in later phases)
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

      {/* TODO: Add more tabs in later phases:
      - AddCard tab (Phase 6)
      - Notifications tab (Phase 14)
      - Settings tab (Phase 9)
      */}
    </Tab.Navigator>
  );
};

export default MainNavigator;