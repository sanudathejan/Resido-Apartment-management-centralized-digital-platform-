/**
 * Register Screen - CREATE ACCOUNT
 * Matching High Fidelity Prototype with gradient header and white form
 * Includes Resident/Manager role toggle
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
  Dimensions,
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';

const { width } = Dimensions.get('window');

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isManager, setIsManager] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 4 || password.length > 12) {
      Alert.alert('Error', 'Password must be 4-12 characters');
      return;
    }
    
    setIsLoading(true);
    try {
      const role: UserRole = isManager ? 'MANAGER' : 'RESIDENT';
      await register({
        email,
        password,
        name: email.split('@')[0],
        role,
      });
      Alert.alert('Success', 'Account created successfully!', [
        { text: 'Continue', onPress: () => router.replace('/(tabs)') }
      ]);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Unable to create account');
    } finally {
      setIsLoading(false);
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
            <Text style={styles.title}>CREATE ACCOUNT</Text>
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
            <Text style={styles.inputLabel}>Email</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="example@email.com"
                placeholderTextColor={Colors.gray[400]}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="4-12 characters"
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

            {/* Role Toggle - Resident/Manager */}
            <View style={styles.roleToggleContainer}>
              <Text style={[styles.roleLabel, !isManager && styles.roleLabelActive]}>
                Resident
              </Text>
              <Switch
                value={isManager}
                onValueChange={setIsManager}
                trackColor={{ false: Colors.primary, true: Colors.primary }}
                thumbColor={Colors.white}
                ios_backgroundColor={Colors.primary}
                style={styles.roleSwitch}
              />
              <Text style={[styles.roleLabel, isManager && styles.roleLabelActive]}>
                Manager
              </Text>
            </View>

            {/* Register Button */}
            <TouchableOpacity
              style={[styles.signUpButton, isLoading && styles.signUpButtonDisabled]}
              onPress={handleRegister}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#3498DB', '#2980B9']}
                style={styles.signUpButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.signUpButtonText}>
                  {isLoading ? 'Creating account...' : 'Register'}
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Already have account Link */}
            <TouchableOpacity 
              style={styles.loginLink}
              onPress={() => router.push('/login')}
            >
              <Text style={styles.loginLinkText}>Already have an account?</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue with</Text>
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
  header: {
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    marginLeft: 20,
    marginTop: 10,
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerContent: {
    alignItems: 'center',
    paddingTop: 10,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 5,
  },
  brandName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
    marginTop: 10,
    letterSpacing: 1,
  },
  formContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 30,
    paddingBottom: 20,
  },
  formCard: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: Colors.text.primary,
  },
  eyeIcon: {
    paddingHorizontal: 16,
  },
  roleToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    paddingVertical: 10,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.gray[400],
    marginHorizontal: 12,
  },
  roleLabelActive: {
    color: Colors.text.primary,
    fontWeight: '700',
  },
  roleSwitch: {
    transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }],
  },
  signUpButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  signUpButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  loginLink: {
    alignItems: 'center',
    marginBottom: 24,
  },
  loginLinkText: {
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
  },
  socialButtons: {
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
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
});
