/**
 * Login Screen - WELCOME BACK
 * Matching High Fidelity Prototype with gradient header and white form card
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    
    setIsLoading(true);
    try {
      await login({ email, password });
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  // Demo login for testing
  const handleDemoLogin = () => {
    router.replace('/(tabs)');
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
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot your password?</Text>
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

            {/* Demo Login (for testing) */}
            <TouchableOpacity 
              style={styles.demoButton}
              onPress={handleDemoLogin}
            >
              <Text style={styles.demoButtonText}>Demo Login (Skip)</Text>
            </TouchableOpacity>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: Colors.secondary,
    fontSize: 14,
    fontWeight: '500',
  },
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
    color: Colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  createAccountLink: {
    alignItems: 'center',
    marginBottom: 24,
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
  demoButton: {
    marginTop: 20,
    alignItems: 'center',
    paddingVertical: 12,
  },
  demoButtonText: {
    color: Colors.gray[400],
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
