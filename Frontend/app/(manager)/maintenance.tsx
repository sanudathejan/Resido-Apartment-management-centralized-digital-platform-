import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert, Image } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiService } from "@/services/api";

const COLORS = {
  background: '#D8F3DC', primary: "#2563EB", white: "#FFFFFF",
  textDark: "#1E293B", textLight: "#64748B", border: "#E2E8F0",
  success: "#10B981", warning: "#F59E0B",
};

export default function ManagerMaintenanceScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"PENDING" | "ALL">("PENDING");
  const [allRequests, setAllRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = (await apiService.get("/api/maintenance")) as any[];
      setAllRequests(data.sort((a, b) => b.id - a.id));
    } catch (error) {
      Alert.alert("Error", "Could not load maintenance requests.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      // Note: Your backend expects the raw string as the body for this endpoint
      await apiService.put(`/api/maintenance/${id}/status`, newStatus);
      
      // Update local state so it vanishes from pending
      setAllRequests(prev => prev.map(req => req.id === id ? { ...req, status: newStatus } : req));
      Alert.alert("Success", `Marked as ${newStatus}`);
    } catch (error) {
      Alert.alert("Error", "Could not update status.");
    }
  };

  // Filter requests based on the active tab
  const displayedRequests = allRequests.filter(req => 
    activeTab === "PENDING" ? req.status === "PENDING" : true
  );

  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.residentName}>
            <Ionicons name="person-outline" size={14} /> {item.resident?.name || "Unknown Resident"}
          </Text>
        </View>
        <Text style={[styles.statusText, { color: item.status === "PENDING" ? COLORS.warning : COLORS.success }]}>
          {item.status}
        </Text>
      </View>

      <Text style={styles.cardDesc}>{item.description}</Text>

      {item.imageBase64 && (
        <Image source={{ uri: `data:image/jpeg;base64,${item.imageBase64}` }} style={styles.cardImage} />
      )}

      {item.status === "PENDING" && (
        <View style={styles.actionRow}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: COLORS.success }]} 
            onPress={() => handleUpdateStatus(item.id, "RESOLVED")}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} style={{ marginRight: 8 }} />
            <Text style={styles.actionBtnText}>Mark Resolved</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Manage Maintenance</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === "PENDING" && styles.activeTab]} onPress={() => setActiveTab("PENDING")}>
          <Text style={[styles.tabText, activeTab === "PENDING" && styles.activeTabText]}>Pending</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === "ALL" && styles.activeTab]} onPress={() => setActiveTab("ALL")}>
          <Text style={[styles.tabText, activeTab === "ALL" && styles.activeTabText]}>All Requests</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={displayedRequests}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={renderItem}
          ListEmptyComponent={<Text style={styles.emptyText}>No requests found.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 24, paddingBottom: 16, flexDirection: "row", alignItems: "center" },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: COLORS.textDark },
  tabContainer: { flexDirection: "row", marginHorizontal: 24, backgroundColor: COLORS.border, padding: 4, borderRadius: 12, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: COLORS.white, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: "600", color: COLORS.textLight },
  activeTabText: { color: COLORS.primary },
  listContainer: { padding: 24, gap: 16 },
  card: { backgroundColor: COLORS.white, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12, alignItems: "flex-start" },
  cardTitle: { fontSize: 18, fontWeight: "700", color: COLORS.textDark, marginBottom: 4 },
  residentName: { fontSize: 14, color: COLORS.textLight, fontWeight: "500" },
  statusText: { fontSize: 14, fontWeight: "700", marginLeft: 8, marginTop: 2 },
  cardDesc: { color: COLORS.textDark, fontSize: 15, marginBottom: 12, lineHeight: 22 },
  cardImage: { width: "100%", height: 180, borderRadius: 8, marginBottom: 12 },
  actionRow: { marginTop: 8, borderTopWidth: 1, borderColor: COLORS.border, paddingTop: 16 },
  actionBtn: { flexDirection: "row", paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  actionBtnText: { color: COLORS.white, fontWeight: "600", fontSize: 15 },
  emptyText: { textAlign: "center", color: COLORS.textLight, marginTop: 40, fontSize: 16 }
});