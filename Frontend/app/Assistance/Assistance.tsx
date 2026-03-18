import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert, View, ActivityIndicator, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, APP_CONFIG } from '@/constants/config';
import { useAuth } from '@/context/AuthContext';

export default function Assistance() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const isManager = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const viewText = isManager ? "Active Help Requests" : "Community Needs";

const handlePress = () => {
    // 1. If user is a manager or admin, route directly to the full log!
    if (isManager) {
      router.push('/Assistance/needs' as any);
      return;
    }

    // 2. If user is a resident, show the options popup
    Alert.alert(
      "Assistance", 
      "Please choose an option:", 
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Community Needs", 
          onPress: () => router.push('/Assistance/active-assistance' as any) 
        },
        { 
          text: "I need help", 
          style: "destructive", 
          onPress: confirmHelpRequest 
        }
      ]
    );
  };

  const confirmHelpRequest = () => {
    Alert.alert(
      "⚠️ Confirm Request",
      "Are you sure you want to ask for help? This will notify your neighbors and the manager.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "YES, SEND HELP", style: "destructive", onPress: submitHelpRequest }
      ]
    );
  };

  const submitHelpRequest = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/assistance`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to request assistance');

      setTimeout(() => {
        Alert.alert("Request Sent", "Your request is active. Your neighbors and managers have been notified.");
      }, 500);

    } catch (error) {
      console.error('Error triggering assistance:', error);
      Alert.alert('Error', 'Could not send request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Renders looking exactly like your other FeatureCards!
  return (
    <TouchableOpacity
      style={styles.featureCard}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={loading}
    >
      <View style={[styles.featureIconContainer, { backgroundColor: '#FEF2F2' }]}>
        {loading ? (
          <ActivityIndicator color="#DC2626" size="small" />
        ) : (
          <Ionicons name="people-circle" size={22} color="#DC2626" />
        )}
      </View>
      <Text style={styles.featureTitle}>Assistance</Text>
      <Text style={styles.featureSubtitle}>Community Help</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  featureCard: {
    width: "100%", // Takes up the full wrapper width provided by the index.tsx grid
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#94A3B8',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: { elevation: 2 },
      web: {
        boxShadow: "0 2px 8px rgba(148,163,184,0.12)",
      },
    }),
  },
  featureIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: '#1E293B',
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: "400",
  },
});