/**
 * Parking Screen
 * Parking slots and visitor management — 2026 light theme
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  TextInput,
  KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { parkingService } from '@/services';
import { ParkingSlot, VisitorEntry } from '@/types';

/* ─── Design Tokens ─── */
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
  warning: '#F59E0B',
  error: '#EF4444',
  secondary: '#7C3AED',
  secondaryBg: '#F5F3FF',
} as const;

/* ─── Helpers ─── */
const shadow = (elevation: number) =>
  Platform.select({
    ios: {
      shadowColor: '#0F172A',
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: 0.08 + elevation * 0.01,
      shadowRadius: elevation * 1.2,
    },
    android: {
      elevation,
    },
    default: {},
  }) as object;

const getInitials = (name: string) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

const statusColor = (status: string) => {
  switch (status) {
    case 'CHECKED_IN':
    case 'Available':
      return { bg: '#ECFDF5', text: C.success };
    case 'CHECKED_OUT':
    case 'Occupied':
      return { bg: '#FEF2F2', text: C.error };
    case 'PENDING':
      return { bg: '#FFFBEB', text: C.warning };
    default:
      return { bg: C.primaryLight, text: C.primary };
  }
};

const statusLabel = (status: string) => {
  switch (status) {
    case 'CHECKED_IN':
      return 'Checked In';
    case 'CHECKED_OUT':
      return 'Checked Out';
    case 'PENDING':
      return 'Pending';
    default:
      return status;
  }
};

/* ─── Inline StatusBadge ─── */
function StatusBadge({ status }: { status: string }) {
  const c = statusColor(status);
  return (
    <View style={[badgeStyles.root, { backgroundColor: c.bg }]}>
      <View style={[badgeStyles.dot, { backgroundColor: c.text }]} />
      <Text style={[badgeStyles.label, { color: c.text }]}>{statusLabel(status)}</Text>
    </View>
  );
}

const badgeStyles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});

/* ─── Inline Input ─── */
function FormInput({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  keyboardType,
  autoCapitalize,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  icon: keyof typeof Ionicons.glyphMap;
  keyboardType?: 'default' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}) {
  return (
    <View style={inputStyles.wrapper}>
      <Text style={inputStyles.label}>{label}</Text>
      <View style={inputStyles.row}>
        <Ionicons name={icon} size={18} color={C.textMuted} style={inputStyles.icon} />
        <TextInput
          style={inputStyles.input}
          placeholder={placeholder}
          placeholderTextColor={C.textMuted}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType ?? 'default'}
          autoCapitalize={autoCapitalize ?? 'sentences'}
        />
      </View>
    </View>
  );
}

const inputStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textDark,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 14,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: C.textDark,
    paddingVertical: Platform.OS === 'ios' ? 14 : 10,
  },
});

/* ════════════════════════════════════════════════════════
   Main Screen
   ════════════════════════════════════════════════════════ */

