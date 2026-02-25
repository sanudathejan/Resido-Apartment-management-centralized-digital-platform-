/**
 * Rent & Payments Screen
 * * Layout Structure:
 * 1. Custom Header with Back and Notification buttons.
 * 2. Hero Card: High-contrast blue container for primary "Pay Now" action.
 * 3. Bill Details: Itemized list with progress-bar style indicators.
 * 4. Auto-Pay: Highlighted toggle section.
 * 5. Payment History: Simplified list with status badges.
 */

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Define the THEME object so the rest of the code can use it
const THEME = {
  primary: '#2B72F1',      // The main brand blue
  background: '#A9A9A9',   // Soft grey/white background
  white: '#FFFFFF',
  textDark: '#1E293B',     // Deep slate for titles
  textLight: '#64748B',    // Muted slate for descriptions
  border: '#F1F5F9',
  accentOrange: '#F59E0B', // Utility color
  accentGreen: '#10B981',  // Service fee color
};


export default function RentScreen() {
  const [autoPay, setAutoPay] = useState(false);

  return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" />

        {/* --- 1. HEADER SECTION --- */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIconBg}>
            <Ionicons name="arrow-back" size={22} color={THEME.primary} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Rent & Payments</Text>

          <TouchableOpacity style={styles.headerIconBorder}>
            <Ionicons name="notifications-outline" size={20} color={THEME.textDark} />
            {/* Notification Indicator Dot */}
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >

        {/* --- 2. HERO CARD (TOTAL DUE) --- */}
                <View style={styles.heroCard}>
                  <Text style={styles.heroLabel}>Total Amount Due</Text>
                  <Text style={styles.heroAmount}>$1,200.00</Text>

                  <View style={styles.heroDateRow}>
                    <Ionicons name="calendar-outline" size={14} color={THEME.white} />
                    <Text style={styles.heroDateText}>Due in 3 days • Oct 2023</Text>
                  </View>

        {/* Main Action Button */}
                  <TouchableOpacity style={styles.payNowButton} activeOpacity={0.85}>
                    <MaterialCommunityIcons name="cash-multiple" size={20} color={THEME.primary} />
                    <Text style={styles.payNowText}>Pay Now</Text>
                  </TouchableOpacity>
                </View>

        {/* --- 3. BILL DETAILS SECTION --- */}
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Bill Details</Text>
                  <Text style={styles.sectionCount}>3 Items</Text>
                </View>

        <View style={styles.billContainer}>
                  <BillDetailItem
                    icon="home-variant"
                    title="Base Rent"
                    desc="Monthly apartment lease"
                    price="1,000.00"
                    color={THEME.primary}
                    progressWidth="100%" // Full width bar for primary bill
                  />
                  <BillDetailItem
                    icon="lightning-bolt"
                    title="Utilities"
                    desc="Water, Electricity, Gas"
                    price="150.00"
                    color={THEME.accentOrange}
                    progressWidth="30%" // Partial bar as seen in design
                  />
                  <BillDetailItem
                    icon="hammer-wrench"
                    title="Service Fee"
                    desc="Maintenance & Security"
                    price="50.00"
                    color={THEME.accentGreen}
                    progressWidth="15%" // Small bar as seen in design
                  />
                </View>


              {/* --- 4. AUTO-PAY TOGGLE SECTION --- */}
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

              {/* --- 5. PAYMENT HISTORY --- */}
                      <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Payment History</Text>
                        <TouchableOpacity><Text style={styles.viewAllText}>View All</Text></TouchableOpacity>
                      </View>

                      <View style={styles.historyList}>
                        <HistoryRow title="September Rent" date="Sep 01, 2023" amount="1,200.00" />
                        <HistoryRow title="August Rent" date="Aug 01, 2023" amount="1,200.00" />
                        <HistoryRow title="July Rent" date="Jul 01, 2023" amount="1,200.00" />
                      </View>

                    </ScrollView>
                  </SafeAreaView>
                );
              }

/**
 * Bill Detail Component
 * Renders individual rows with icons and progress bars
 */
const BillDetailItem = ({ icon, title, desc, price, color, progressWidth }: any) => (
  <View style={styles.billItem}>
    <View style={[styles.billIconBox, { backgroundColor: `${color}15` }]}>
      <MaterialCommunityIcons name={icon} size={22} color={color} />
    </View>
    <View style={styles.billCenter}>
      <Text style={styles.billTitleText}>{title}</Text>
      <Text style={styles.billDescText}>{desc}</Text>
    </View>
    <View style={styles.billRight}>
      <Text style={styles.billPriceText}>${price}</Text>
      {/* Custom Progress Bar matching the image */}
      <View style={styles.progressBarBase}>
        <View style={[styles.progressBarActive, { backgroundColor: color, width: progressWidth }]} />
      </View>
    </View>
  </View>
);

