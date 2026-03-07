/**
 * Login Screen
 * Modern 2026 light theme - premium minimal UI
 * Supports both Resident and Manager login
 * Logo image already includes "RESIIDO" branding
 */

import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

const COLORS = {
  background: '#F4F7FB',
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  textDark: '#1E293B',
  textLight: '#64748B',
  textMuted: '#94A3B8',
  white: '#FFFFFF',
  border: '#E2E8F0',
  inputBg: '#F8FAFC',
  error: '#EF4444',
  cardShadow: '#94A3B8',
  residentColor: '#2563EB',
  managerColor: '#7C3AED',
  residentBg: '#EFF6FF',
  managerBg: '#F5F3FF',
};

type LoginRole = 'resident' | 'manager';

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<LoginRole>('resident');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const roleColor = selectedRole === 'resident' ? COLORS.residentColor : COLORS.managerColor;

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Missing Email', 'Please enter your email address.');
      return;
    }
    if (!password) {
      Alert.alert('Missing Password', 'Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      await login({ email: email.trim(), password });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemo = (role: LoginRole) => {
    setSelectedRole(role);
    if (role === 'resident') {
      setEmail('resident@demo.com');
      setPassword('demo123');
    } else {
      setEmail('manager@demo.com');
      setPassword('demo123');
    }
  };

  return (
    <View style={styles.container}>
      {/* Gradient Header */}
      <LinearGradient
        colors={['#2ECC71', '#27AE60', '#3498DB']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <SafeAreaView>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          
          <View style={styles.headerContent}>
            <Image
              source={require('../assets/images/ResiiDo_logo_nobg.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brandName}>RESIIDO</Text>
            <Text style={styles.title}>WELCOME BACK</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* White Form Card */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.formContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formCard}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={Colors.gray[400]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={Colors.gray[400]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color={Colors.gray[400]} 
                />
              </TouchableOpacity>
            </View>

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotButton} activeOpacity={0.7}>
                <Text style={[styles.forgotText, { color: roleColor }]}>Forgot password?</Text>
              </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.loginButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#3498DB', '#2980B9']}
                style={styles.loginButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Logging in...' : 'Log in'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Create Account Link */}
            <TouchableOpacity 
              style={styles.createAccountLink}
              onPress={() => router.push('/register')}
            >
              <Text style={styles.createAccountText}>Create new account</Text>
            </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

            {/* Social Login Buttons */}
            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-apple" size={20} color={Colors.black} />
                <Text style={styles.socialButtonText}>Continue with Apple</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-google" size={20} color="#DB4437" />
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.socialButton}>
                <Ionicons name="logo-facebook" size={20} color="#4267B2" />
                <Text style={styles.socialButtonText}>Continue with Facebook</Text>
              </TouchableOpacity>
            </View>

            {/* Demo Login Options */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>Demo Accounts</Text>
              <TouchableOpacity 
                style={styles.demoButton}
                onPress={() => {
                  setEmail('resident@demo.com');
                  setPassword('demo123');
                }}
              >
                <Text style={styles.demoButtonText}>🏠 Fill Resident Demo</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.demoButton}
                onPress={() => {
                  setEmail('manager@demo.com');
                  setPassword('demo123');
                }}
              >
                <Text style={styles.demoButtonText}>👔 Fill Manager Demo</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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

  // Brand — logo image already includes "RESIIDO" text, no duplicate needed
  brandSection: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  logo: {
    width: 100,
    height: 100,
    maxHeight: 100,
    marginBottom: 6,
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
    marginBottom: 28,
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
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.text.primary,
  },
  eyeButton: {
    padding: 6,
    marginLeft: 4,
  },

  // Forgot
  forgotButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    marginTop: -4,
  },
  forgotPasswordText: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: '500',
  },

  // Login Button
  loginButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  createAccountText: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.gray[200],
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.text.secondary,
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
    backgroundColor: Colors.white,
    borderRadius: 12,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    gap: 10,
  },
  socialButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
  },

  // Demo
  demoSection: {
    marginTop: 24,
    padding: 16,
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    gap: 10,
  },
  demoLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  demoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  demoChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
    backgroundColor: COLORS.white,
  },
  demoChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.gray[500],
    textAlign: 'center',
    marginBottom: 8,
  },
  demoButton: {
    backgroundColor: Colors.white,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  demoButtonText: {
    color: Colors.text.primary,
    fontSize: 14,
    fontWeight: '700',
  },
});
