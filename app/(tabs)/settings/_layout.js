// app/(tabs)/settings/_layout.js
// Layout for nested settings screens

import { Stack } from 'expo-router';
import { View } from 'react-native';

export default function SettingsLayout() {
  return (
    <View style={{ flex: 1, backgroundColor: '#141414' }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#141414' },
          cardStyle: { backgroundColor: '#141414' },
          animation: 'none',
        }}
      >
        <Stack.Screen 
          name="index"
          options={{
            title: 'Settings',
            cardStyle: { backgroundColor: '#141414' },
          }}
        />
        <Stack.Screen 
          name="email-preferences"
          options={{
            title: 'Email Preferences',
            cardStyle: { backgroundColor: '#141414' },
          }}
        />
        <Stack.Screen 
          name="change-password"
          options={{
            title: 'Change Password',
            cardStyle: { backgroundColor: '#141414' },
          }}
        />
        <Stack.Screen 
          name="notification-settings"
          options={{
            title: 'Notifications',
            cardStyle: { backgroundColor: '#141414' },
          }}
        />
      </Stack>
    </View>
  );
}