/**
 * Welcome Screen
 * Modern 2026 light theme — premium minimal splash
 * Logo PNG contains the building graphic + "RESIIDO" text
 * If user is already authenticated, offer "Continue" option
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
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

const { width, height } = Dimensions.get('window');

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
  green: '#10B981',
};

// Cap logo at 28% of screen height so it fits well
const LOGO_MAX_H = height * 0.28;

export default function WelcomeScreen() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <SafeAreaView style={styles.safeArea}>

        {/* ── Hero: centred logo ─────────────────────────────────── */}
        <View style={styles.heroSection}>
          <Image
            source={require('../assets/images/ResiiDo_logo_nobg.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.tagline}>Smart living, simplified</Text>
        </View>

        {/* ── Feature Pills ─────────────────────────────────────── */}
        <View style={styles.pillsContainer}>
          {[
            { label: 'Parking', icon: 'car-sport-outline' as const },
            { label: 'Payments', icon: 'wallet-outline' as const },
            { label: 'Maintenance', icon: 'construct-outline' as const },
            { label: 'Visitors', icon: 'people-outline' as const },
          ].map((f) => (
            <View key={f.label} style={styles.pill}>
              <Ionicons name={f.icon} size={14} color={COLORS.primary} />
              <Text style={styles.pillText}>{f.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Bottom Buttons ────────────────────────────────────── */}
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

  /* ── Hero ─────────────────────────────────────────────────────── */
  heroSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: width * 0.48,
    height: LOGO_MAX_H,
    maxWidth: 240,
    maxHeight: LOGO_MAX_H,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.textLight,
  },

  /* ── Feature Pills ───────────────────────────────────────────── */
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingBottom: 24,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
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

  /* ── Buttons ─────────────────────────────────────────────────── */
  buttonSection: {
    paddingBottom: Platform.OS === 'ios' ? 20 : 30,
    gap: 12,
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
