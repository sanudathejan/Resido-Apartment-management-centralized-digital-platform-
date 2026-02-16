/**
 * Visitor Management Screen
 * Register and track visitors - Modern 2026 light theme
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
  TextInput,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { VisitorEntry } from '@/types';

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
  warningBg: '#FEF3C7',
  error: '#EF4444',
  errorBg: '#FEF2F2',
  cyan: '#0891B2',
  cyanBg: '#ECFEFF',
  gray50: '#F8FAFC',
};

const mockVisitors: VisitorEntry[] = [
  {
    id: 1,
    visitorName: 'John Smith',
    visitorPhone: '+94 77 123 4567',
    vehicleNumber: 'CAB-1234',
    purpose: 'Delivery - Online Shopping',
    resident: { id: 1, name: 'User', email: 'user@email.com', role: 'RESIDENT' },
    entryTime: '2026-02-02T09:30:00',
    exitTime: '2026-02-02T09:45:00',
    status: 'CHECKED_OUT',
  },
  {
    id: 2,
    visitorName: 'Sarah Williams',
    visitorPhone: '+94 76 987 6543',
    vehicleNumber: '',
    purpose: 'Family Visit',
    resident: { id: 1, name: 'User', email: 'user@email.com', role: 'RESIDENT' },
    entryTime: '2026-02-02T14:00:00',
    status: 'CHECKED_IN',
  },
  {
    id: 3,
    visitorName: 'Mike Johnson',
    visitorPhone: '+94 71 555 1234',
    vehicleNumber: 'WP-5678',
    purpose: 'Plumber - Maintenance',
    resident: { id: 1, name: 'User', email: 'user@email.com', role: 'RESIDENT' },
    entryTime: '2026-02-01T11:00:00',
    exitTime: '2026-02-01T13:30:00',
    status: 'CHECKED_OUT',
  },
  {
    id: 4,
    visitorName: 'Anna Lee',
    purpose: 'Guest',
    resident: { id: 1, name: 'User', email: 'user@email.com', role: 'RESIDENT' },
    entryTime: '',
    status: 'PENDING',
  },
];

export default function VisitorManagementScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'expected' | 'history'>('expected');
  const [visitors, setVisitors] = useState<VisitorEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const [visitorForm, setVisitorForm] = useState({
    name: '',
    phone: '',
    vehicleNumber: '',
    purpose: '',
    expectedDate: '',
    expectedTime: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setVisitors(mockVisitors);
    } catch (error) {
      console.error('Error loading visitors:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddVisitor = () => {
    if (!visitorForm.name || !visitorForm.purpose) {
      Alert.alert('Error', 'Please fill in visitor name and purpose');
      return;
    }

    const newVisitor: VisitorEntry = {
      id: visitors.length + 1,
      visitorName: visitorForm.name,
      visitorPhone: visitorForm.phone,
      vehicleNumber: visitorForm.vehicleNumber,
      purpose: visitorForm.purpose,
      resident: user!,
      entryTime: '',
      status: 'PENDING',
    };

    setVisitors([newVisitor, ...visitors]);
    setShowAddModal(false);
    setVisitorForm({ name: '', phone: '', vehicleNumber: '', purpose: '', expectedDate: '', expectedTime: '' });
    Alert.alert('Success', 'Visitor pre-registered successfully! Security will be notified.');
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'CHECKED_IN':
        return { color: C.success, bg: C.successBg, text: 'Currently In' };
      case 'CHECKED_OUT':
        return { color: C.textMuted, bg: C.gray50, text: 'Left' };
      case 'PENDING':
        return { color: C.warning, bg: C.warningBg, text: 'Expected' };
      default:
        return { color: C.textMuted, bg: C.gray50, text: status };
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const expectedVisitors = visitors.filter(v => v.status === 'PENDING' || v.status === 'CHECKED_IN');
  const historyVisitors = visitors.filter(v => v.status === 'CHECKED_OUT');

  const VisitorCard = ({ visitor }: { visitor: VisitorEntry }) => {
    const statusStyle = getStatusStyle(visitor.status);
    return (
      <View style={styles.visitorCard}>
        <View style={styles.visitorHeader}>
          <View style={[styles.visitorAvatar, { backgroundColor: C.cyanBg }]}>
            <Text style={[styles.visitorInitial, { color: C.cyan }]}>
              {visitor.visitorName.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.visitorInfo}>
            <Text style={styles.visitorName}>{visitor.visitorName}</Text>
            <Text style={styles.visitorPurpose}>{visitor.purpose}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
            <View style={[styles.statusDot, { backgroundColor: statusStyle.color }]} />
            <Text style={[styles.statusText, { color: statusStyle.color }]}>{statusStyle.text}</Text>
          </View>
        </View>

        <View style={styles.visitorDetails}>
          {visitor.visitorPhone && (
            <View style={styles.detailRow}>
              <Ionicons name="call-outline" size={15} color={C.textMuted} />
              <Text style={styles.detailText}>{visitor.visitorPhone}</Text>
            </View>
          )}
          {visitor.vehicleNumber ? (
            <View style={styles.detailRow}>
              <Ionicons name="car-outline" size={15} color={C.textMuted} />
              <Text style={styles.detailText}>{visitor.vehicleNumber}</Text>
            </View>
          ) : null}
          {visitor.entryTime ? (
            <View style={styles.detailRow}>
              <Ionicons name="enter-outline" size={15} color={C.textMuted} />
              <Text style={styles.detailText}>
                Entry: {formatDate(visitor.entryTime)} at {formatTime(visitor.entryTime)}
              </Text>
            </View>
          ) : null}
          {visitor.exitTime ? (
            <View style={styles.detailRow}>
              <Ionicons name="exit-outline" size={15} color={C.textMuted} />
              <Text style={styles.detailText}>
                Exit: {formatDate(visitor.exitTime)} at {formatTime(visitor.exitTime)}
              </Text>
            </View>
          ) : null}
        </View>

        {visitor.status === 'PENDING' && (
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton} activeOpacity={0.7}>
              <Ionicons name="create-outline" size={16} color={C.primary} />
              <Text style={[styles.actionBtnText, { color: C.primary }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelVisitorButton} activeOpacity={0.7}>
              <Ionicons name="close-circle-outline" size={16} color={C.error} />
              <Text style={[styles.actionBtnText, { color: C.error }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={22} color={C.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Visitor Management</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="add" size={22} color={C.white} />
          </TouchableOpacity>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'expected' && styles.activeTab]}
            onPress={() => setActiveTab('expected')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'expected' && styles.activeTabText]}>
              Expected ({expectedVisitors.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'history' && styles.activeTab]}
            onPress={() => setActiveTab('history')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
              History ({historyVisitors.length})
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          {activeTab === 'expected' ? (
            expectedVisitors.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <Ionicons name="person-add-outline" size={40} color={C.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>No Expected Visitors</Text>
                <Text style={styles.emptySubtitle}>Pre-register visitors to notify security</Text>
              </View>
            ) : (
              expectedVisitors.map(visitor => <VisitorCard key={visitor.id} visitor={visitor} />)
            )
          ) : historyVisitors.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Ionicons name="time-outline" size={40} color={C.textMuted} />
              </View>
              <Text style={styles.emptyTitle}>No Visitor History</Text>
              <Text style={styles.emptySubtitle}>Past visitor records will appear here</Text>
            </View>
          ) : (
            historyVisitors.map(visitor => <VisitorCard key={visitor.id} visitor={visitor} />)
          )}
        </ScrollView>

        {/* Add Visitor Modal */}
        <Modal visible={showAddModal} animationType="slide" transparent onRequestClose={() => setShowAddModal(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Pre-Register Visitor</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)} style={styles.modalClose}>
                  <Ionicons name="close" size={22} color={C.textDark} />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {[
                  { key: 'name', label: 'Visitor Name *', placeholder: "Enter visitor's full name", icon: 'person-outline' as const, kbd: 'default' as const },
                  { key: 'phone', label: 'Phone Number', placeholder: '+94 XX XXX XXXX', icon: 'call-outline' as const, kbd: 'phone-pad' as const },
                  { key: 'vehicleNumber', label: 'Vehicle Number', placeholder: 'e.g., CAB-1234 (optional)', icon: 'car-outline' as const, kbd: 'default' as const },
                  { key: 'purpose', label: 'Purpose of Visit *', placeholder: 'e.g., Delivery, Guest, Maintenance', icon: 'document-text-outline' as const, kbd: 'default' as const },
                  { key: 'expectedDate', label: 'Expected Date', placeholder: 'YYYY-MM-DD (optional)', icon: 'calendar-outline' as const, kbd: 'default' as const },
                  { key: 'expectedTime', label: 'Expected Time', placeholder: 'HH:MM (optional)', icon: 'time-outline' as const, kbd: 'default' as const },
                ].map(field => (
                  <View key={field.key}>
                    <Text style={styles.inputLabel}>{field.label}</Text>
                    <View style={[styles.inputContainer, focusedField === field.key && { borderColor: C.primary }]}>
                      <Ionicons name={field.icon} size={18} color={C.textMuted} style={styles.inputIcon} />
                      <TextInput
                        style={styles.input}
                        placeholder={field.placeholder}
                        placeholderTextColor={C.textMuted}
                        value={(visitorForm as any)[field.key]}
                        onChangeText={text => setVisitorForm({ ...visitorForm, [field.key]: text })}
                        keyboardType={field.kbd}
                        autoCapitalize={field.key === 'vehicleNumber' ? 'characters' : 'none'}
                        onFocus={() => setFocusedField(field.key)}
                        onBlur={() => setFocusedField(null)}
                      />
                    </View>
                  </View>
                ))}

                <View style={styles.infoBox}>
                  <Ionicons name="information-circle" size={18} color={C.primary} />
                  <Text style={styles.infoText}>
                    Security will be notified about your expected visitor. They will receive a verification call upon arrival.
                  </Text>
                </View>

                <TouchableOpacity style={styles.submitButton} onPress={handleAddVisitor} activeOpacity={0.85}>
                  <Text style={styles.submitButtonText}>Register Visitor</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  safeArea: { flex: 1 },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 14,
  },
  backButton: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: C.white, alignItems: 'center', justifyContent: 'center',
    ...Platform.select({
      ios: { shadowColor: C.textMuted, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  headerTitle: { fontSize: 20, fontWeight: '700', color: C.textDark },
  addButton: {
    width: 42, height: 42, borderRadius: 14,
    backgroundColor: C.cyan, alignItems: 'center', justifyContent: 'center',
  },

  tabContainer: {
    flexDirection: 'row', marginHorizontal: 20, gap: 8,
    backgroundColor: C.white, borderRadius: 16, padding: 4, marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: C.textMuted, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  tab: { flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 13 },
  activeTab: { backgroundColor: C.primary },
  tabText: { fontSize: 14, fontWeight: '600', color: C.textMuted },
  activeTabText: { color: C.white },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

  visitorCard: {
    backgroundColor: C.white, borderRadius: 20, padding: 16, marginBottom: 14,
    ...Platform.select({
      ios: { shadowColor: C.textMuted, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  visitorHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  visitorAvatar: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  visitorInitial: { fontSize: 20, fontWeight: '700' },
  visitorInfo: { flex: 1, marginLeft: 12 },
  visitorName: { fontSize: 16, fontWeight: '700', color: C.textDark },
  visitorPurpose: { fontSize: 13, color: C.textLight, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },

  visitorDetails: { gap: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailText: { fontSize: 13, color: C.textLight },

  actionButtons: { flexDirection: 'row', gap: 12, marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border },
  editButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: C.primary, backgroundColor: C.primaryLight,
  },
  cancelVisitorButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: 12, borderWidth: 1.5, borderColor: C.error, backgroundColor: C.errorBg,
  },
  actionBtnText: { fontSize: 13, fontWeight: '600' },

  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: C.textMuted, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.textDark, marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: C.textLight, textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: C.white, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, maxHeight: '88%' },
  modalHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: C.border, alignSelf: 'center', marginBottom: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '700', color: C.textDark },
  modalClose: { width: 36, height: 36, borderRadius: 12, backgroundColor: C.gray50, alignItems: 'center', justifyContent: 'center' },

  inputLabel: { fontSize: 13, fontWeight: '600', color: C.textDark, marginBottom: 6, marginTop: 14 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.gray50,
    borderRadius: 14, borderWidth: 1.5, borderColor: C.border, paddingHorizontal: 14,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 14, fontSize: 15, color: C.textDark },

  infoBox: { flexDirection: 'row', backgroundColor: C.primaryLight, borderRadius: 14, padding: 14, marginTop: 20, gap: 10 },
  infoText: { flex: 1, fontSize: 13, color: C.primary, lineHeight: 18, fontWeight: '500' },

  submitButton: {
    backgroundColor: C.cyan, borderRadius: 16, paddingVertical: 16, alignItems: 'center', marginTop: 24, marginBottom: 20,
    ...Platform.select({
      ios: { shadowColor: C.cyan, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 10 },
      android: { elevation: 4 },
    }),
  },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: C.white },
});
