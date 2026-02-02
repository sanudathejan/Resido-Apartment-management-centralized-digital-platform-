/**
 * Visitor Management Screen
 * Register and track visitors to the apartment complex
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
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { VisitorEntry } from '@/types';

const { width } = Dimensions.get('window');

// Mock visitor data
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
  
  // Add visitor form state
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CHECKED_IN': return Colors.success;
      case 'CHECKED_OUT': return Colors.gray[400];
      case 'PENDING': return Colors.warning;
      default: return Colors.gray[400];
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'CHECKED_IN': return 'Currently In';
      case 'CHECKED_OUT': return 'Left';
      case 'PENDING': return 'Expected';
      default: return status;
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

  const VisitorCard = ({ visitor }: { visitor: VisitorEntry }) => (
    <View style={styles.visitorCard}>
      <View style={styles.visitorHeader}>
        <View style={styles.visitorAvatar}>
          <Text style={styles.visitorInitial}>
            {visitor.visitorName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.visitorInfo}>
          <Text style={styles.visitorName}>{visitor.visitorName}</Text>
          <Text style={styles.visitorPurpose}>{visitor.purpose}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(visitor.status) }]}>
          <Text style={styles.statusText}>{getStatusText(visitor.status)}</Text>
        </View>
      </View>

      <View style={styles.visitorDetails}>
        {visitor.visitorPhone && (
          <View style={styles.detailRow}>
            <Ionicons name="call-outline" size={16} color={Colors.gray[400]} />
            <Text style={styles.detailText}>{visitor.visitorPhone}</Text>
          </View>
        )}
        {visitor.vehicleNumber && (
          <View style={styles.detailRow}>
            <Ionicons name="car-outline" size={16} color={Colors.gray[400]} />
            <Text style={styles.detailText}>{visitor.vehicleNumber}</Text>
          </View>
        )}
        {visitor.entryTime && (
          <View style={styles.detailRow}>
            <Ionicons name="enter-outline" size={16} color={Colors.gray[400]} />
            <Text style={styles.detailText}>
              Entry: {formatDate(visitor.entryTime)} at {formatTime(visitor.entryTime)}
            </Text>
          </View>
        )}
        {visitor.exitTime && (
          <View style={styles.detailRow}>
            <Ionicons name="exit-outline" size={16} color={Colors.gray[400]} />
            <Text style={styles.detailText}>
              Exit: {formatDate(visitor.exitTime)} at {formatTime(visitor.exitTime)}
            </Text>
          </View>
        )}
      </View>

      {visitor.status === 'PENDING' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="create-outline" size={18} color={Colors.primary} />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelVisitorButton}>
            <Ionicons name="close-circle-outline" size={18} color={Colors.error} />
            <Text style={styles.cancelVisitorButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A4B6E', '#0D2137']}
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Visitor Management</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddModal(true)}
            >
              <Ionicons name="add" size={28} color={Colors.white} />
            </TouchableOpacity>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'expected' && styles.activeTab]}
              onPress={() => setActiveTab('expected')}
            >
              <Text style={[styles.tabText, activeTab === 'expected' && styles.activeTabText]}>
                Expected ({expectedVisitors.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'history' && styles.activeTab]}
              onPress={() => setActiveTab('history')}
            >
              <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
                History ({historyVisitors.length})
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.white}
              />
            }
          >
            {activeTab === 'expected' ? (
              expectedVisitors.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="person-add-outline" size={60} color={Colors.gray[400]} />
                  <Text style={styles.emptyTitle}>No Expected Visitors</Text>
                  <Text style={styles.emptySubtitle}>
                    Pre-register visitors to notify security
                  </Text>
                </View>
              ) : (
                expectedVisitors.map((visitor) => (
                  <VisitorCard key={visitor.id} visitor={visitor} />
                ))
              )
            ) : (
              historyVisitors.length === 0 ? (
                <View style={styles.emptyState}>
                  <Ionicons name="time-outline" size={60} color={Colors.gray[400]} />
                  <Text style={styles.emptyTitle}>No Visitor History</Text>
                  <Text style={styles.emptySubtitle}>
                    Past visitor records will appear here
                  </Text>
                </View>
              ) : (
                historyVisitors.map((visitor) => (
                  <VisitorCard key={visitor.id} visitor={visitor} />
                ))
              )
            )}
          </ScrollView>

          {/* Add Visitor Modal */}
          <Modal
            visible={showAddModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowAddModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Pre-Register Visitor</Text>
                  <TouchableOpacity onPress={() => setShowAddModal(false)}>
                    <Ionicons name="close" size={24} color={Colors.text.primary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.inputLabel}>Visitor Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter visitor's full name"
                    placeholderTextColor={Colors.gray[400]}
                    value={visitorForm.name}
                    onChangeText={(text) => setVisitorForm({ ...visitorForm, name: text })}
                  />

                  <Text style={styles.inputLabel}>Phone Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+94 XX XXX XXXX"
                    placeholderTextColor={Colors.gray[400]}
                    value={visitorForm.phone}
                    onChangeText={(text) => setVisitorForm({ ...visitorForm, phone: text })}
                    keyboardType="phone-pad"
                  />

                  <Text style={styles.inputLabel}>Vehicle Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., CAB-1234 (optional)"
                    placeholderTextColor={Colors.gray[400]}
                    value={visitorForm.vehicleNumber}
                    onChangeText={(text) => setVisitorForm({ ...visitorForm, vehicleNumber: text })}
                    autoCapitalize="characters"
                  />

                  <Text style={styles.inputLabel}>Purpose of Visit *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Delivery, Guest, Maintenance"
                    placeholderTextColor={Colors.gray[400]}
                    value={visitorForm.purpose}
                    onChangeText={(text) => setVisitorForm({ ...visitorForm, purpose: text })}
                  />

                  <Text style={styles.inputLabel}>Expected Date</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD (optional)"
                    placeholderTextColor={Colors.gray[400]}
                    value={visitorForm.expectedDate}
                    onChangeText={(text) => setVisitorForm({ ...visitorForm, expectedDate: text })}
                  />

                  <Text style={styles.inputLabel}>Expected Time</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="HH:MM (optional)"
                    placeholderTextColor={Colors.gray[400]}
                    value={visitorForm.expectedTime}
                    onChangeText={(text) => setVisitorForm({ ...visitorForm, expectedTime: text })}
                  />

                  <View style={styles.infoBox}>
                    <Ionicons name="information-circle" size={20} color={Colors.info} />
                    <Text style={styles.infoText}>
                      Security will be notified about your expected visitor. They will receive
                      a verification call upon arrival.
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleAddVisitor}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#2ECC71', '#27AE60']}
                      style={styles.submitButtonGradient}
                    >
                      <Text style={styles.submitButtonText}>Register Visitor</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  addButton: {
    width: 40,
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activeTabText: {
    color: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  visitorCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
  },
  visitorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  visitorAvatar: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visitorInitial: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  visitorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  visitorName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  visitorPurpose: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  visitorDetails: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  detailText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 15,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  cancelVisitorButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  cancelVisitorButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 15,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: Colors.info + '15',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.info,
    lineHeight: 18,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 25,
    marginBottom: 20,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});
