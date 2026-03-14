import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  StatusBar,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';

const THEME = {
  primary: '#2B72F1',      // Main brand blue
  background: '#EBF7ED',   // Light mint background
  white: '#FFFFFF',
  textDark: '#1E293B',     // Titles
  textLight: '#64748B',    // Descriptions
  border: '#F1F5F9',
  accentOrange: '#F59E0B', // Utilities
  accentGreen: '#10B981',  // Service Fee / Paid status
};

export default function RentScreen() {
  const [autoPay, setAutoPay] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null);

  // --- LOGIC: Pick Receipt Photo ---
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (!result.canceled) {
      setReceiptImage(result.assets[0].uri);
    }
  };

  // --- LOGIC: Submit to Manager ---
  const submitReceipt = () => {
    Alert.alert(
      "Confirm Submission",
      "Send this receipt to your manager for verification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Send",
          onPress: () => {
            Alert.alert("Success", "Receipt sent successfully!");
            setReceiptImage(null); // Clear after sending
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

      {/* 1. HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBg}>
          <Ionicons name="arrow-back" size={22} color={THEME.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rent & Payments</Text>
        <TouchableOpacity style={styles.headerIconBorder}>
          <Ionicons name="notifications-outline" size={20} color={THEME.textDark} />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* 2. HERO CARD (Payment + Receipt Upload) */}
        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total Amount Due</Text>
          <Text style={styles.heroAmount}>Rs 1,200.00</Text>
          <View style={styles.heroDateRow}>
            <Ionicons name="calendar-outline" size={14} color={THEME.white} />
            <Text style={styles.heroDateText}>Due in 3 days • Oct 2023</Text>
          </View>

          <TouchableOpacity style={styles.payNowButton} activeOpacity={0.85}>
            <MaterialCommunityIcons name="cash-multiple" size={20} color={THEME.primary} />
            <Text style={styles.payNowText}>Pay Now</Text>
          </TouchableOpacity>

          {/* Manual Receipt Upload UI */}
          <View style={styles.uploadSection}>
            <Text style={styles.uploadText}>Paid externally? Upload proof:</Text>
            <View style={styles.uploadRow}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={pickImage}>
                <Ionicons name="camera" size={18} color={THEME.white} />
                <Text style={styles.secondaryBtnText}>
                  {receiptImage ? "Change" : "Upload Receipt"}
                </Text>
              </TouchableOpacity>

              {receiptImage && (
                <TouchableOpacity style={styles.sendBtn} onPress={submitReceipt}>
                  <Text style={styles.sendBtnText}>Send to Manager</Text>
                </TouchableOpacity>
              )}
            </View>

            {receiptImage && (
              <Image source={{ uri: receiptImage }} style={styles.receiptPreview} />
            )}
          </View>
        </View>

        {/* 3. BILL DETAILS */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bill Details</Text>
          <Text style={styles.sectionCount}>3 Items</Text>
        </View>

        <View style={styles.billList}>
          <BillDetailItem
            icon="home-variant"
            title="Base Rent"
            desc="Monthly apartment lease"
            price="1,000.00"
            color={THEME.primary}
            progress="100%"
          />
          <BillDetailItem
            icon="lightning-bolt"
            title="Utilities"
            desc="Water, Electricity, Gas"
            price="150.00"
            color={THEME.accentOrange}
            progress="40%"
          />
          <BillDetailItem
            icon="hammer-wrench"
            title="Service Fee"
            desc="Maintenance & Security"
            price="50.00"
            color={THEME.accentGreen}
            progress="15%"
          />
        </View>

        {/* 4. AUTO-PAY TOGGLE */}
        <View style={styles.autoPayContainer}>
          <View style={styles.autoPayIcon}>
            <Ionicons name="sync" size={20} color={THEME.white} />
          </View>
          <View style={styles.autoPayTextContent}>
            <Text style={styles.autoPayTitle}>Auto-pay Setup</Text>
            <Text style={styles.autoPaySub}>Never miss a due date again</Text>
          </View>
          <Switch
            value={autoPay}
            onValueChange={setAutoPay}
            trackColor={{ false: '#CBD5E1', true: THEME.primary }}
          />
        </View>

        {/* 5. PAYMENT HISTORY */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
        </View>

        <View style={styles.historyList}>
          <HistoryRow title="September Rent" date="Sep 01, 2023" amount="1,200.00" />
          <HistoryRow title="August Rent" date="Aug 01, 2023" amount="1,200.00" />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

/** Components **/

const BillDetailItem = ({ icon, title, desc, price, color, progress }) => (
  <View style={styles.billItem}>
    <View style={[styles.billIconBox, { backgroundColor: `${color}15` }]}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
    </View>
    <View style={styles.billCenter}>
      <Text style={styles.billTitleText}>{title}</Text>
      <Text style={styles.billDescText}>{desc}</Text>
    </View>
    <View style={styles.billRight}>
      <Text style={styles.billPriceText}>Rs {price}</Text>
      <View style={styles.progressBarBase}>
        <View style={[styles.progressBarActive, { backgroundColor: color, width: progress }]} />
      </View>
    </View>
  </View>
);

const HistoryRow = ({ title, date, amount }) => (
  <View style={styles.historyRow}>
    <View style={styles.historyIconBg}>
      <MaterialCommunityIcons name="file-document-outline" size={22} color={THEME.textLight} />
    </View>
    <View style={styles.historyTextContainer}>
      <Text style={styles.historyTitle}>{title}</Text>
      <Text style={styles.historyDate}>{date}</Text>
    </View>
    <View style={styles.historyAmountContainer}>
      <Text style={styles.historyAmount}>Rs {amount}</Text>
      <Text style={styles.paidBadge}>PAID</Text>
    </View>
  </View>
);

/** Styles **/

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: THEME.textDark },
  headerIconBg: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EBF2FF', alignItems: 'center', justifyContent: 'center' },
  headerIconBorder: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: THEME.border, alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.white },
  notifDot: { position: 'absolute', top: 12, right: 12, width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: THEME.white },

  // Hero Card
  heroCard: { backgroundColor: THEME.primary, borderRadius: 24, padding: 20, marginTop: 10 },
  heroLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500' },
  heroAmount: { color: THEME.white, fontSize: 34, fontWeight: '800', marginVertical: 8 },
  heroDateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  heroDateText: { color: THEME.white, fontSize: 13, marginLeft: 6, opacity: 0.9 },
  payNowButton: { backgroundColor: THEME.white, borderRadius: 16, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  payNowText: { color: THEME.primary, fontSize: 16, fontWeight: '700', marginLeft: 8 },

  // Upload Section (Inside Hero)
  uploadSection: { marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' },
  uploadText: { color: THEME.white, fontSize: 13, marginBottom: 10, opacity: 0.8 },
  uploadRow: { flexDirection: 'row', gap: 10 },
  secondaryBtn: { flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', height: 40, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' },
  secondaryBtnText: { color: THEME.white, fontSize: 13, fontWeight: '600', marginLeft: 6 },
  sendBtn: { flex: 1, backgroundColor: THEME.accentGreen, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: THEME.white, fontSize: 13, fontWeight: '700' },
  receiptPreview: { width: '100%', height: 120, borderRadius: 12, marginTop: 15, resizeMode: 'cover' },

  // Sections
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 25, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: THEME.textDark },
  sectionCount: { fontSize: 13, color: THEME.textLight },

  // Bill Items
  billList: { gap: 12 },
  billItem: { backgroundColor: THEME.white, borderRadius: 18, padding: 15, flexDirection: 'row', alignItems: 'center' },
  billIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  billCenter: { flex: 1, paddingHorizontal: 12 },
  billTitleText: { fontSize: 15, fontWeight: '700', color: THEME.textDark },
  billDescText: { fontSize: 12, color: THEME.textLight, marginTop: 2 },
  billRight: { alignItems: 'flex-end' },
  billPriceText: { fontSize: 15, fontWeight: '700', color: THEME.textDark },
  progressBarBase: { width: 60, height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, marginTop: 8 },
  progressBarActive: { height: 4, borderRadius: 2 },

  // Auto-Pay
  autoPayContainer: { backgroundColor: '#F0F6FF', borderRadius: 20, padding: 15, flexDirection: 'row', alignItems: 'center', marginTop: 20 },
  autoPayIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: THEME.primary, alignItems: 'center', justifyContent: 'center' },
  autoPayTextContent: { flex: 1, marginLeft: 12 },
  autoPayTitle: { fontSize: 15, fontWeight: '700', color: THEME.textDark },
  autoPaySub: { fontSize: 12, color: THEME.textLight },

  // History
  viewAllText: { color: THEME.primary, fontSize: 14, fontWeight: '600' },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  historyIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  historyTextContainer: { flex: 1, marginLeft: 12 },
  historyTitle: { fontSize: 15, fontWeight: '600', color: THEME.textDark },
  historyDate: { fontSize: 12, color: THEME.textLight },
  historyAmountContainer: { alignItems: 'flex-end' },
  historyAmount: { fontSize: 15, fontWeight: '700', color: THEME.textDark },
  paidBadge: { fontSize: 10, fontWeight: '800', color: THEME.accentGreen, marginTop: 4 },
});