import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, APP_CONFIG } from '@/constants/config';
import { useAuth } from '@/context/AuthContext';

export default function ActiveAssistanceScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActiveRequests = async () => {
    try {
      const token = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/assistance/active`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveRequests();
  }, []);

  const handleResolve = (id: number) => {
    Alert.alert("Resolve Request", "Are you sure this need has been met?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Resolve", 
        style: "default", 
        onPress: () => submitResolve(id) 
      }
    ]);
  };

  const submitResolve = async (id: number) => {
    try {
      const token = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/assistance/${id}/resolve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        // Remove it from the local list
        setRequests(prev => prev.filter(req => req.id !== id));
      } else {
        Alert.alert("Error", "You do not have permission to resolve this.");
      }
    } catch (error) {
      console.error("Error resolving request:", error);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    // Check if current user is manager OR the owner of the request
    const canResolve = user?.role === 'MANAGER' || user?.role === 'ADMIN' || user?.id === item.resident?.id;
    
    // Format the date nicely
    const date = new Date(item.timestamp);
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{item.resident?.name?.charAt(0) || '?'}</Text>
            </View>
            <View>
              <Text style={styles.name}>{item.resident?.name}</Text>
              <Text style={styles.apartment}>Apt: {item.resident?.requestedHouseNumber}</Text>
            </View>
          </View>
          <Text style={styles.time}>{timeString}</Text>
        </View>

        {canResolve && (
          <TouchableOpacity 
            style={styles.resolveButton} 
            onPress={() => handleResolve(item.id)}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
            <Text style={styles.resolveText}>Mark as Resolved</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Active Needs</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={styles.loader} />
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-done-circle" size={64} color="#10B981" />
          <Text style={styles.emptyText}>No active assistance requests!</Text>
          <Text style={styles.emptySubText}>Your community is doing great.</Text>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D8F3DC' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backBtn: { padding: 4, marginLeft: -4 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B' },
  loader: { marginTop: 40 },
  list: { padding: 20 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#2563EB' },
  name: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  apartment: { fontSize: 13, color: '#64748B', marginTop: 2 },
  time: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  resolveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  resolveText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginTop: 16, textAlign: 'center' },
  emptySubText: { fontSize: 14, color: '#64748B', marginTop: 8, textAlign: 'center' },
});