import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { API_CONFIG, APP_CONFIG } from "../../constants/config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

interface ResidentSummary {
  userId: number;
  name: string;
  email: string;
  houseNumber: string;
  parkingSlot: string;
  activeMaintenanceRequests: number;
  pendingParkingRequests: number;
  totalSosAlerts: number;
  activeCommonAreaBookings: number;
}

export default function ManagerDashboard() {
  const router = useRouter();
  const [residents, setResidents] = useState<ResidentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchResidents = async () => {
    try {
      // 2. Grab the Auth Token from storage
      const token = await AsyncStorage.getItem(
        APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      );

      if (!token) {
        console.error("No auth token found!");
        setIsLoading(false);
        setIsRefreshing(false);
        return;
      }

      // 3. Use your config for the URL
      // (If you didn't add it to ENDPOINTS, you can just use `${API_CONFIG.BASE_URL}/api/manager/residents`)
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MANAGER_RESIDENTS}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Pass the token!
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch residents: ${response.status}`);
      }

      const data = await response.json();
      setResidents(data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchResidents();
  }, []);

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchResidents();
  };

  // The UI for a single Resident Card
  const renderResidentCard = ({ item }: { item: ResidentSummary }) => (
    <View style={styles.card}>
      {/* Header: Name & Email */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.nameText}>{item.name}</Text>
          <Text style={styles.emailText}>{item.email}</Text>
        </View>
      </View>

      {/* Info Row: House & Parking */}
      <View style={styles.infoRow}>
        <View style={styles.badge}>
          <Ionicons name="home" size={14} color="#475569" />
          <Text style={styles.badgeText}>House: {item.houseNumber}</Text>
        </View>
        <View style={styles.badge}>
          <Ionicons name="car" size={14} color="#475569" />
          <Text style={styles.badgeText}>Slot: {item.parkingSlot}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>
            {item.activeMaintenanceRequests}
          </Text>
          <Text style={styles.statLabel}>Maint.</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{item.pendingParkingRequests}</Text>
          <Text style={styles.statLabel}>Parking</Text>
        </View>
        <View style={styles.statBox}>
          <Text
            style={[
              styles.statNumber,
              item.totalSosAlerts > 0 && { color: "#EF4444" },
            ]}
          >
            {item.totalSosAlerts}
          </Text>
          <Text style={styles.statLabel}>SOS</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statNumber}>{item.activeCommonAreaBookings}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
      </View>
    </View>
  );

return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Resident Dashboard</Text>
      </View>

      {/* Main Content */}
      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#1D4ED8" />
        </View>
      ) : (
        <FlatList
          data={residents}
          keyExtractor={(item) => item.userId.toString()}
          renderItem={renderResidentCard}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={onRefresh}
              colors={["#1D4ED8"]}
            />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No residents found.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#1E293B" },
  listContainer: { padding: 16 },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  nameText: { fontSize: 18, fontWeight: "bold", color: "#0F172A" },
  emailText: { fontSize: 14, color: "#64748B", marginTop: 2 },
  infoRow: { flexDirection: "row", gap: 8, marginBottom: 16 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    color: "#475569",
    marginLeft: 4,
    fontWeight: "500",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    paddingTop: 12,
  },
  statBox: { alignItems: "center", flex: 1 },
  statNumber: { fontSize: 16, fontWeight: "bold", color: "#1D4ED8" },
  statLabel: { fontSize: 11, color: "#64748B", marginTop: 4 },
  emptyText: { textAlign: "center", color: "#64748B", marginTop: 40 },
});