export default function ParkingScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'parking' | 'visitors'>('parking');
  const [parkingSlot, setParkingSlot] = useState<ParkingSlot | null>(null);
  const [visitors, setVisitors] = useState<VisitorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showVisitorModal, setShowVisitorModal] = useState(false);

  // Visitor form state
  const [visitorForm, setVisitorForm] = useState({
    name: '',
    phone: '',
    vehicleNumber: '',
    purpose: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (user?.id) {
        const [slot, visitorData] = await Promise.all([
          parkingService.getUserParkingSlot(user.id),
          parkingService.getVisitorEntries(user.id),
        ]);
        setParkingSlot(slot);
        setVisitors(visitorData);
      }
    } catch (error) {
      console.error('Error loading parking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRegisterVisitor = async () => {
    if (!visitorForm.name || !visitorForm.purpose) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    try {
      if (user) {
        await parkingService.registerVisitor({
          visitorName: visitorForm.name,
          visitorPhone: visitorForm.phone,
          vehicleNumber: visitorForm.vehicleNumber,
          purpose: visitorForm.purpose,
          resident: user,
        });
        Alert.alert('Success', 'Visitor registered successfully');
        setShowVisitorModal(false);
        setVisitorForm({ name: '', phone: '', vehicleNumber: '', purpose: '' });
        loadData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to register visitor');
    }
  };

  const toggleSlotAvailability = async () => {
    if (parkingSlot) {
      try {
        const updated = await parkingService.toggleSlotAvailability(
          parkingSlot.id,
          !parkingSlot.isAvailableForLending,
        );
        setParkingSlot(updated);
        Alert.alert(
          'Success',
          updated.isAvailableForLending
            ? 'Your slot is now available for lending'
            : 'Your slot is no longer available for lending',
        );
      } catch (error) {
        Alert.alert('Error', 'Failed to update slot availability');
      }
    }
  };

  // Mock data for demo
  const mockParkingSlot: ParkingSlot = {
    id: 1,
    slotNumber: 'P-A12',
    isAvailableForLending: false,
    owner: user!,
    vehicleNumber: 'ABC-1234',
    vehicleType: 'Car',
  };

  const mockVisitors: VisitorEntry[] = [
    {
      id: 1,
      visitorName: 'John Smith',
      visitorPhone: '+94 77 123 4567',
      vehicleNumber: 'XYZ-5678',
      purpose: 'Family visit',
      resident: user!,
      entryTime: new Date().toISOString(),
      status: 'CHECKED_IN',
    },
    {
      id: 2,
      visitorName: 'Jane Doe',
      purpose: 'Delivery',
      resident: user!,
      entryTime: new Date(Date.now() - 86400000).toISOString(),
      exitTime: new Date(Date.now() - 82800000).toISOString(),
      status: 'CHECKED_OUT',
    },
  ];

  const displaySlot = parkingSlot || mockParkingSlot;
  const displayVisitors = visitors.length > 0 ? visitors : mockVisitors;

  /* ─── Render ─── */
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── Flat Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Parking & Visitors</Text>
        <Text style={styles.headerSubtitle}>Manage parking and visitor entries</Text>
      </View>

      {/* ── Tab Selector ── */}
      <View style={[styles.tabContainer, shadow(2)]}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('parking')}
          style={[styles.tab, activeTab === 'parking' && styles.tabActive]}
        >
          <Ionicons
            name="car"
            size={20}
            color={activeTab === 'parking' ? C.primary : C.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'parking' && styles.tabTextActive]}>
            My Parking
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => setActiveTab('visitors')}
          style={[styles.tab, activeTab === 'visitors' && styles.tabActive]}
        >
          <Ionicons
            name="people"
            size={20}
            color={activeTab === 'visitors' ? C.primary : C.textMuted}
          />
          <Text style={[styles.tabText, activeTab === 'visitors' && styles.tabTextActive]}>
            Visitors
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
      >
        {activeTab === 'parking' ? (
          /* ── Parking Section ── */
          <>
            {/* Slot Card */}
            <View style={[styles.card, shadow(3)]}>
              <View style={styles.slotHeader}>
                <View style={styles.slotIconContainer}>
                  <Ionicons name="car" size={28} color={C.secondary} />
                </View>
                <View style={styles.slotInfo}>
                  <Text style={styles.slotLabel}>Your Parking Slot</Text>
                  <Text style={styles.slotNumber}>{displaySlot.slotNumber}</Text>
                </View>
                <StatusBadge
                  status={displaySlot.isAvailableForLending ? 'Available' : 'Occupied'}
                />
              </View>

              <View style={styles.vehicleInfoBox}>
                <View style={styles.infoRow}>
                  <Ionicons name="speedometer-outline" size={18} color={C.textLight} />
                  <Text style={styles.infoText}>
                    Vehicle: {displaySlot.vehicleNumber || 'Not registered'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="car-sport-outline" size={18} color={C.textLight} />
                  <Text style={styles.infoText}>
                    Type: {displaySlot.vehicleType || 'Car'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={toggleSlotAvailability}
                style={[
                  styles.actionButton,
                  displaySlot.isAvailableForLending
                    ? styles.actionButtonOutline
                    : styles.actionButtonPrimary,
                ]}
              >
                <Ionicons
                  name={
                    displaySlot.isAvailableForLending
                      ? 'close-circle-outline'
                      : 'share-outline'
                  }
                  size={20}
                  color={displaySlot.isAvailableForLending ? C.primary : C.white}
                />
                <Text
                  style={[
                    styles.actionButtonText,
                    displaySlot.isAvailableForLending
                      ? styles.actionButtonTextOutline
                      : styles.actionButtonTextPrimary,
                  ]}
                >
                  {displaySlot.isAvailableForLending ? 'Mark as Unavailable' : 'Lend My Slot'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Parking Guidelines */}
            <View style={[styles.card, shadow(2)]}>
              <Text style={styles.cardTitle}>Parking Guidelines</Text>
              {[
                'Park only in your assigned slot',
                'Register visitors before entry',
                'Speed limit: 10 km/h in premises',
              ].map((rule, i) => (
                <View key={i} style={styles.ruleItem}>
                  <Ionicons name="checkmark-circle" size={18} color={C.success} />
                  <Text style={styles.ruleText}>{rule}</Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          /* ── Visitors Section ── */
          <>
            {/* Register Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setShowVisitorModal(true)}
              style={[styles.registerButton, shadow(4)]}
            >
              <Ionicons name="person-add" size={20} color={C.white} />
              <Text style={styles.registerButtonText}>Register New Visitor</Text>
            </TouchableOpacity>

            <Text style={styles.sectionTitle}>Visitor History</Text>

            {displayVisitors.length === 0 ? (
              /* Empty State */
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyCircle, shadow(4)]}>
                  <Ionicons name="people-outline" size={40} color={C.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>No Visitors</Text>
                <Text style={styles.emptyMessage}>
                  You haven't registered any visitors yet.
                </Text>
              </View>
            ) : (
              displayVisitors.map((visitor) => (
                <View key={visitor.id} style={[styles.card, shadow(2), { marginBottom: 12 }]}>
                  <View style={styles.visitorHeader}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>
                        {getInitials(visitor.visitorName)}
                      </Text>
                    </View>
                    <View style={styles.visitorInfo}>
                      <Text style={styles.visitorName}>{visitor.visitorName}</Text>
                      <Text style={styles.visitorPurpose}>{visitor.purpose}</Text>
                    </View>
                    <StatusBadge status={visitor.status} />
                  </View>

                  <View style={styles.visitorDetailsBox}>
                    {visitor.visitorPhone ? (
                      <View style={styles.detailRow}>
                        <Ionicons name="call-outline" size={15} color={C.textLight} />
                        <Text style={styles.detailText}>{visitor.visitorPhone}</Text>
                      </View>
                    ) : null}
                    {visitor.vehicleNumber ? (
                      <View style={styles.detailRow}>
                        <Ionicons name="car-outline" size={15} color={C.textLight} />
                        <Text style={styles.detailText}>{visitor.vehicleNumber}</Text>
                      </View>
                    ) : null}
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={15} color={C.textLight} />
                      <Text style={styles.detailText}>
                        {new Date(visitor.entryTime).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* ════════ Visitor Registration Modal ════════ */}
      <Modal
        visible={showVisitorModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowVisitorModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* backdrop */}
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowVisitorModal(false)}
          />

          {/* bottom sheet */}
          <View style={[styles.modalSheet, shadow(8)]}>
            {/* handle bar */}
            <View style={styles.handleBarRow}>
              <View style={styles.handleBar} />
            </View>

            {/* header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Register Visitor</Text>
              <TouchableOpacity
                onPress={() => setShowVisitorModal(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={styles.modalCloseBtn}>
                  <Ionicons name="close" size={18} color={C.textLight} />
                </View>
              </TouchableOpacity>
            </View>

            {/* form */}
            <ScrollView
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <FormInput
                label="Visitor Name *"
                placeholder="Enter visitor's name"
                value={visitorForm.name}
                onChangeText={(v) => setVisitorForm((p) => ({ ...p, name: v }))}
                icon="person-outline"
              />

              <FormInput
                label="Phone Number"
                placeholder="Enter phone number"
                value={visitorForm.phone}
                onChangeText={(v) => setVisitorForm((p) => ({ ...p, phone: v }))}
                icon="call-outline"
                keyboardType="phone-pad"
              />

              <FormInput
                label="Vehicle Number"
                placeholder="Enter vehicle number (optional)"
                value={visitorForm.vehicleNumber}
                onChangeText={(v) => setVisitorForm((p) => ({ ...p, vehicleNumber: v }))}
                icon="car-outline"
                autoCapitalize="characters"
              />

              <FormInput
                label="Purpose of Visit *"
                placeholder="e.g., Family visit, Delivery"
                value={visitorForm.purpose}
                onChangeText={(v) => setVisitorForm((p) => ({ ...p, purpose: v }))}
                icon="document-text-outline"
              />

              {/* submit */}
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleRegisterVisitor}
                style={[styles.submitButton, shadow(4)]}
              >
                <Ionicons name="checkmark-circle-outline" size={20} color={C.white} />
                <Text style={styles.submitButtonText}>Register Visitor</Text>
              </TouchableOpacity>

              {/* bottom spacer so content is not hidden by keyboard */}
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

/* ════════════════════════════════════════════════════════
   Styles
   ════════════════════════════════════════════════════════ */

const styles = StyleSheet.create({
  /* ── Layout ── */
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  /* ── Header ── */
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: C.bg,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: C.textLight,
  },

  /* ── Tabs ── */
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: C.white,
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 4,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: C.primaryLight,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textMuted,
  },
  tabTextActive: {
    color: C.primary,
  },

  /* ── Scroll ── */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  /* ── Generic Card ── */
  card: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },

  /* ── Parking Slot ── */
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  slotIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: C.secondaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  slotInfo: {
    flex: 1,
  },
  slotLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: C.textLight,
    marginBottom: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  slotNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: C.textDark,
  },
  vehicleInfoBox: {
    backgroundColor: C.bg,
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: C.textLight,
  },

  /* ── Action Buttons (slot toggle) ── */
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  actionButtonPrimary: {
    backgroundColor: C.primary,
  },
  actionButtonOutline: {
    backgroundColor: C.white,
    borderWidth: 1.5,
    borderColor: C.primary,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionButtonTextPrimary: {
    color: C.white,
  },
  actionButtonTextOutline: {
    color: C.primary,
  },

  /* ── Guidelines ── */
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 14,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  ruleText: {
    fontSize: 14,
    color: C.textLight,
  },

  /* ── Register Visitor Button ── */
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    paddingVertical: 16,
    borderRadius: 16,
    marginBottom: 24,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },

  /* ── Section Title ── */
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 14,
  },

  /* ── Visitor Card ── */
  visitorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: C.secondaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.secondary,
  },
  visitorInfo: {
    flex: 1,
  },
  visitorName: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textDark,
  },
  visitorPurpose: {
    fontSize: 13,
    color: C.textLight,
    marginTop: 2,
  },
  visitorDetailsBox: {
    backgroundColor: C.bg,
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: C.textLight,
  },

  /* ── Empty State ── */
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 6,
  },
  emptyMessage: {
    fontSize: 14,
    color: C.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },

  /* ── Modal ── */
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
  },
  modalSheet: {
    backgroundColor: C.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
  },
  handleBarRow: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 2,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.textDark,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  /* ── Submit ── */
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: C.primary,
    paddingVertical: 16,
    borderRadius: 16,
    marginTop: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },
});
