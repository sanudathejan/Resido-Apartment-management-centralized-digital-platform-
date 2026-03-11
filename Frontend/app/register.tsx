/**
 * Register Screen
 * Modern 2026 light theme - premium minimal UI
 * Supports Resident/Manager role selection
 * Logo image already includes "RESIIDO" branding
 */

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TextInput,
  Image,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { UserRole } from '@/types';
import { API_CONFIG } from '@/constants/config';
import houseService, { House } from '@/services/houseService';

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
  success: '#10B981',
  successBg: '#ECFDF5',
  occupiedRed: '#EF4444',
  occupiedBg: '#FEF2F2',
  disabledBg: '#F8FAFC',
};

type RegisterRole = 'resident' | 'manager';

// Group house numbers by floor for section display
const FLOOR_LABELS: Record<string, string> = {
  'G': 'Ground Floor',
  '1': 'Floor 1',
  '2': 'Floor 2',
  '3': 'Floor 3',
  '4': 'Floor 4',
  '5': 'Floor 5',
  '6': 'Floor 6',
  '7': 'Floor 7',
  '8': 'Floor 8',
  '9': 'Floor 9',
  '10': 'Floor 10',
};

export default function RegisterScreen() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [showHousePicker, setShowHousePicker] = useState(false);
  const [houseSearchQuery, setHouseSearchQuery] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<RegisterRole>('resident');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Houses from API
  const [houses, setHouses] = useState<House[]>([]);
  const [housesLoading, setHousesLoading] = useState(false);
  const [housesError, setHousesError] = useState<string | null>(null);

  // Fetch houses from backend
  const fetchHouses = useCallback(async () => {
    setHousesLoading(true);
    setHousesError(null);
    try {
      const data = await houseService.getAllHouses();
      const sorted = data.sort((a, b) => {
        const [floorA, unitA] = a.houseNumber.split('-');
        const [floorB, unitB] = b.houseNumber.split('-');
        const floorNumA = floorA === 'G' ? -1 : parseInt(floorA);
        const floorNumB = floorB === 'G' ? -1 : parseInt(floorB);
        if (floorNumA !== floorNumB) return floorNumA - floorNumB;
        return parseInt(unitA) - parseInt(unitB);
      });
      setHouses(sorted);
    } catch (error: any) {
      setHousesError('Failed to load houses. Please try again.');
      console.error('Fetch houses error:', error);
    } finally {
      setHousesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHouses();
  }, [fetchHouses]);

  // Filtered houses based on search
  const filteredHouses = useMemo(() => {
    if (!houseSearchQuery.trim()) return houses;
    const q = houseSearchQuery.toLowerCase();
    return houses.filter(h => h.houseNumber.toLowerCase().includes(q));
  }, [houseSearchQuery, houses]);

  // Count available houses
  const availableCount = useMemo(() => houses.filter(h => !h.occupied).length, [houses]);

  const roleColor = selectedRole === 'resident' ? COLORS.residentColor : COLORS.managerColor;

  // ==========================================
  // REGISTER HANDLER
  // ==========================================
  const handleRegister = () => {
    console.log('=== CREATE ACCOUNT PRESSED ===');

    if (!name.trim()) {
      Alert.alert('Missing Name', 'Please enter your full name.');
      return;
    }
    if (selectedRole === 'resident' && !houseNumber) {
      Alert.alert('Missing House Number', 'Please select your house number.');
      return;
    }
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

    // Send registration request to backend (fire and forget)
    const role: UserRole = selectedRole === 'manager' ? 'MANAGER' : 'RESIDENT';
    const payload = {
      name: name.trim(),
      email: email.trim(),
      password,
      role,
      ...(selectedRole === 'resident' ? { requestedHouseNumber: houseNumber } : {}),
    };

    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`;

    // Fire API call in background
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then(async (response) => {
        const text = await response.text();
        console.log('Registration response:', response.status, text);
        if (!response.ok) {
          let errorMsg = 'Registration request failed on the server.';
          try {
            const json = JSON.parse(text);
            errorMsg = json.message || json.error || errorMsg;
          } catch (_e) {
            if (text) errorMsg = text;
          }
          Alert.alert('Registration Issue', errorMsg);
        } else {
          console.log('Registration successful - verification code should be sent');
        }
      })
      .catch((error) => {
        console.log('Registration error:', error);
        Alert.alert(
          'Connection Error',
          'Could not reach the server. The verification code may not have been sent. Please go back and try again.'
        );
      });

    // Navigate to verify page immediately
    router.push({
      pathname: '/verify',
      params: { email: email.trim() },
    });
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

            {/* Logo */}
            <View style={styles.brandSection}>
              <Image
                source={require('../assets/images/ResiiDo_logo_nobg.png')}
                style={styles.logo}
                resizeMode="contain"
              />
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
              {/* Full Name */}
              <Text style={styles.inputLabel}>Full Name</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === 'name' && { borderColor: roleColor },
                ]}
              >
                <Ionicons name="person-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={COLORS.textMuted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  onFocus={() => setFocusedField('name')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* House Number — Resident only */}
              {selectedRole === 'resident' && (
                <>
                  <View style={styles.houseLabelRow}>
                    <Text style={[styles.inputLabel, { marginBottom: 0 }]}>House Number</Text>
                    {houses.length > 0 && (
                      <Text style={styles.availableCountBadge}>
                        {availableCount} available
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.inputContainer,
                      focusedField === 'house' && { borderColor: roleColor },
                    ]}
                    onPress={() => {
                      setShowHousePicker(true);
                      setHouseSearchQuery('');
                      if (houses.length === 0 && !housesLoading) {
                        fetchHouses();
                      }
                    }}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="business-outline" size={18} color={COLORS.textMuted} style={styles.inputIcon} />
                    <Text
                      style={[
                        styles.input,
                        { paddingVertical: 15 },
                        !houseNumber && { color: COLORS.textMuted },
                      ]}
                    >
                      {houseNumber || 'Select your house number'}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color={COLORS.textMuted} />
                  </TouchableOpacity>
                </>
              )}

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
                  name="information-circle-outline"
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
              <Pressable
                style={({ pressed }) => [
                  styles.registerButton,
                  { backgroundColor: roleColor },
                  isLoading && styles.registerButtonDisabled,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.registerButtonText}>Create Account</Text>
                )}
              </Pressable>

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

      {/* House Number Picker Modal */}
      <Modal
        visible={showHousePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowHousePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select House Number</Text>
              <TouchableOpacity
                onPress={() => setShowHousePicker(false)}
                style={styles.modalCloseButton}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={22} color={COLORS.textDark} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.modalSearchContainer}>
              <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
              <TextInput
                style={styles.modalSearchInput}
                placeholder="Search house number..."
                placeholderTextColor={COLORS.textMuted}
                value={houseSearchQuery}
                onChangeText={setHouseSearchQuery}
                autoCapitalize="none"
              />
              {houseSearchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setHouseSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* House Number List */}
            {housesLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.residentColor} />
                <Text style={styles.loadingText}>Loading houses...</Text>
              </View>
            ) : housesError ? (
              <View style={styles.errorContainer}>
                <Ionicons name="cloud-offline-outline" size={40} color={COLORS.error} />
                <Text style={styles.errorText}>{housesError}</Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={fetchHouses}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh" size={18} color={COLORS.white} />
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <FlatList
                data={filteredHouses}
                keyExtractor={(item) => item.id.toString()}
                showsVerticalScrollIndicator={false}
                style={styles.modalList}
                renderItem={({ item, index }) => {
                  const floorKey = item.houseNumber.split('-')[0];
                  const prevItem = index > 0 ? filteredHouses[index - 1] : null;
                  const prevFloorKey = prevItem ? prevItem.houseNumber.split('-')[0] : null;
                  const showFloorHeader = floorKey !== prevFloorKey;
                  const isOccupied = item.occupied;
                  const isSelected = houseNumber === item.houseNumber;

                  return (
                    <>
                      {showFloorHeader && (
                        <View style={styles.floorHeader}>
                          <Text style={styles.floorHeaderText}>
                            {FLOOR_LABELS[floorKey] || `Floor ${floorKey}`}
                          </Text>
                        </View>
                      )}
                      <TouchableOpacity
                        style={[
                          styles.houseItem,
                          isSelected && {
                            backgroundColor: COLORS.residentBg,
                            borderColor: COLORS.residentColor,
                          },
                          isOccupied && styles.houseItemOccupied,
                        ]}
                        onPress={() => {
                          if (!isOccupied) {
                            setHouseNumber(item.houseNumber);
                            setShowHousePicker(false);
                          }
                        }}
                        activeOpacity={isOccupied ? 1 : 0.7}
                        disabled={isOccupied}
                      >
                        <Ionicons
                          name={isOccupied ? 'lock-closed-outline' : 'home-outline'}
                          size={18}
                          color={
                            isOccupied
                              ? COLORS.occupiedRed
                              : isSelected
                              ? COLORS.residentColor
                              : COLORS.textMuted
                          }
                        />
                        <View style={styles.houseItemContent}>
                          <Text
                            style={[
                              styles.houseItemText,
                              isSelected && {
                                color: COLORS.residentColor,
                                fontWeight: '700',
                              },
                              isOccupied && styles.houseItemTextOccupied,
                            ]}
                          >
                            {item.houseNumber}
                          </Text>
                        </View>
                        {isOccupied ? (
                          <View style={styles.occupiedBadge}>
                            <View style={styles.occupiedDot} />
                            <Text style={styles.occupiedBadgeText}>Occupied</Text>
                          </View>
                        ) : isSelected ? (
                          <Ionicons name="checkmark-circle" size={20} color={COLORS.residentColor} />
                        ) : (
                          <View style={styles.availableBadge}>
                            <View style={styles.availableDot} />
                            <Text style={styles.availableBadgeText}>Available</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptySearch}>
                    <Ionicons name="search" size={32} color={COLORS.textMuted} />
                    <Text style={styles.emptySearchText}>No matching house numbers</Text>
                  </View>
                }
              />
            )}
          </View>
        </View>
      </Modal>
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

  // Login Link
  loginLink: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  loginLinkText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  loginLinkAction: {
    fontSize: 14,
    fontWeight: '700',
  },

  // House Label Row
  houseLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  availableCountBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.success,
    backgroundColor: COLORS.successBg,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    overflow: 'hidden',
  },

  // House Picker Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '75%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: 0.2,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textDark,
    paddingVertical: 0,
  },
  modalList: {
    paddingHorizontal: 20,
  },
  floorHeader: {
    paddingTop: 14,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 6,
  },
  floorHeaderText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textLight,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  houseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 4,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  houseItemContent: {
    flex: 1,
  },
  houseItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  houseItemOccupied: {
    backgroundColor: COLORS.disabledBg,
    opacity: 0.7,
  },
  houseItemTextOccupied: {
    color: COLORS.textMuted,
    textDecorationLine: 'line-through',
  },

  // Status Badges
  occupiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.occupiedBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  occupiedDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.occupiedRed,
  },
  occupiedBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.occupiedRed,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 5,
  },
  availableDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.success,
  },
  availableBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.success,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },

  // Loading & Error States
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 14,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.error,
    fontWeight: '500',
    textAlign: 'center',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.residentColor,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
  },
  retryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  emptySearch: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptySearchText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
