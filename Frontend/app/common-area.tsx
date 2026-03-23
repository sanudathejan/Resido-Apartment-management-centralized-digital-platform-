/**
 * Common Area Booking Screen
 * Book facilities like gym, pool, party hall, etc.
 * Modern 2026 light theme design
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
  Dimensions,
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { CommonArea, CommonAreaBooking } from '@/types';

const { width } = Dimensions.get('window');

/* ── Design-system tokens ────────────────────────────────────────────── */
const C = {
  bg: '#F4F7FB',
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  white: '#FFFFFF',
  textDark: '#1E293B',
  textLight: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  success: '#10B981',
  successBg: '#ECFDF5',
  warning: '#F59E0B',
  warningBg: '#FFFBEB',
  error: '#EF4444',
  errorBg: '#FEF2F2',
  purple: '#7C3AED',
  purpleBg: '#F5F3FF',
  cancelledGray: '#94A3B8',
  cancelledGrayBg: '#F1F5F9',
} as const;

/* ── Cross-platform shadow helper ────────────────────────────────────── */
const shadow = (elevation: number) =>
  Platform.select({
    ios: {
      shadowColor: '#64748B',
      shadowOffset: { width: 0, height: Math.round(elevation / 2) },
      shadowOpacity: 0.08 + elevation * 0.01,
      shadowRadius: elevation * 1.2,
    },
    android: {
      elevation,
    },
    default: {
      elevation,
    },
  });

// ─── Mock common areas data ─────────────────────────────────────────
const mockCommonAreas: CommonArea[] = [
  {
    id: 1,
    name: 'Swimming Pool',
    description: 'Olympic-sized pool with lifeguard on duty',
    capacity: 20,
    isAvailable: true,
    apartmentId: 1,
    openTime: '06:00',
    closeTime: '21:00',
    rules: ['No diving', 'Shower before entering', 'Children must be supervised'],
  },
  {
    id: 2,
    name: 'Fitness Center',
    description: 'Fully equipped gym with modern equipment',
    capacity: 15,
    isAvailable: true,
    apartmentId: 1,
    openTime: '05:00',
    closeTime: '23:00',
    rules: ['Wipe equipment after use', 'Return weights to rack', 'No food allowed'],
  },
  {
    id: 3,
    name: 'Party Hall',
    description: 'Spacious hall for events and celebrations',
    capacity: 100,
    isAvailable: true,
    apartmentId: 1,
    openTime: '09:00',
    closeTime: '22:00',
    rules: ['Advance booking required', 'Clean up after use', 'Noise limit after 10pm'],
  },
  {
    id: 4,
    name: 'BBQ Area',
    description: 'Outdoor BBQ pit with seating area',
    capacity: 30,
    isAvailable: true,
    apartmentId: 1,
    openTime: '10:00',
    closeTime: '21:00',
    rules: ['Bring your own supplies', 'Dispose of coal properly', 'Clean grill after use'],
  },
  {
    id: 5,
    name: 'Meeting Room',
    description: 'Conference room with projector and whiteboard',
    capacity: 12,
    isAvailable: false,
    apartmentId: 1,
    openTime: '08:00',
    closeTime: '20:00',
    rules: ['Keep quiet', 'Maximum 2 hour booking', 'No food or drinks'],
  },
  {
    id: 6,
    name: 'Rooftop Garden',
    description: 'Beautiful garden with city views',
    capacity: 25,
    isAvailable: true,
    apartmentId: 1,
    openTime: '06:00',
    closeTime: '22:00',
    rules: ['No littering', 'No loud music', 'Pet-friendly'],
  },
];

// ─── Mock bookings ──────────────────────────────────────────────────
const mockBookings: CommonAreaBooking[] = [
  {
    id: 1,
    commonArea: mockCommonAreas[0],
    resident: { id: 1, name: 'John Doe', email: 'john@email.com', role: 'RESIDENT' },
    date: '2026-02-05',
    startTime: '10:00',
    endTime: '12:00',
    purpose: 'Swimming practice',
    status: 'APPROVED',
  },
  {
    id: 2,
    commonArea: mockCommonAreas[2],
    resident: { id: 1, name: 'John Doe', email: 'john@email.com', role: 'RESIDENT' },
    date: '2026-02-10',
    startTime: '18:00',
    endTime: '22:00',
    purpose: 'Birthday party',
    status: 'PENDING',
  },
];

/* ══════════════════════════════════════════════════════════════════════ */

