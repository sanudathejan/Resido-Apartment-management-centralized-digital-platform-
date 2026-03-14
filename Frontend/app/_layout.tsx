/**
 * Root Layout for Resiido App
 * Handles navigation structure and auth flow
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/context/AuthContext';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <Stack screenOptions={{ headerShown: false }}>
            {/* Entry Point */}
            <Stack.Screen name="index" />
            <Stack.Screen
              name="splash"
              options={{ animation: 'fade' }}
            />

            {/* Public Screens */}
            <Stack.Screen name="welcome" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
            <Stack.Screen name="verify" />

            {/* Authenticated Screens */}
            <Stack.Screen name="(tabs)" />

            {/* Modal Screens */}
            <Stack.Screen
              name="modal"
              options={{
                presentation: 'modal',
                title: 'Modal'
              }}
            />
            <Stack.Screen
              name="maintenance"
              options={{
                presentation: 'modal',
                headerShown: false,
                title: 'Maintenance Request'
              }}
            />
            <Stack.Screen
              name="common-area"
              options={{
                headerShown: false,
                title: 'Common Area Booking'
              }}
            />
            <Stack.Screen
              name="manager-dashboard"
              options={{
                headerShown: false,
                title: 'Manager Dashboard'
              }}
            />

          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
