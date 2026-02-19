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