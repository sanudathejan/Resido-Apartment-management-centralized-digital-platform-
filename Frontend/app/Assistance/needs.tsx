import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, APP_CONFIG } from '@/constants/config';
import { useAuth } from '@/context/AuthContext';

export default function NeedsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllRequests = async () => {
    try {
      const token = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      
      // Changed the endpoint to fetch ALL requests instead of just active
      // Make sure your backend has this endpoint logic mapped
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/assistance`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Sort newest first
        const sortedData = data.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setRequests(sortedData);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllRequests();
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
        // Update the item status locally instead of removing it
        setRequests(prev => prev.map(req => 
          req.id === id ? { ...req, status: 'RESOLVED' } : req
        ));
      } else {
        Alert.alert("Error", "You do not have permission to resolve this.");
      }
    } catch (error) {
      console.error("Error resolving request:", error);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const isActive = item.status === 'ACTIVE';
    const canResolve = isActive && (user?.role === 'MANAGER' || user?.role === 'ADMIN' || user?.id === item.resident?.id);
    
    const date = new Date(item.timestamp);
    const dateString = date.toLocaleDateString();
    const timeString = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={[styles.card, !isActive && styles.cardResolved]}>
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <View style={[styles.avatar, !isActive && { backgroundColor: '#F1F5F9' }]}>
              <Text style={[styles.avatarText, !isActive && { color: '#64748B' }]}>
                {item.resident?.name?.charAt(0) || '?'}
              </Text>
            </View>
            <View>
              <Text style={[styles.name, !isActive && { color: '#64748B' }]}>{item.resident?.name}</Text>
              <Text style={styles.apartment}>Apt: {item.resident?.requestedHouseNumber}</Text>
            </View>
          </View>
          
          <View style={styles.timeContainer}>
            <View style={[styles.statusBadge, isActive ? styles.badgeActive : styles.badgeResolved]}>
               <Text style={[styles.statusText, isActive ? styles.textActive : styles.textResolved]}>
                 {isActive ? 'ACTIVE' : 'RESOLVED'}
               </Text>
            </View>
            <Text style={styles.time}>{dateString} {timeString}</Text>
          </View>
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
        <Text style={styles.headerTitle}>Community Needs</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#7C3AED" style={styles.loader} />
      ) : requests.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-done-circle" size={64} color="#10B981" />
          <Text style={styles.emptyText}>No assistance requests!</Text>
          <Text style={styles.emptySubText}>The community log is empty.</Text>
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
  cardResolved: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowOpacity: 0,
    elevation: 0,
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
    backgroundColor: '#F5F3FF', // Light purple for Manager theme
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '700', color: '#7C3AED' },
  name: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  apartment: { fontSize: 13, color: '#64748B', marginTop: 2 },
  timeContainer: { alignItems: 'flex-end', gap: 6 },
  time: { fontSize: 11, color: '#94A3B8', fontWeight: '500' },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    letterSpacing: 0.5,
  },
  badgeActive: { backgroundColor: '#FEE2E2' },
  badgeResolved: { backgroundColor: '#ECFDF5' },
  textActive: { fontSize: 10, fontWeight: '800', color: '#DC2626' },
  textResolved: { fontSize: 10, fontWeight: '800', color: '#059669' },
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