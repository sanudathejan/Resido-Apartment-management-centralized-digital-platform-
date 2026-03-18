import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, APP_CONFIG } from '@/constants/config';
import { useRouter } from 'expo-router';

export default function SosButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 1. Initial Pop-up: Trigger or History?
  const handleSosPress = () => {
    Alert.alert(
      "🚨 Emergency SOS",
      "What would you like to do?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "View History", onPress: () => router.push('/') }, //Change this to sos-history
        { text: "Trigger SOS", style: "destructive", onPress: confirmSosTrigger }
      ]
    );
  };

  // 2. Confirmation Pop-up (Prevent accidental triggers)
  const confirmSosTrigger = () => {
    Alert.alert(
      "⚠️ CONFIRM SOS",
      "Are you sure you want to trigger an emergency alert? This will notify the manager and all residents on your floor.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "YES, SEND HELP", style: "destructive", onPress: executeSosApi }
      ]
    );
  };

  // 3. API Call to your Spring Boot Backend
  const executeSosApi = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/sos`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to trigger SOS');

      // The iOS Modal/Alert Bug fix (delaying the success alert slightly)
      setTimeout(() => {
        Alert.alert("SOS Triggered", "Help is on the way. Managers and neighbors have been notified.");
      }, 500);

    } catch (error) {
      console.error('Error triggering SOS:', error);
      Alert.alert('Error', 'Could not trigger SOS. Please call emergency services directly!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity 
      style={styles.sosButton} 
      onPress={handleSosPress}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color="#FFF" />
      ) : (
        <>
          <Ionicons name="alert-circle" size={28} color="#FFF" />
          <Text style={styles.sosText}>SOS</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444', // Danger Red
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    gap: 8,
    elevation: 5,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sosText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  }
});