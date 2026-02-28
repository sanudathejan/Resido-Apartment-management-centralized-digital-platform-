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
  Image, // Added for receipt preview
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker'; // Import Image Picker

const THEME = {
  primary: '#2B72F1',
  background: '#D8F3DC',
  white: '#FFFFFF',
  textDark: '#1E293B',
  textLight: '#64748B',
  border: '#F1F5F9',
  accentOrange: '#F59E0B',
  accentGreen: '#10B981',
};

export default function RentScreen() {
  const [autoPay, setAutoPay] = useState(false);
  const [receiptImage, setReceiptImage] = useState(null); // State to store image URI

  // --- NEW FUNCTION: Pick Image ---
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

  // --- NEW FUNCTION: Submit to Manager ---
  const submitReceipt = () => {
    if (!receiptImage) {
      Alert.alert("Missing Receipt", "Please upload a photo of your receipt first.");
      return;
    }

    // Here you would add your Fetch/Axios call to send 'receiptImage' to your backend
    Alert.alert(
      "Receipt Sent",
      "Your receipt has been sent to the manager for verification.",
      [{ text: "OK", onPress: () => setReceiptImage(null) }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" />

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

        <View style={styles.heroCard}>
          <Text style={styles.heroLabel}>Total Amount Due</Text>
          <Text style={styles.heroAmount}>$1,200.00</Text>
          <View style={styles.heroDateRow}>
            <Ionicons name="calendar-outline" size={14} color={THEME.white} />
            <Text style={styles.heroDateText}>Due in 3 days • Oct 2023</Text>
          </View>

          {/* Main Pay Button */}
          <TouchableOpacity style={styles.payNowButton} activeOpacity={0.85}>
            <MaterialCommunityIcons name="cash-multiple" size={20} color={THEME.primary} />
            <Text style={styles.payNowText}>Pay Now</Text>
          </TouchableOpacity>

          {/* --- NEW: RECEIPT UPLOAD SECTION --- */}
          <View style={styles.uploadSection}>
            <Text style={styles.uploadText}>Paid externally? Upload proof:</Text>
            <View style={styles.uploadRow}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={pickImage}>
                <Ionicons name="camera" size={18} color={THEME.white} />
                <Text style={styles.secondaryBtnText}>
                  {receiptImage ? "Change Photo" : "Upload Receipt"}
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

        {/* ... Rest of your Bill Details and History remain the same ... */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bill Details</Text>
            <Text style={styles.sectionCount}>3 Items</Text>
        </View>
        {/* (Include your BillDetailItem list here) */}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // ... Keep your existing styles ...
  container: { flex: 1, backgroundColor: THEME.background },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 20 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: THEME.textDark },
  headerIconBg: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#EBF2FF', alignItems: 'center', justifyContent: 'center' },
  headerIconBorder: { width: 42, height: 42, borderRadius: 21, borderWidth: 1, borderColor: THEME.border, alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.white },
  notifDot: { position: 'absolute', top: 12, right: 12, width: 7, height: 7, borderRadius: 4, backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: THEME.white },
  heroCard: { backgroundColor: THEME.primary, borderRadius: 24, padding: 20, marginTop: 10 },
  heroLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500' },
  heroAmount: { color: THEME.white, fontSize: 36, fontWeight: '800', marginVertical: 8 },
  heroDateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  heroDateText: { color: THEME.white, fontSize: 13, marginLeft: 6, opacity: 0.9 },
  payNowButton: { backgroundColor: THEME.white, borderRadius: 16, height: 50, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  payNowText: { color: THEME.primary, fontSize: 16, fontWeight: '700', marginLeft: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 28, marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: THEME.textDark },
  sectionCount: { fontSize: 13, color: THEME.textLight },

  // --- NEW STYLES FOR UPLOAD ---
  uploadSection: { marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' },
  uploadText: { color: THEME.white, fontSize: 13, marginBottom: 10, opacity: 0.8 },
  uploadRow: { flexDirection: 'row', gap: 10 },
  secondaryBtn: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.2)', height: 40, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)'
  },
  secondaryBtnText: { color: THEME.white, fontSize: 13, fontWeight: '600', marginLeft: 6 },
  sendBtn: { flex: 1, backgroundColor: THEME.accentGreen, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sendBtnText: { color: THEME.white, fontSize: 13, fontWeight: '700' },
  receiptPreview: { width: '100%', height: 150, borderRadius: 12, marginTop: 15, resizeMode: 'cover' },
});