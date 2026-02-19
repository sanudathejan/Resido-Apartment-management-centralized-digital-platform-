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
  bg: '#F8FAFC', // Slightly cleaner background
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  white: '#FFFFFF',
  textDark: '#0F172A',
  textLight: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  secondary: '#7C3AED',
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
  const [activeTab, setActiveTab] = useState<'parking' | 'visitors'>('parking');
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
            <View style={styles.statusBadgeGreen}>
                <View style={styles.dotGreen} />
                <Text style={styles.statusTextGreen}>Available</Text>
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

            {/* 3. Pending Requests: Other residents asking for a spot */}
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>PENDING REQUESTS</Text>
                    <View style={styles.countBadge}>
                        <Text style={styles.countText}>2 New</Text>
                    </View>
                  </View>

                  <RequestCard
                    name="Guest for Apt 4B"
                    time="Requested 15m ago"
                    note="My visitor needs a spot for 3 hours. Would appreciate the help!"
                  />
                  <RequestCard
                    name="James Wilson"
                    time="Apt 12C • Requested 2h ago"
                    note="Needs parking tomorrow, 6 PM - 10 PM"
                  />
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


