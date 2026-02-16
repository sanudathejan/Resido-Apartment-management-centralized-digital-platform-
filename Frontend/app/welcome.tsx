/**
 * Welcome Screen
 * Modern 2026 light theme - premium minimal splash
 * Centered logo with Register/Login buttons
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Dimensions,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const COLORS = {
  background: '#F4F7FB',
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',
  textDark: '#1E293B',
  textLight: '#64748B',
  textMuted: '#94A3B8',
  white: '#FFFFFF',
  border: '#E2E8F0',
  cardShadow: '#94A3B8',
};

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.safeArea}>
        {/* Top Spacing */}
        <View style={styles.spacer} />

        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/ResiiDo_logo_nobg.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.appName}>Resiido</Text>
          <Text style={styles.tagline}>Smart living, simplified</Text>
        </View>

        {/* Feature Pills */}
        <View style={styles.pillsContainer}>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Parking</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Payments</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Maintenance</Text>
          </View>
          <View style={styles.pill}>
            <Text style={styles.pillText}>Visitors</Text>
          </View>
        </View>

        {/* Bottom Buttons */}
        <View style={styles.buttonSection}>
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => router.push('/register')}
            activeOpacity={0.85}
          >
            <Text style={styles.registerButtonText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/login')}
            activeOpacity={0.7}
          >
            <Text style={styles.loginButtonText}>I already have an account</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 24,
  },
  spacer: {
    flex: 0.15,
  },

  // Logo
  logoSection: {
    flex: 0.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: width * 0.35,
    height: width * 0.35,
    borderRadius: width * 0.1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.cardShadow,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 20,
      },
      android: { elevation: 6 },
    }),
  },
  logo: {
    width: width * 0.22,
    height: width * 0.22,
  },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -1,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textLight,
  },

  // Feature Pills
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 40,
  },
  pill: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
  },

  // Buttons
  buttonSection: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 30,
    gap: 14,
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
      },
      android: { elevation: 6 },
    }),
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  loginButton: {
    backgroundColor: COLORS.white,
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  loginButtonText: {
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: '600',
  },
});
