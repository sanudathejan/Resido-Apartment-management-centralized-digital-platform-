/**
 * Register Screen
 * Modern 2026 light theme - premium minimal UI
 * Supports Resident/Manager role selection
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TextInput,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

const COLORS = {
  background: '#F4F7FB',
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  textDark: '#1E293B',
  textLight: '#64748B',
  textMuted: '#94A3B8',
  white: '#FFFFFF',
  border: '#E2E8F0',
  error: '#EF4444',
  cardShadow: '#94A3B8',
  residentColor: '#2563EB',
  managerColor: '#7C3AED',
  residentBg: '#EFF6FF',
  managerBg: '#F5F3FF',
};

type RegisterRole = 'resident' | 'manager';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RegisterRole>('resident');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const roleColor = selectedRole === 'resident' ? COLORS.residentColor : COLORS.managerColor;

  const handleRegister = async () => {
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }
    if (!password) {
      Alert.alert('Missing Password', 'Please enter a password.');
      return;
    }
    if (!confirmPassword) {
      Alert.alert('Missing Confirmation', 'Please confirm your password.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match.');
      return;
    }
    if (password.length < 4 || password.length > 12) {
      Alert.alert('Invalid Password', 'Password must be 4-12 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const role: UserRole = selectedRole === 'manager' ? 'MANAGER' : 'RESIDENT';
      await register({
        email: email.trim(),
        password,
        name: email.split('@')[0],
        role,
      });
      Alert.alert('Account Created', 'Your account has been created successfully.', [
        { text: 'Continue', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Unable to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
            </TouchableOpacity>

            {/* Logo & Brand */}
            <View style={styles.brandSection}>
              <Image
                source={require('../assets/images/ResiiDo_logo_nobg.png')}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.brandName}>Resiido</Text>
              <Text style={styles.subtitle}>Create your account</Text>
            </View>

            {/* Role Selector */}
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[
                  styles.roleTab,
                  selectedRole === 'resident' && {
                    backgroundColor: COLORS.residentBg,
                    borderColor: COLORS.residentColor,
                  },
                ]}
                onPress={() => setSelectedRole('resident')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="home-outline"
                  size={18}
                  color={selectedRole === 'resident' ? COLORS.residentColor : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.roleTabText,
                    selectedRole === 'resident' && { color: COLORS.residentColor, fontWeight: '700' },
                  ]}
                >
                  Resident
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleTab,
                  selectedRole === 'manager' && {
                    backgroundColor: COLORS.managerBg,
                    borderColor: COLORS.managerColor,
                  },
                ]}
                onPress={() => setSelectedRole('manager')}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="briefcase-outline"
                  size={18}
                  color={selectedRole === 'manager' ? COLORS.managerColor : COLORS.textMuted}
                />
                <Text
                  style={[
                    styles.roleTabText,
                    selectedRole === 'manager' && { color: COLORS.managerColor, fontWeight: '700' },
                  ]}
                >
                  Manager
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email */}
              <Text style={styles.inputLabel}>Email</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'email' && { borderColor: roleColor },
                ]}
              >
                <Ionicons name="mail-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* Password */}
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'password' && { borderColor: roleColor },
                ]}
              >
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="4-12 characters"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Confirm Password */}
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'confirm' && { borderColor: roleColor },
                ]}
              >
                <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Re-enter password"
                  placeholderTextColor={COLORS.textMuted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  onFocus={() => setFocusedField('confirm')}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Role Info */}
              <View style={[styles.roleInfoCard, { backgroundColor: selectedRole === 'resident' ? COLORS.residentBg : COLORS.managerBg }]}>
                <Ionicons
                  name={selectedRole === 'resident' ? 'information-circle-outline' : 'information-circle-outline'}
                  size={18}
                  color={roleColor}
                />
                <Text style={[styles.roleInfoText, { color: roleColor }]}>
                  {selectedRole === 'resident'
                    ? 'Resident accounts can manage parking, payments, maintenance, and visitors.'
                    : 'Manager accounts get access to building analytics, approvals, and resident management.'}
                </Text>
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[
                  styles.registerButton,
                  { backgroundColor: roleColor },
                  isLoading && styles.registerButtonDisabled,
                ]}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.registerButtonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Buttons */}
              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                  <Ionicons name="logo-google" size={20} color="#DB4437" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                  <Ionicons name="logo-apple" size={20} color={COLORS.textDark} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton} activeOpacity={0.7}>
                  <Ionicons name="logo-facebook" size={20} color="#1877F2" />
                </TouchableOpacity>
              </View>

              {/* Login Link */}
              <View style={styles.loginLink}>
                <Text style={styles.loginLinkText}>Already have an account? </Text>
                <TouchableOpacity onPress={() => router.push('/login')} activeOpacity={0.7}>
                  <Text style={[styles.loginLinkAction, { color: roleColor }]}>Log in</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Back
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },

  // Brand
  brandSection: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 24,
  },
  logo: {
    width: 64,
    height: 64,
    marginBottom: 10,
  },
  brandName: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textLight,
    marginTop: 4,
    fontWeight: '500',
  },

  // Role Selector
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  roleTabText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textMuted,
  },

  // Form
  form: {},
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 16,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 15,
    color: COLORS.textDark,
  },
  eyeButton: {
    padding: 6,
    marginLeft: 4,
  },

  // Role Info
  roleInfoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    marginBottom: 24,
  },
  roleInfoText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
  },

  // Register Button
  registerButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    minHeight: 52,
    ...Platform.select({
      ios: {
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.border,
  },
  dividerText: {
    marginHorizontal: 14,
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },

  // Social
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 28,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },

  // Login Link
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginLinkText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  loginLinkAction: {
    fontSize: 14,
    fontWeight: '700',
  },
});