/**
 * History Row Component
 * Simple list item for previous payments
 */
const HistoryRow = ({ title, date, amount }: any) => (
  <View style={styles.historyRow}>
    <View style={styles.historyIconBg}>
      <MaterialCommunityIcons name="file-document-outline" size={22} color={THEME.textLight} />
    </View>
    <View style={styles.historyTextContainer}>
      <Text style={styles.historyTitle}>{title}</Text>
      <Text style={styles.historyDate}>{date}</Text>
    </View>
    <View style={styles.historyAmountContainer}>
      <Text style={styles.historyAmount}>${amount}</Text>
      <Text style={styles.paidBadge}>PAID</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: THEME.background },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },


/* Header Styles */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: THEME.textDark },
  headerIconBg: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: '#EBF2FF', alignItems: 'center', justifyContent: 'center',
  },
  headerIconBorder: {
    width: 42, height: 42, borderRadius: 21,
    borderWidth: 1, borderColor: THEME.border,
    alignItems: 'center', justifyContent: 'center', backgroundColor: THEME.white,
  },
  notifDot: {
    position: 'absolute', top: 12, right: 12,
    width: 7, height: 7, borderRadius: 4,
    backgroundColor: '#EF4444', borderWidth: 1.5, borderColor: THEME.white,
  },


/* Hero Card Styles */
  heroCard: {
    backgroundColor: THEME.primary,
    borderRadius: 24,
    padding: 24,
    marginTop: 10,
    // Shadow for iOS/Android
    ...Platform.select({
      ios: { shadowColor: THEME.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 15 },
      android: { elevation: 8 },
    }),
  },

heroLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 14, fontWeight: '500' },
  heroAmount: { color: THEME.white, fontSize: 36, fontWeight: '800', marginVertical: 8 },
  heroDateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  heroDateText: { color: THEME.white, fontSize: 13, marginLeft: 6, opacity: 0.9 },
  payNowButton: {
    backgroundColor: THEME.white,
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  payNowText: { color: THEME.primary, fontSize: 16, fontWeight: '700', marginLeft: 8 },

/* Bill Details Styles */
 sectionHeader: {
   flexDirection: 'row',
   alignItems: 'center',
   justifyContent: 'space-between', // Pushes items to opposite sides
   marginTop: 28,
   marginBottom: 15
 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: THEME.textDark },
  sectionCount: { fontSize: 13, color: THEME.textLight, marginLeft: 8 },
  billContainer: { gap: 12 },
  billItem: {
    backgroundColor: THEME.white, borderRadius: 18, padding: 15,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: '#F1F5F9',
  },
  billIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  billCenter: { flex: 1, paddingHorizontal: 12 },
  billTitleText: { fontSize: 15, fontWeight: '700', color: THEME.textDark },
  billDescText: { fontSize: 12, color: THEME.textLight, marginTop: 2 },
  billRight: { alignItems: 'flex-end' },
  billPriceText: { fontSize: 16, fontWeight: '700', color: THEME.textDark },
  progressBarBase: { width: 70, height: 4, backgroundColor: '#F1F5F9', borderRadius: 2, marginTop: 8 },
  progressBarActive: { height: 4, borderRadius: 2 },

/* Auto-Pay Styles */
  autoPayContainer: {
    backgroundColor: '#F0F6FF', borderRadius: 20, padding: 15,
    flexDirection: 'row', alignItems: 'center', marginTop: 20,
  },
  autoPayIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: THEME.primary, alignItems: 'center', justifyContent: 'center' },
  autoPayTextContent: { flex: 1, marginLeft: 12 },
  autoPayTitle: { fontSize: 15, fontWeight: '700', color: THEME.textDark },
  autoPaySub: { fontSize: 12, color: THEME.textLight },

/* History Styles */
  viewAllText: {
    color: THEME.primary,
    fontSize: 14,
    fontWeight: '600'
    // removed marginLeft: 'auto'
  },
  historyList: { marginTop: 5 },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  historyIconBg: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F8FAFC', alignItems: 'center', justifyContent: 'center' },
  historyTextContainer: { flex: 1, marginLeft: 12 },
  historyTitle: { fontSize: 15, fontWeight: '600', color: THEME.textDark },
  historyDate: { fontSize: 12, color: THEME.textLight, marginTop: 2 },
  historyAmountContainer: { alignItems: 'flex-end' },
  historyAmount: { fontSize: 15, fontWeight: '700', color: THEME.textDark },
  paidBadge: { fontSize: 10, fontWeight: '800', color: THEME.accentGreen, marginTop: 4 },
});

