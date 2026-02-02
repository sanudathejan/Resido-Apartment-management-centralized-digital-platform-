/**
 * Home Dashboard Screen
 * Supports both Resident and Manager views
 * Matching High Fidelity Prototype - Dark blue theme
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
  Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();
  
  // Toggle between Resident and Manager view
  const [viewMode, setViewMode] = useState<'RESIDENT' | 'MANAGER'>(
    user?.role === 'MANAGER' ? 'MANAGER' : 'RESIDENT'
  );

  // User info
  const userName = user?.name || 'User';
  const residentNo = user?.apartmentNumber || 'B-4';
  const mobileNo = user?.phone || '+94 XXXX XXXX';
  const email = user?.email || 'user@email.com';

  // Manager/Apartment info
  const apartmentName = user?.managedApartment?.name || 'PrimeLux Residence Colombo';
  const apartmentLocation = user?.managedApartment?.location || '23/A, Bakers street, Colombo 7';
  const numberOfResidences = user?.managedApartment?.numberOfUnits || 64;

  const handleSOS = () => {
    Vibration.vibrate([0, 500, 200, 500]);
    Alert.alert(
      '🚨 SOS Alert',
      'Emergency alert has been sent to building management, security, and your emergency contacts.',
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

  const toggleViewMode = () => {
    setViewMode(viewMode === 'RESIDENT' ? 'MANAGER' : 'RESIDENT');
  };

  // Resident Dashboard View
  const ResidentDashboard = () => (
    <>
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
          <Text style={styles.sosText}>SOS!</Text>
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
              <MaterialCommunityIcons name="parking" size={36} color={Colors.white} />
              <Text style={styles.featureTitle}>Parking</Text>
              <Text style={styles.featureSubtitle}>Management</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.featureCard}
            onPress={() => router.push('/common-area')}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#1E5F8A', '#1A4B6E']}
              style={styles.featureCardGradient}
            >
              <MaterialCommunityIcons name="calendar-clock" size={36} color={Colors.white} />
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
              <MaterialCommunityIcons name="account-cash" size={36} color={Colors.white} />
              <Text style={styles.featureTitle}>Account Info</Text>
              <Text style={styles.featureSubtitle}>& Payment</Text>
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
              <MaterialCommunityIcons name="tools" size={36} color={Colors.white} />
              <Text style={styles.featureTitle}>Maintenance</Text>
              <Text style={styles.featureSubtitle}>Requests</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  // Manager Dashboard View
  const ManagerDashboard = () => (
    <>
      {/* Header with Logo and Apartment Info */}
      <View style={styles.header}>
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <Image
            source={require('../../assets/images/ResiiDo_logo_nobg.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Apartment Info Section */}
        <View style={styles.userInfoSection}>
          <View style={styles.managerInfoCard}>
            <View style={styles.managerInfoRow}>
              <Text style={styles.managerInfoLabel}>Apartment Name</Text>
              <Text style={styles.managerInfoValue}>{apartmentName}</Text>
            </View>
            <View style={styles.managerInfoRow}>
              <Text style={styles.managerInfoLabel}>Apartment Location</Text>
              <Text style={styles.managerInfoValue}>{apartmentLocation}</Text>
            </View>
            <View style={styles.managerInfoRow}>
              <Text style={styles.managerInfoLabel}>Number of Residences</Text>
              <Text style={styles.managerInfoValue}>{numberOfResidences}</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Text style={styles.moreButtonText}>more</Text>
            <Ionicons name="chevron-forward" size={14} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Announcements Card */}
      <TouchableOpacity 
        style={styles.announcementCard}
        onPress={() => router.push('/(tabs)/announcements')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#1E5F8A', '#1A4B6E']}
          style={styles.announcementGradient}
        >
          <Text style={styles.announcementTitle}>Announcements</Text>
          <TouchableOpacity style={styles.showDetailsButton}>
            <Text style={styles.showDetailsText}>Show More Details</Text>
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>

      {/* Dashboard Card */}
      <TouchableOpacity 
        style={styles.dashboardCard}
        onPress={() => router.push('/manager-dashboard')}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#1E5F8A', '#1A4B6E']}
          style={styles.dashboardGradient}
        >
          <Text style={styles.dashboardTitle}>Dashboard</Text>
          <Text style={styles.dashboardSubtitle}>Tap to show info</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.managerLogoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Log out</Text>
      </TouchableOpacity>
    </>
  );

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
            {/* View Mode Toggle (only show if user can be both) */}
            {(user?.role === 'MANAGER' || user?.role === 'ADMIN') && (
              <View style={styles.viewModeToggle}>
                <Text style={[styles.viewModeLabel, viewMode === 'RESIDENT' && styles.viewModeLabelActive]}>
                  Resident
                </Text>
                <Switch
                  value={viewMode === 'MANAGER'}
                  onValueChange={toggleViewMode}
                  trackColor={{ false: '#2ECC71', true: '#2ECC71' }}
                  thumbColor={Colors.white}
                  ios_backgroundColor="#2ECC71"
                  style={styles.viewModeSwitch}
                />
                <Text style={[styles.viewModeLabel, viewMode === 'MANAGER' && styles.viewModeLabelActive]}>
                  Manager
                </Text>
              </View>
            )}

            {/* Render appropriate dashboard based on view mode */}
            {viewMode === 'RESIDENT' ? <ResidentDashboard /> : <ManagerDashboard />}
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
  viewModeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 15,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 25,
    alignSelf: 'center',
    paddingHorizontal: 20,
  },
  viewModeLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 10,
  },
  viewModeLabelActive: {
    color: Colors.white,
    fontWeight: '700',
  },
  viewModeSwitch: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }],
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
    flex: 1,
  },
  editButton: {
    backgroundColor: 'rgba(46, 204, 113, 0.8)',
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
  // Manager Info Styles
  managerInfoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    marginBottom: 10,
  },
  managerInfoRow: {
    marginBottom: 10,
  },
  managerInfoLabel: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 2,
  },
  managerInfoValue: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '600',
  },
  moreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  moreButtonText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '500',
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
  managerLogoutButton: {
    backgroundColor: '#E74C3C',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 30,
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
  // Manager Dashboard Cards
  announcementCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 20,
    height: 120,
  },
  announcementGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  announcementTitle: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  showDetailsButton: {
    backgroundColor: 'rgba(46, 204, 113, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  showDetailsText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  dashboardCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 20,
    height: 180,
  },
  dashboardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dashboardTitle: {
    color: Colors.white,
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  dashboardSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
  },
});
