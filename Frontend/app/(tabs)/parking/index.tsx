/**
 * Parking & Visitor Management Screen
 * Purpose: Allows residents to manage their parking slot availability,
 * respond to lending requests, and track visitor entry/exit.
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
  Switch,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { parkingService } from '@/services';
import { ParkingSlot, VisitorEntry } from '@/types';

/* ─── Updated Design Tokens ─── */
const C = {
  bg: '#EBF7ED',        // Slightly darker grey background to make white boxes "pop"
  primary: '#1D4ED8',   // Deeper blue for better text contrast
  primaryLight: '#DBEAFE',
  white: '#FFFFFF',
  textDark: '#0F172A',  // Deep slate for headers
  textLight: '#334155', // Darkened from #64748B for significantly better readability
  textMuted: '#64748B', // Standard grey for secondary info
  border: '#CBD5E1',    // Slightly darker border for clearer definition
  success: '#065F46',   // Deep emerald (much easier to read than bright green)
  warning: '#92400E',
  error: '#991B1B',
  secondary: '#5B21B6',
} as const;

const shadow = (elevation: number) => ({
  ...Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: elevation },
      shadowOpacity: 0.1,
      shadowRadius: elevation * 2,
    },
    android: { elevation },
  }),
});

export default function ParkingScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'parking' | 'visitors'>('parking');// define a state variable called activeTab. This is what remembers which button you last clicked.
  const [parkingSlot, setParkingSlot] = useState<any>(null); // Replace any with your type
  const [loading, setLoading] = useState(false);
  const [showVisitorModal, setShowVisitorModal] = useState(false);

// Toggle State for the "Lend My Slot" switch
  const [isLending, setIsLending] = useState(false);

/* ─── UI HANDLERS ─── */
  const handleToggleLending = (value: boolean) => {
    setIsLending(value);
    // Add logic here to update the backend via parkingService
  };

/* ─── RENDER: PARKING TAB ─── */
  const renderParkingTab = () => (
    <>
      {/* 1. Slot Visual Card: Displays current assignment status */}
      <View style={[styles.card, shadow(2)]}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1000&auto=format&fit=crop' }}
          style={styles.slotImage}
        />
        <View style={styles.slotHeaderOverlay}>
            <View style={styles.badgePrimary}>
                <Text style={styles.badgeTextWhite}>YOUR SLOT</Text>
            </View>
        </View>

        <View style={styles.slotDetails}>
            <View>
                <Text style={styles.slotSubLabel}>ASSIGNED SLOT</Text>
                <Text style={styles.slotMainTitle}>Slot P-A12</Text>
            </View>
            <View style={isLending ? styles.statusBadgeGreen : styles.statusBadgeMuted}>
                <View style={isLending ? styles.dotGreen : styles.dotMuted} />
                <Text style={isLending ? styles.statusTextGreen : styles.statusTextMuted}>
                    {isLending ? 'Lending Active' : 'Private'}
                </Text>
            </View>
        </View>
      </View>

      {/* 2. Lending Management: Switch to allow others to use the slot */}
            <View style={[styles.toggleCard, shadow(2)]}>
              <View style={{ flex: 1 }}>
                  <Text style={styles.cardTitle}>Lend My Slot</Text>
                  <Text style={styles.cardSubtitle}>
                      Mark your slot as free for other residents to use temporarily while you're away.
                  </Text>
              </View>
              <Switch
                  value={isLending}
                  onValueChange={handleToggleLending}
                  trackColor={{ false: '#CBD5E1', true: '#2563EB' }}
                  thumbColor={Platform.OS === 'android' ? C.white : ''}
              />
            </View>

           


                </>
              );

/* ─── RENDER: VISITORS TAB ─── */
  const renderVisitorsTab = () => (
    <>
      {/* Primary Action: Register new entry */}
      <TouchableOpacity
        style={[styles.registerButton, shadow(2)]}
        onPress={() => setShowVisitorModal(true)}
      >
        <Ionicons name="person-add" size={20} color={C.white} />
        <Text style={styles.registerButtonText}>Register New Visitor</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Visitor History</Text>

      {/* Visitor Detail Card: Shows contact, vehicle, and timestamp info */}
      <View style={[styles.visitorCard, shadow(1)]}>
          <View style={styles.visitorRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>JS</Text>
              </View>
              <View style={{ flex: 1 }}>
                  <Text style={styles.visitorName}>John Smith</Text>
                  <Text style={styles.visitorSub}>Family visit</Text>
              </View>
              <View style={styles.statusIn}>
                <Text style={styles.statusInText}>• Checked In</Text>
              </View>
          </View>

          <View style={styles.detailsBox}>
              <View style={styles.detailItem}>
                <Ionicons name="call-outline" size={14} color={C.textLight} />
                <Text style={styles.detailText}>+94 77 123 4567</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="car-outline" size={14} color={C.textLight} />
                <Text style={styles.detailText}>XYZ-5678</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={14} color={C.textLight} />
                <Text style={styles.detailText}>2/19/2026, 5:13:19 PM</Text>
              </View>
          </View>
      </View>
    </>
  );

return (
    <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header Section */}
        <View style={styles.header}>
            <Text style={styles.headerTitle}>Parking & Visitors</Text>
            <Text style={styles.headerSubtitle}>Manage parking and visitor entries</Text>
        </View>

        {/* Custom Tab Switcher */}
        <View style={styles.tabContainer}>
            <TabButton
                active={activeTab === 'parking'}
                label="My Parking"
                icon="car"
                onPress={() => setActiveTab('parking')}
            />
            <TabButton
                active={activeTab === 'visitors'}
                label="Visitors"
                icon="people"
                onPress={() => setActiveTab('visitors')}
            />
        </View>

        <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {activeTab === 'parking' ? renderParkingTab() : renderVisitorsTab()}
        </ScrollView>
    </SafeAreaView>
  );
}