export default function CommonAreaScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'areas' | 'bookings'>('areas');
  const [commonAreas, setCommonAreas] = useState<CommonArea[]>([]);
  const [bookings, setBookings] = useState<CommonAreaBooking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState<CommonArea | null>(null);

  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setCommonAreas(mockCommonAreas);
      setBookings(mockBookings);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleBookArea = (area: CommonArea) => {
    if (!area.isAvailable) {
      Alert.alert('Not Available', 'This area is currently unavailable for booking.');
      return;
    }
    setSelectedArea(area);
    setShowBookingModal(true);
  };

  const handleSubmitBooking = () => {
    if (!bookingForm.date || !bookingForm.startTime || !bookingForm.endTime) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const newBooking: CommonAreaBooking = {
      id: bookings.length + 1,
      commonArea: selectedArea!,
      resident: user!,
      date: bookingForm.date,
      startTime: bookingForm.startTime,
      endTime: bookingForm.endTime,
      purpose: bookingForm.purpose,
      status: 'PENDING',
    };

    setBookings([...bookings, newBooking]);
    setShowBookingModal(false);
    setBookingForm({ date: '', startTime: '', endTime: '', purpose: '' });
    Alert.alert('Success', 'Booking request submitted successfully!');
  };

  const getAreaIcon = (name: string): keyof typeof Ionicons.glyphMap => {
    const icons: Record<string, keyof typeof Ionicons.glyphMap> = {
      'Swimming Pool': 'water',
      'Fitness Center': 'fitness',
      'Party Hall': 'musical-notes',
      'BBQ Area': 'bonfire',
      'Meeting Room': 'people',
      'Rooftop Garden': 'leaf',
    };
    return icons[name] || 'business';
  };

  const getStatusMeta = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return { color: C.success, bg: C.successBg, label: 'Approved' };
      case 'PENDING':
        return { color: C.warning, bg: C.warningBg, label: 'Pending' };
      case 'REJECTED':
        return { color: C.error, bg: C.errorBg, label: 'Rejected' };
      case 'CANCELLED':
        return { color: C.cancelledGray, bg: C.cancelledGrayBg, label: 'Cancelled' };
      default:
        return { color: C.cancelledGray, bg: C.cancelledGrayBg, label: status };
    }
  };

  /* ── Area card ─────────────────────────────────────────────────────── */
  const AreaCard = ({ area }: { area: CommonArea }) => (
    <TouchableOpacity
      style={[styles.areaCard, !area.isAvailable && styles.areaCardUnavailable]}
      onPress={() => handleBookArea(area)}
      activeOpacity={0.7}
    >
      <View style={styles.areaCardHeader}>
        <View style={styles.areaIconContainer}>
          <Ionicons name={getAreaIcon(area.name)} size={24} color={C.purple} />
        </View>
        {!area.isAvailable && (
          <View style={styles.unavailableBadge}>
            <View style={[styles.statusDot, { backgroundColor: C.error }]} />
            <Text style={styles.unavailableBadgeText}>Unavailable</Text>
          </View>
        )}
        {area.isAvailable && (
          <View style={styles.availableBadge}>
            <View style={[styles.statusDot, { backgroundColor: C.success }]} />
            <Text style={styles.availableBadgeText}>Available</Text>
          </View>
        )}
      </View>

      <Text style={styles.areaName}>{area.name}</Text>
      <Text style={styles.areaDescription} numberOfLines={2}>
        {area.description}
      </Text>

      <View style={styles.areaDivider} />

      <View style={styles.areaDetails}>
        <View style={styles.areaDetailItem}>
          <Ionicons name="people-outline" size={15} color={C.textMuted} />
          <Text style={styles.areaDetailText}>Max {area.capacity}</Text>
        </View>
        <View style={styles.areaDetailItem}>
          <Ionicons name="time-outline" size={15} color={C.textMuted} />
          <Text style={styles.areaDetailText}>
            {area.openTime} - {area.closeTime}
          </Text>
        </View>
      </View>

      {area.isAvailable && (
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => handleBookArea(area)}
          activeOpacity={0.8}
        >
          <Ionicons name="calendar-outline" size={16} color={C.white} style={{ marginRight: 6 }} />
          <Text style={styles.bookButtonText}>Book Now</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  /* ── Booking card ──────────────────────────────────────────────────── */
  const BookingCard = ({ booking }: { booking: CommonAreaBooking }) => {
    const meta = getStatusMeta(booking.status);
    return (
      <View style={styles.bookingCard}>
        <View style={styles.bookingHeader}>
          <View style={styles.bookingIconContainer}>
            <Ionicons name={getAreaIcon(booking.commonArea.name)} size={20} color={C.purple} />
          </View>
          <View style={styles.bookingInfo}>
            <Text style={styles.bookingArea}>{booking.commonArea.name}</Text>
            <Text style={styles.bookingDate}>{booking.date}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: meta.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: meta.color }]} />
            <Text style={[styles.statusText, { color: meta.color }]}>{meta.label}</Text>
          </View>
        </View>

        <View style={styles.bookingDivider} />

        <View style={styles.bookingDetails}>
          <View style={styles.bookingDetailRow}>
            <Ionicons name="time-outline" size={16} color={C.textMuted} />
            <Text style={styles.bookingDetailText}>
              {booking.startTime} - {booking.endTime}
            </Text>
          </View>
          {booking.purpose ? (
            <View style={styles.bookingDetailRow}>
              <Ionicons name="document-text-outline" size={16} color={C.textMuted} />
              <Text style={styles.bookingDetailText}>{booking.purpose}</Text>
            </View>
          ) : null}
        </View>

        {booking.status === 'PENDING' && (
          <TouchableOpacity style={styles.cancelButton} activeOpacity={0.7}>
            <Ionicons name="close-circle-outline" size={16} color={C.error} style={{ marginRight: 4 }} />
            <Text style={styles.cancelButtonText}>Cancel Booking</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  /* ── Main render ───────────────────────────────────────────────────── */
  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={C.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Common Area Booking</Text>
          <View style={{ width: 44 }} />
        </View>

        {/* ── Tab Switcher ────────────────────────────────────────────── */}
        <View style={styles.tabWrapper}>
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'areas' && styles.activeTab]}
              onPress={() => setActiveTab('areas')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="grid-outline"
                size={16}
                color={activeTab === 'areas' ? C.white : C.textLight}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabText, activeTab === 'areas' && styles.activeTabText]}>
                Available Areas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'bookings' && styles.activeTab]}
              onPress={() => setActiveTab('bookings')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="calendar-outline"
                size={16}
                color={activeTab === 'bookings' ? C.white : C.textLight}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.tabText, activeTab === 'bookings' && styles.activeTabText]}>
                My Bookings
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Content ─────────────────────────────────────────────────── */}
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />
          }
        >
          {activeTab === 'areas' ? (
            <View style={styles.areasGrid}>
              {commonAreas.map((area) => (
                <AreaCard key={area.id} area={area} />
              ))}
            </View>
          ) : (
            <View style={styles.bookingsList}>
              {bookings.length === 0 ? (
                <View style={styles.emptyState}>
                  <View style={styles.emptyIconCircle}>
                    <Ionicons name="calendar-outline" size={40} color={C.purple} />
                  </View>
                  <Text style={styles.emptyTitle}>No Bookings Yet</Text>
                  <Text style={styles.emptySubtitle}>
                    Book a common area to see your reservations here
                  </Text>
                </View>
              ) : (
                bookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
              )}
            </View>
          )}
        </ScrollView>

        {/* ── Booking Modal ───────────────────────────────────────────── */}
        <Modal
          visible={showBookingModal}
          animationType="slide"
          transparent
          onRequestClose={() => setShowBookingModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              {/* Drag handle */}
              <View style={styles.dragHandleWrapper}>
                <View style={styles.dragHandle} />
              </View>

              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Book {selectedArea?.name}</Text>
                <TouchableOpacity
                  style={styles.modalCloseBtn}
                  onPress={() => setShowBookingModal(false)}
                >
                  <Ionicons name="close" size={20} color={C.textLight} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {/* Date */}
                <Text style={styles.inputLabel}>Date *</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="calendar-outline" size={18} color={C.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD (e.g., 2026-02-10)"
                    placeholderTextColor={C.textMuted}
                    value={bookingForm.date}
                    onChangeText={(text) => setBookingForm({ ...bookingForm, date: text })}
                  />
                </View>

                {/* Start time */}
                <Text style={styles.inputLabel}>Start Time *</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="time-outline" size={18} color={C.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="HH:MM (e.g., 10:00)"
                    placeholderTextColor={C.textMuted}
                    value={bookingForm.startTime}
                    onChangeText={(text) => setBookingForm({ ...bookingForm, startTime: text })}
                  />
                </View>

                {/* End time */}
                <Text style={styles.inputLabel}>End Time *</Text>
                <View style={styles.inputRow}>
                  <Ionicons name="time-outline" size={18} color={C.textMuted} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="HH:MM (e.g., 12:00)"
                    placeholderTextColor={C.textMuted}
                    value={bookingForm.endTime}
                    onChangeText={(text) => setBookingForm({ ...bookingForm, endTime: text })}
                  />
                </View>

                {/* Purpose */}
                <Text style={styles.inputLabel}>Purpose (Optional)</Text>
                <View style={[styles.inputRow, styles.inputRowMultiline]}>
                  <Ionicons
                    name="document-text-outline"
                    size={18}
                    color={C.textMuted}
                    style={[styles.inputIcon, { alignSelf: 'flex-start', marginTop: 14 }]}
                  />
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="What will you use this area for?"
                    placeholderTextColor={C.textMuted}
                    value={bookingForm.purpose}
                    onChangeText={(text) => setBookingForm({ ...bookingForm, purpose: text })}
                    multiline
                    numberOfLines={3}
                  />
                </View>

                {/* Rules */}
                {selectedArea?.rules && (
                  <View style={styles.rulesContainer}>
                    <View style={styles.rulesTitleRow}>
                      <Ionicons name="shield-checkmark-outline" size={16} color={C.purple} />
                      <Text style={styles.rulesTitle}>Rules & Guidelines</Text>
                    </View>
                    {selectedArea.rules.map((rule, index) => (
                      <View key={index} style={styles.ruleItem}>
                        <Ionicons name="checkmark-circle" size={16} color={C.success} />
                        <Text style={styles.ruleText}>{rule}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Submit */}
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleSubmitBooking}
                  activeOpacity={0.85}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color={C.white} style={{ marginRight: 8 }} />
                  <Text style={styles.submitButtonText}>Submit Booking Request</Text>
                </TouchableOpacity>

                {/* Bottom spacing for safe area inside modal */}
                <View style={{ height: 20 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

/* ══════════════════════════════════════════════════════════════════════ */
/* ── Styles ──────────────────────────────────────────────────────────── */
/* ══════════════════════════════════════════════════════════════════════ */

const styles = StyleSheet.create({
  /* ── Layout ─────────────────────────────────────────────────────────── */
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  safeArea: {
    flex: 1,
  },

  /* ── Header ─────────────────────────────────────────────────────────── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: C.bg,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow(4),
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.textDark,
    letterSpacing: -0.3,
  },

  /* ── Tabs ────────────────────────────────────────────────────────────── */
  tabWrapper: {
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderRadius: 14,
    padding: 4,
    ...shadow(4),
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  activeTab: {
    backgroundColor: C.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textLight,
  },
  activeTabText: {
    color: C.white,
  },

  /* ── Scroll ─────────────────────────────────────────────────────────── */
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  /* ── Area cards ─────────────────────────────────────────────────────── */
  areasGrid: {
    gap: 14,
  },
  areaCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 18,
    ...shadow(4),
  },
  areaCardUnavailable: {
    opacity: 0.7,
  },
  areaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  areaIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: C.purpleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.errorBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  unavailableBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.error,
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.successBg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  availableBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: C.success,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  areaName: {
    fontSize: 17,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 4,
    letterSpacing: -0.2,
  },
  areaDescription: {
    fontSize: 13,
    color: C.textLight,
    lineHeight: 19,
    marginBottom: 12,
  },
  areaDivider: {
    height: 1,
    backgroundColor: C.border,
    marginBottom: 12,
  },
  areaDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 14,
  },
  areaDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  areaDetailText: {
    fontSize: 12,
    color: C.textMuted,
    fontWeight: '500',
  },
  bookButton: {
    flexDirection: 'row',
    backgroundColor: C.purple,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: C.white,
  },

  /* ── Booking cards ──────────────────────────────────────────────────── */
  bookingsList: {
    gap: 14,
  },
  bookingCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 18,
    ...shadow(4),
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookingIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 13,
    backgroundColor: C.purpleBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bookingArea: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textDark,
    letterSpacing: -0.2,
  },
  bookingDate: {
    fontSize: 13,
    color: C.textLight,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  bookingDivider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 14,
  },
  bookingDetails: {
    gap: 10,
  },
  bookingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookingDetailText: {
    fontSize: 13,
    color: C.textLight,
  },
  cancelButton: {
    flexDirection: 'row',
    marginTop: 14,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.error,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.errorBg,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.error,
  },

  /* ── Empty state ────────────────────────────────────────────────────── */
  emptyState: {
    alignItems: 'center',
    paddingTop: 72,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow(6),
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textDark,
    marginTop: 20,
  },
  emptySubtitle: {
    fontSize: 14,
    color: C.textLight,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
    lineHeight: 20,
  },

  /* ── Modal ──────────────────────────────────────────────────────────── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: C.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingBottom: 10,
    maxHeight: '88%',
  },
  dragHandleWrapper: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 6,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.textDark,
    letterSpacing: -0.3,
    flex: 1,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* ── Inputs ─────────────────────────────────────────────────────────── */
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textDark,
    marginBottom: 8,
    marginTop: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 14,
    backgroundColor: C.bg,
  },
  inputRowMultiline: {
    alignItems: 'flex-start',
  },
  inputIcon: {
    marginLeft: 14,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 15,
    color: C.textDark,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },

  /* ── Rules ──────────────────────────────────────────────────────────── */
  rulesContainer: {
    backgroundColor: C.purpleBg,
    borderRadius: 16,
    padding: 16,
    marginTop: 22,
  },
  rulesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: C.textDark,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ruleText: {
    fontSize: 13,
    color: C.textLight,
    flex: 1,
    lineHeight: 18,
  },

  /* ── Submit button ──────────────────────────────────────────────────── */
  submitButton: {
    flexDirection: 'row',
    backgroundColor: C.purple,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
    ...shadow(4),
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },
});
