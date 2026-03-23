/**
 * Root Layout for Resiido App
 * Handles navigation structure and auth flow
 */

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/context/AuthContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

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
<<<<<<< HEAD
=======
            {/* Entry Point */}
            <Stack.Screen name="index" />
            <Stack.Screen
              name="splash"
              options={{ animation: 'fade' }}
            />

>>>>>>> main
            {/* Public Screens */}
            <Stack.Screen name="welcome" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
<<<<<<< HEAD
            <Stack.Screen name="otp-verify" />
=======
            <Stack.Screen name="verify" />
>>>>>>> main

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
<<<<<<< HEAD
            <Stack.Screen
              name="visitor-management"
              options={{
                headerShown: false,
                title: 'Visitor Management'
              }}
            />
=======

>>>>>>> main
          </Stack>
          <StatusBar style="auto" />
        </ThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
