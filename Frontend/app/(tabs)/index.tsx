/**
 * Home Dashboard Screen
 * Matching High Fidelity Prototype - Dark blue theme with sidebar-like layout
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Image,
  Vibration,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const userName = user?.name || 'Henry';
  const residentNo = user?.apartmentNumber || 'B-4';
  const mobileNo = user?.phone || '+0123456987';
  const email = user?.email || 'henrysmith@gmail.com';

  const handleSOS = () => {
    Vibration.vibrate([0, 500, 200, 500]);
    Alert.alert(
      '🚨 SOS Alert',
      'Emergency alert has been sent to building management and emergency contacts.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleLogout = () => {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log out', style: 'destructive', onPress: () => {
        logout();
        router.replace('/welcome');
      }},
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <LinearGradient
        colors={['#1A4B6E', '#0D2137']}
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header with Logo and User Info */}
            <View style={styles.header}>
              {/* Logo Section */}
              <View style={styles.logoSection}>
                <Image
                  source={require('../../assets/images/ResiiDo_logo_nobg.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
              </View>

              {/* User Info Section */}
              <View style={styles.userInfoSection}>
                <Text style={styles.greeting}>Hello</Text>
                <Text style={styles.userName}>{userName}!</Text>
                
                <View style={styles.userDetails}>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Resident no</Text>
                    <Text style={styles.detailValue}>{residentNo}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Mobile no</Text>
                    <Text style={styles.detailValue}>{mobileNo}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Email</Text>
                    <Text style={styles.detailValue}>{email}</Text>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => router.push('/(tabs)/profile')}
                >
                  <Text style={styles.editButtonText}>Edit personal Details</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Logout Button */}
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Log out</Text>
            </TouchableOpacity>

            {/* SOS Button */}
            <TouchableOpacity 
              style={styles.sosButton}
              onPress={handleSOS}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#E74C3C', '#C0392B']}
                style={styles.sosGradient}
              >
                <Text style={styles.sosText}>SOS</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Feature Grid */}
            <View style={styles.featureGrid}>
              {/* Row 1 */}
              <View style={styles.featureRow}>
                <TouchableOpacity 
                  style={styles.featureCard}
                  onPress={() => router.push('/(tabs)/parking')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#1E5F8A', '#1A4B6E']}
                    style={styles.featureCardGradient}
                  >
                    <Ionicons name="car" size={32} color={Colors.white} />
                    <Text style={styles.featureTitle}>Parking</Text>
                    <Text style={styles.featureSubtitle}>Management</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.featureCard}
                  onPress={() => router.push('/(tabs)/announcements')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#1E5F8A', '#1A4B6E']}
                    style={styles.featureCardGradient}
                  >
                    <Ionicons name="calendar" size={32} color={Colors.white} />
                    <Text style={styles.featureTitle}>Common Area</Text>
                    <Text style={styles.featureSubtitle}>Booking</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              {/* Row 2 */}
              <View style={styles.featureRow}>
                <TouchableOpacity 
                  style={styles.featureCard}
                  onPress={() => router.push('/(tabs)/rent')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#1E5F8A', '#1A4B6E']}
                    style={styles.featureCardGradient}
                  >
                    <Ionicons name="card" size={32} color={Colors.white} />
                    <Text style={styles.featureTitle}>Account</Text>
                    <Text style={styles.featureSubtitle}>Information</Text>
                    <Text style={styles.featureSubtitle}>and Payment</Text>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.featureCard}
                  onPress={() => router.push('/maintenance')}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#1E5F8A', '#1A4B6E']}
                    style={styles.featureCardGradient}
                  >
                    <Ionicons name="construct" size={32} color={Colors.white} />
                    <Text style={styles.featureTitle}>Maintenance or</Text>
                    <Text style={styles.featureSubtitle}>repair request</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    marginTop: 10,
  },
  logoSection: {
    width: 80,
    alignItems: 'center',
  },
  logo: {
    width: 70,
    height: 70,
  },
  userInfoSection: {
    flex: 1,
    marginLeft: 10,
  },
  greeting: {
    fontSize: 16,
    color: Colors.white,
    opacity: 0.9,
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 12,
  },
  userDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    width: 80,
  },
  detailValue: {
    fontSize: 12,
    color: Colors.white,
    fontWeight: '500',
  },
  editButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'flex-start',
    marginTop: 20,
    marginLeft: 5,
  },
  logoutButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
  sosButton: {
    width: 100,
    height: 100,
    borderRadius: 20,
    marginTop: 20,
    marginLeft: 5,
    overflow: 'hidden',
    shadowColor: '#E74C3C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  sosGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosText: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 2,
  },
  featureGrid: {
    marginTop: 25,
    gap: 15,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 15,
  },
  featureCard: {
    flex: 1,
    height: 130,
    borderRadius: 20,
    overflow: 'hidden',
  },
  featureCardGradient: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureTitle: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
  featureSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
});
