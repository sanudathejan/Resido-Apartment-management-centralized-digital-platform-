/**
 * Manager: View Issued Bills Screen
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
  ScrollView
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, APP_CONFIG } from '@/constants/config';

// Design tokens
const C = {
  bg: '#D8F3DC',
  primary: '#7C3AED',
  primaryLight: '#F5F3FF',
  white: '#FFFFFF',
  textDark: '#1E293B',
  textLight: '#64748B',
  border: '#E2E8F0',
  success: '#10B981',
  successBg: '#D1FAE5',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  danger: '#EF4444',
  dangerBg: '#FEE2E2',
  overlay: 'rgba(15, 23, 42, 0.7)',
};

interface Bill {
  id: string;
  residentName: string;
  houseNumber: string;
  amount: number;
  type: string;
  dueDate: string;
  status: 'PENDING' | 'REVIEW' | 'PAID' | 'REJECTED';
  receiptImage?: string;
}

export default function ViewBillsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<Bill[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'REVIEW' | 'PAID' | 'REJECTED' | 'OVERDUE'>('ALL');

  // Modal State
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const token = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENTS}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to fetch bills');

      const data = await response.json();
      
      const mappedBills: Bill[] = data.map((item: any) => ({
        id: item.id.toString(),
        residentName: item.resident?.name || 'Unknown',
        houseNumber: item.resident?.houseNumber?.toString() || 'N/A',
        amount: item.amount || 0,
        type: item.type || 'OTHER',
        dueDate: item.dueDate || 'N/A',
        status: item.status || 'PENDING',
        receiptImage: item.receiptImage || null,
      }));

      mappedBills.sort((a, b) => parseInt(b.id) - parseInt(a.id));
      setBills(mappedBills);
    } catch (error) {
      console.error('Error fetching bills:', error);
      Alert.alert('Error', 'Could not load issued bills.');
    } finally {
      setLoading(false);
    }
  };

  // --- FRONTEND CALCULATION: OVERDUE ---
  const isBillOverdue = (dueDateStr: string, status: string) => {
    if (status === 'PAID') return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize to midnight to compare purely by date
    const due = new Date(dueDateStr);
    
    return due < today;
  };

  // --- CONFIRMATION DIALOG ---
  const confirmAction = (approved: boolean) => {
    Alert.alert(
      approved ? "Approve Payment" : "Reject Payment",
      approved 
        ? "Are you sure you want to mark this bill as PAID?" 
        : "Are you sure you want to reject this payment proof?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Confirm", 
          style: approved ? "default" : "destructive", 
          onPress: () => handleVerify(approved) 
        }
      ]
    );
  };

  const handleVerify = async (approved: boolean) => {
    if (!selectedBill) return;
    
    setActionLoading(true);
    try {
      const token = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENTS}/${selectedBill.id}/verify?approved=${approved}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to verify payment');

      const updatedStatus = approved ? 'PAID' : 'REJECTED';

      setBills(prevBills => 
        prevBills.map(bill => 
          bill.id === selectedBill.id ? { ...bill, status: updatedStatus } : bill
        )
      );

      // Close modal first
      setModalVisible(false);

      // THE IOS BUG FIX: Wait 500ms before triggering the success Alert
      // so the Modal has time to fully unmount from the UI thread.
      setTimeout(() => {
        Alert.alert('Success', `Payment has been ${updatedStatus.toLowerCase()}.`);
      }, 500);

    } catch (error) {
      console.error('Error verifying payment:', error);
      Alert.alert('Error', 'Could not process the verification.');
    } finally {
      setActionLoading(false);
    }
  };

  // Filter Logic with Overdue
  const filteredBills = bills.filter((bill) => {
    if (filter === 'ALL') return true;
    if (filter === 'OVERDUE') return isBillOverdue(bill.dueDate, bill.status);
    return bill.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return { bg: C.successBg, text: C.success };
      case 'REJECTED': return { bg: C.dangerBg, text: C.danger };
      case 'OVERDUE': return { bg: '#FEE2E2', text: '#DC2626' }; // Red for Overdue
      case 'REVIEW': return { bg: '#DBEAFE', text: '#2563EB' }; 
      case 'PENDING': default: return { bg: C.warningBg, text: C.warning };
    }
  };

  const renderBillCard = ({ item }: { item: Bill }) => {
    // Override the display status if it is overdue
    const displayStatus = isBillOverdue(item.dueDate, item.status) ? 'OVERDUE' : item.status;
    const statusColors = getStatusBadge(displayStatus);

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => {
          setSelectedBill(item);
          setModalVisible(true);
        }}
      >
        <View style={styles.cardHeader}>
          <View style={styles.residentInfo}>
            <Text style={styles.houseNumberBadge}>Unit {item.houseNumber}</Text>
            <Text style={styles.residentName}>{item.residentName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>{displayStatus}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.detailColumn}>
            <Text style={styles.label}>Bill Type</Text>
            <Text style={styles.value}>{item.type}</Text>
          </View>
          <View style={styles.detailColumn}>
            <Text style={styles.label}>Due Date</Text>
            <Text style={styles.value}>{item.dueDate}</Text>
          </View>
          <View style={styles.detailColumn}>
            <Text style={styles.label}>Amount</Text>
            <Text style={styles.amountValue}>Rs. {item.amount.toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getReceiptImageSource = (base64String: string | undefined) => {
    if (!base64String) return null;
    return { uri: base64String.includes('data:image') ? base64String : `data:image/jpeg;base64,${base64String}` };
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={C.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Issued Bills</Text>
          <Text style={styles.headerSubtitle}>Manage all payment requests</Text>
        </View>
        <View style={styles.backButtonSpacer} />
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['ALL', 'PENDING', 'REVIEW', 'PAID', 'OVERDUE', 'REJECTED']} // Added OVERDUE here
          keyExtractor={(item) => item}
          contentContainerStyle={{ gap: 10, paddingRight: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterChip, filter === item && styles.filterChipActive]}
              onPress={() => setFilter(item as any)}
            >
              <Text style={[styles.filterText, filter === item && styles.filterTextActive]}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.centerText}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredBills}
          keyExtractor={(item) => item.id}
          renderItem={renderBillCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>No bills found for this category.</Text>}
        />
      )}

      {/* --- REVIEW MODAL --- */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Payment Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} disabled={actionLoading}>
                <Ionicons name="close" size={24} color={C.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedBill && (
                <View style={styles.modalSummaryBox}>
                  <Text style={styles.summaryTitle}>Unit {selectedBill.houseNumber} - {selectedBill.residentName}</Text>
                  <Text style={styles.summaryAmount}>Rs. {selectedBill.amount.toFixed(2)}</Text>
                  <Text style={styles.summarySub}>{selectedBill.type} • Due: {selectedBill.dueDate}</Text>
                </View>
              )}

              <Text style={styles.receiptLabel}>Attached Receipt:</Text>
              {selectedBill?.receiptImage ? (
                <View style={styles.imageContainer}>
                  <Image 
                    source={getReceiptImageSource(selectedBill.receiptImage)!} 
                    style={styles.receiptImage} 
                    resizeMode="cover"
                  />
                </View>
              ) : (
                <View style={styles.noImageContainer}>
                  <Ionicons name="image-outline" size={40} color={C.textLight} />
                  <Text style={styles.noImageText}>
                    {selectedBill?.status === 'PENDING' ? 'Resident has not uploaded a receipt yet.' : 'No image provided.'}
                  </Text>
                </View>
              )}

              {/* ACTION BUTTONS: ONLY VISIBLE IF STATUS IS 'REVIEW' */}
              {selectedBill?.status === 'REVIEW' && (
                <View style={styles.modalActionRow}>
                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => confirmAction(false)} // Call confirmation helper
                    disabled={actionLoading}
                  >
                    <Text style={[styles.actionBtnText, { color: C.danger }]}>Reject</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => confirmAction(true)} // Call confirmation helper
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <ActivityIndicator color={C.white} />
                    ) : (
                      <Text style={styles.actionBtnText}>Approve (Paid)</Text>
                    )}
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 15 },
  backButton: { padding: 5, width: 40 },
  headerTextContainer: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: C.textDark },
  headerSubtitle: { fontSize: 13, color: C.textLight, marginTop: 2 },
  backButtonSpacer: { width: 40 },
  filterContainer: { paddingLeft: 20, marginBottom: 15 },
  filterChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: C.white, borderWidth: 1, borderColor: C.border },
  filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterText: { fontSize: 12, fontWeight: '700', color: C.textLight },
  filterTextActive: { color: C.white },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 15, elevation: 2, shadowColor: C.textLight, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  residentInfo: { flexDirection: 'row', alignItems: 'center', flexShrink: 1 },
  houseNumberBadge: { backgroundColor: C.primaryLight, color: C.primary, fontWeight: '700', fontSize: 12, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginRight: 10, overflow: 'hidden' },
  residentName: { fontSize: 16, fontWeight: '700', color: C.textDark, flexShrink: 1 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden', marginLeft: 10 },
  statusText: { fontSize: 11, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  detailColumn: { flex: 1 },
  label: { fontSize: 12, color: C.textLight, marginBottom: 4, fontWeight: '500' },
  value: { fontSize: 14, color: C.textDark, fontWeight: '600' },
  amountValue: { fontSize: 16, color: C.primary, fontWeight: '800' },
  centerText: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', color: C.textLight, marginTop: 40, fontSize: 15 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: C.textDark },
  modalSummaryBox: { backgroundColor: C.primaryLight, padding: 16, borderRadius: 16, marginBottom: 20, alignItems: 'center' },
  summaryTitle: { fontSize: 16, fontWeight: '600', color: C.textDark, marginBottom: 4 },
  summaryAmount: { fontSize: 28, fontWeight: '800', color: C.primary, marginBottom: 4 },
  summarySub: { fontSize: 13, color: C.textLight, fontWeight: '500' },
  receiptLabel: { fontSize: 15, fontWeight: '700', color: C.textDark, marginBottom: 10 },
  imageContainer: { width: '100%', height: 350, borderRadius: 16, overflow: 'hidden', backgroundColor: '#F1F5F9', marginBottom: 24, borderWidth: 1, borderColor: C.border },
  receiptImage: { width: '100%', height: '100%' },
  noImageContainer: { width: '100%', height: 200, borderRadius: 16, backgroundColor: '#F1F5F9', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  noImageText: { color: C.textLight, marginTop: 10, fontWeight: '500' },
  modalActionRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 10, marginBottom: 20 },
  actionBtn: { flex: 1, paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rejectBtn: { backgroundColor: C.white, borderWidth: 1, borderColor: C.danger },
  approveBtn: { backgroundColor: C.success },
  actionBtnText: { fontSize: 16, fontWeight: '700', color: C.white },
});