/**
 * Welcome Screen
 * Splash page matching High Fidelity Prototype - Green to Blue gradient
 * with centered logo and Register/Login buttons at bottom
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient
      colors={['#2ECC71', '#27AE60', '#3498DB']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <SafeAreaView style={styles.safeArea}>
        {/* Centered Logo Section */}
        <View style={styles.logoSection}>
          <Image
            source={require('../assets/images/ResiiDo_logo_nobg.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.appName}>RESIIDO</Text>
        </View>

        {/* Bottom Buttons Section */}
        <View style={styles.buttonSection}>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.registerButton}
              onPress={() => router.push('/register')}
              activeOpacity={0.8}
            >
              <Text style={styles.registerButtonText}>Register</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.loginButton}
              onPress={() => router.push('/login')}
              activeOpacity={0.8}
            >
              <Text style={styles.loginButtonText}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: 'space-between',
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  logo: {
    width: width * 0.55,
    height: width * 0.55,
    marginBottom: 10,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.white,
    letterSpacing: 3,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  buttonSection: {
    paddingHorizontal: 30,
    paddingBottom: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 15,
  },
  registerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.white,
    minWidth: 130,
  },
  registerButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loginButton: {
    backgroundColor: Colors.white,
    paddingVertical: 14,
    paddingHorizontal: 35,
    borderRadius: 25,
    minWidth: 130,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonText: {
    color: '#2ECC71',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});
