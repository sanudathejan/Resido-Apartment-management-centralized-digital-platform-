/**
 * Resident: My Bills & Payments Screen
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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { API_CONFIG, APP_CONFIG } from '@/constants/config';

// Design tokens
const C = {
  bg: '#D8F3DC',
  primary: "#2563EB",
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
  amount: number;
  type: string;
  dueDate: string;
  status: 'PENDING' | 'REVIEW' | 'PAID' | 'REJECTED';
  receiptImage?: string;
}

export default function ResidentPaymentsScreen() {
  const [loading, setLoading] = useState(true);
  const [bills, setBills] = useState<Bill[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'REVIEW' | 'PAID' | 'OVERDUE' | 'REJECTED'>('ALL');

  // Modal & Upload State
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);

  useEffect(() => {
    fetchMyBills();
  }, []);

  const fetchMyBills = async () => {
    try {
      const token = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      
      // Resident calling GET /api/payments returns only their own bills
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
        amount: item.amount || 0,
        type: item.type || 'OTHER',
        dueDate: item.dueDate || 'N/A',
        status: item.status || 'PENDING',
        receiptImage: item.receiptImage || null,
      }));

      mappedBills.sort((a, b) => parseInt(b.id) - parseInt(a.id));
      setBills(mappedBills);
    } catch (error) {
      console.error('Error fetching my bills:', error);
      Alert.alert('Error', 'Could not load your bills.');
    } finally {
      setLoading(false);
    }
  };

  const isBillOverdue = (dueDateStr: string, status: string) => {
    if (status === 'PAID') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    return due < today;
  };

  // Select an image from the device gallery
  const pickImage = async () => {
    // Request permissions first
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You need to allow camera roll access to upload a receipt.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5, // Compress image to save bandwidth
      base64: true, // We need the base64 string for your backend!
    });

    if (!result.canceled && result.assets[0].base64) {
      // Prepend the data URI scheme if not present so React Native can render it in the preview
      const base64String = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setSelectedImageBase64(base64String);
    }
  };

  // Submit the proof to the backend
  const submitProof = async () => {
    if (!selectedBill || !selectedImageBase64) return;
    
    setActionLoading(true);
    try {
      const token = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      
      const payload = {
        receiptImage: selectedImageBase64
      };

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENTS}/${selectedBill.id}/submit-proof`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Failed to submit proof');

      // Update local state instantly to 'REVIEW'
      setBills(prevBills => 
        prevBills.map(bill => 
          bill.id === selectedBill.id ? { ...bill, status: 'REVIEW', receiptImage: selectedImageBase64 } : bill
        )
      );

      setModalVisible(false);

      setTimeout(() => {
        Alert.alert('Success', 'Payment proof submitted! Waiting for manager approval.');
      }, 500);

    } catch (error) {
      console.error('Error submitting proof:', error);
      Alert.alert('Error', 'Could not submit your payment proof.');
    } finally {
      setActionLoading(false);
    }
  };

  const openBillModal = (bill: Bill) => {
    setSelectedBill(bill);
    setSelectedImageBase64(null); // Reset any previously selected image
    setModalVisible(true);
  };

  const filteredBills = bills.filter((bill) => {
    if (filter === 'ALL') return true;
    if (filter === 'OVERDUE') return isBillOverdue(bill.dueDate, bill.status);
    return bill.status === filter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID': return { bg: C.successBg, text: C.success };
      case 'REJECTED': return { bg: C.dangerBg, text: C.danger };
      case 'OVERDUE': return { bg: '#FEE2E2', text: '#DC2626' }; 
      case 'REVIEW': return { bg: '#DBEAFE', text: '#2563EB' }; 
      case 'PENDING': default: return { bg: C.warningBg, text: C.warning };
    }
  };

  const getReceiptImageSource = (base64String: string | undefined) => {
    if (!base64String) return null;
    return { uri: base64String.includes('data:image') ? base64String : `data:image/jpeg;base64,${base64String}` };
  };

  const renderBillCard = ({ item }: { item: Bill }) => {
    const displayStatus = isBillOverdue(item.dueDate, item.status) ? 'OVERDUE' : item.status;
    const statusColors = getStatusBadge(displayStatus);

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => openBillModal(item)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.billType}>{item.type}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColors.bg }]}>
            <Text style={[styles.statusText, { color: statusColors.text }]}>{displayStatus}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.detailColumn}>
            <Text style={styles.label}>Due Date</Text>
            <Text style={styles.value}>{item.dueDate}</Text>
          </View>
          <View style={styles.detailColumnRight}>
            <Text style={styles.label}>Amount Due</Text>
            <Text style={styles.amountValue}>Rs. {item.amount.toFixed(2)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>My Payments</Text>
          <Text style={styles.headerSubtitle}>View bills and submit receipts</Text>
        </View>
      </View>

      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['ALL', 'PENDING', 'OVERDUE', 'REVIEW', 'PAID', 'REJECTED']}
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
          ListEmptyComponent={<Text style={styles.emptyText}>You have no bills in this category.</Text>}
        />
      )}

      {/* --- RESIDENT ACTION MODAL --- */}
      <Modal visible={modalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bill Details</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} disabled={actionLoading}>
                <Ionicons name="close" size={24} color={C.textDark} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {selectedBill && (
                <View style={styles.modalSummaryBox}>
                  <Text style={styles.summaryTitle}>{selectedBill.type}</Text>
                  <Text style={styles.summaryAmount}>Rs. {selectedBill.amount.toFixed(2)}</Text>
                  <Text style={styles.summarySub}>Due: {selectedBill.dueDate}</Text>
                </View>
              )}

              {/* Upload Section (Only for PENDING or REJECTED) */}
              {(selectedBill?.status === 'PENDING' || selectedBill?.status === 'REJECTED') && (
                <>
                  {selectedBill.status === 'REJECTED' && (
                    <Text style={styles.rejectedWarning}>
                      Your previous payment proof was rejected. Please upload a clear receipt.
                    </Text>
                  )}

                  <Text style={styles.receiptLabel}>Upload Payment Proof:</Text>
                  
                  {selectedImageBase64 ? (
                    <View style={styles.imageContainer}>
                      <Image source={{ uri: selectedImageBase64 }} style={styles.receiptImage} resizeMode="cover" />
                      <TouchableOpacity style={styles.changeImageBtn} onPress={pickImage}>
                        <Text style={styles.changeImageText}>Change Image</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.uploadPlaceholder} onPress={pickImage}>
                      <Ionicons name="cloud-upload-outline" size={40} color={C.primary} />
                      <Text style={styles.uploadText}>Tap to select a screenshot/receipt</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity 
                    style={[styles.submitBtn, !selectedImageBase64 && styles.submitBtnDisabled]}
                    onPress={submitProof}
                    disabled={!selectedImageBase64 || actionLoading}
                  >
                    {actionLoading ? (
                      <ActivityIndicator color={C.white} />
                    ) : (
                      <Text style={styles.submitBtnText}>Submit Proof</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}

              {/* View Section (For REVIEW or PAID) */}
              {(selectedBill?.status === 'REVIEW' || selectedBill?.status === 'PAID') && (
                <>
                  <Text style={styles.receiptLabel}>Your Submitted Proof:</Text>
                  <View style={styles.imageContainer}>
                    {selectedBill.receiptImage ? (
                      <Image 
                        source={getReceiptImageSource(selectedBill.receiptImage)!} 
                        style={styles.receiptImage} 
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.noImageText}>Image unavailable</Text>
                    )}
                  </View>
                  {selectedBill.status === 'REVIEW' && (
                    <Text style={styles.reviewNotice}>
                      <Ionicons name="time-outline" size={16} /> Waiting for manager approval...
                    </Text>
                  )}
                </>
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
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15 },
  headerTextContainer: { alignItems: 'flex-start' },
  headerTitle: { fontSize: 26, fontWeight: '800', color: C.textDark },
  headerSubtitle: { fontSize: 14, color: C.textLight, marginTop: 4 },
  
  filterContainer: { paddingLeft: 20, marginBottom: 15 },
  filterChip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: C.white, borderWidth: 1, borderColor: C.border },
  filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterText: { fontSize: 12, fontWeight: '700', color: C.textLight },
  filterTextActive: { color: C.white },
  
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 15, elevation: 2, shadowColor: C.textLight, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  billType: { fontSize: 16, fontWeight: '800', color: C.textDark, textTransform: 'uppercase' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  statusText: { fontSize: 11, fontWeight: '800' },
  divider: { height: 1, backgroundColor: '#F1F5F9', marginVertical: 12 },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  detailColumn: { flex: 1 },
  detailColumnRight: { alignItems: 'flex-end' },
  label: { fontSize: 12, color: C.textLight, marginBottom: 4, fontWeight: '500' },
  value: { fontSize: 14, color: C.textDark, fontWeight: '600' },
  amountValue: { fontSize: 18, color: C.primary, fontWeight: '800' },
  centerText: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', color: C.textLight, marginTop: 40, fontSize: 15 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: C.overlay, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: C.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: C.textDark },
  modalSummaryBox: { backgroundColor: C.primaryLight, padding: 16, borderRadius: 16, marginBottom: 20, alignItems: 'center' },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  summaryAmount: { fontSize: 28, fontWeight: '800', color: C.primary, marginBottom: 4 },
  summarySub: { fontSize: 13, color: C.textLight, fontWeight: '500' },
  
  receiptLabel: { fontSize: 15, fontWeight: '700', color: C.textDark, marginBottom: 10 },
  uploadPlaceholder: { width: '100%', height: 150, borderRadius: 16, backgroundColor: C.primaryLight, borderWidth: 2, borderColor: C.primary, borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  uploadText: { color: C.primary, marginTop: 10, fontWeight: '600' },
  
  imageContainer: { width: '100%', height: 350, borderRadius: 16, overflow: 'hidden', backgroundColor: '#F1F5F9', marginBottom: 24, borderWidth: 1, borderColor: C.border, position: 'relative' },
  receiptImage: { width: '100%', height: '100%' },
  changeImageBtn: { position: 'absolute', bottom: 16, alignSelf: 'center', backgroundColor: C.overlay, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  changeImageText: { color: C.white, fontWeight: '700', fontSize: 13 },
  noImageText: { color: C.textLight, marginTop: 'auto', marginBottom: 'auto', textAlign: 'center' },
  
  submitBtn: { backgroundColor: C.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  submitBtnDisabled: { backgroundColor: '#A78BFA' }, // Lighter purple
  submitBtnText: { fontSize: 16, fontWeight: '700', color: C.white },
  
  rejectedWarning: { color: C.danger, backgroundColor: C.dangerBg, padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 13, fontWeight: '500', textAlign: 'center' },
  reviewNotice: { textAlign: 'center', color: '#2563EB', backgroundColor: '#DBEAFE', padding: 12, borderRadius: 8, fontSize: 14, fontWeight: '600', overflow: 'hidden' },
});