/* ─── SUB-COMPONENTS ─── */

/**
 * TabButton: Navigates between Parking management and Visitor lists
 */
const TabButton = ({ active, label, icon, onPress }: any) => (
    <TouchableOpacity onPress={onPress} style={[styles.tab, active && styles.tabActive]}>
        <Ionicons name={icon} size={18} color={active ? C.primary : C.textMuted} />
        <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </TouchableOpacity>
);


/**
 * RequestCard: Display for other residents asking to use your parking slot
 */
const RequestCard = ({ name, time, note }: any) => (
    <View style={[styles.requestCard, shadow(1)]}>
        <View style={styles.visitorRow}>
            <View style={styles.avatarSmall} />
            <View style={{ flex: 1 }}>
                <Text style={styles.visitorName}>{name}</Text>
                <Text style={styles.visitorSub}>{time}</Text>
            </View>
            <Ionicons name="chatbubble-ellipses" size={20} color={C.textMuted} />
        </View>
        <Text style={styles.requestNote}>"{note}"</Text>
        <View style={styles.actionRow}>
            <TouchableOpacity style={styles.declineBtn}>
                <Text style={styles.declineText}>Decline</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.acceptBtn}>
                <Text style={styles.acceptText}>Accept</Text>
            </TouchableOpacity>
        </View>
    </View>
);

/* ─── High-Readability StyleSheet ─── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: '800', color: C.textDark },
  headerSubtitle: { fontSize: 14, color: C.textLight, marginTop: 4 },

  // Tabs
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: '#CBD5E1',//Darker track
    borderRadius: 14,
    padding: 4
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10
  },
  tabActive: { backgroundColor: C.white },
  tabText: { marginLeft: 8, fontSize: 14, fontWeight: '600', color: C.textMuted },
  tabTextActive: { color: C.primary },

  scrollContent: { padding: 20, paddingBottom: 40 },

// Parking Slot Card
card: {
  backgroundColor: C.white,
  borderRadius: 24,
  overflow: 'hidden',
  marginBottom: 20,
  borderWidth: 1,
  borderColor: '#94A3B8'    // (Medium border color)
},
  slotImage: { width: '100%', height: 160 },
  slotHeaderOverlay: { position: 'absolute', top: 12, right: 12 },
  badgePrimary: { backgroundColor: C.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  badgeTextWhite: { color: C.white, fontSize: 10, fontWeight: '800' },
  slotDetails: { padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  slotSubLabel: { fontSize: 11, fontWeight: '700', color: C.primary, letterSpacing: 0.5 },
  slotMainTitle: { fontSize: 22, fontWeight: '800', color: C.textDark },

  // Status Badges (Green/Available)
  statusBadgeGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12
  },
  dotGreen: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.success, marginRight: 6 },
  statusTextGreen: { color: C.success, fontSize: 12, fontWeight: '700' },

  // Lending Toggle Card
  toggleCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#94A3B8'
  },
  cardTitle: { fontSize: 16, fontWeight: '700', color: C.textDark },
  cardSubtitle: { fontSize: 13, color: C.textLight, marginTop: 4, lineHeight: 18 },

  // Section Headers
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: C.textLight, letterSpacing: 1 },
  countBadge: { backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  countText: { color: C.primary, fontSize: 11, fontWeight: '700' },

// Request Cards
  requestCard: { backgroundColor: C.white, borderRadius: 20, padding: 16, marginBottom: 12 ,borderWidth: 1,borderColor: '#94A3B8'},
  avatarSmall: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F1F5F9' },
  // Increased darkness and line height for notes
  requestNote: {
    fontSize: 14,
    fontStyle: 'italic',
    color: C.textDark,
    marginVertical: 12,
    lineHeight: 20
  },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  declineBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: C.border, alignItems: 'center' },
  acceptBtn: { flex: 1, padding: 12, borderRadius: 12, backgroundColor: C.primary, alignItems: 'center' },
  declineText: { fontWeight: '700', color: C.textDark },
  acceptText: { fontWeight: '700', color: C.white },

// Visitor History - Darker labels
  visitorCard: { backgroundColor: C.white, borderRadius: 20, padding: 16, marginBottom: 12,borderWidth: 1,borderColor: '#94A3B8' },
  visitorRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor:'#F3E8FF', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: C.secondary, fontWeight: '700' },
  visitorName: { fontSize: 16, fontWeight: '700', color: C.textDark },
  visitorSub: { fontSize: 12, color: C.textMuted, marginTop: 1 },
  statusIn: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusInText: { color: C.success, fontSize: 11, fontWeight: '700' },

// Details Box - Darkened background and added border for visibility
  detailsBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: C.border
  },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  detailText: { fontSize: 13, color: C.textLight, fontWeight: '500' },

  registerButton: {
    backgroundColor: C.primary,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24
  },
  registerButtonText: { color: C.white, fontWeight: '700', marginLeft: 8 },
});

