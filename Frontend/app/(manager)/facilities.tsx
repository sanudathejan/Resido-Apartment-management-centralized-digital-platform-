import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiService } from "@/services/api";

const COLORS = {
  background: '#D8F3DC', primary: "#7C3AED", white: "#FFFFFF",
  textDark: "#1E293B", textLight: "#64748B", border: "#E2E8F0",
  success: "#10B981", successBg: "#D1FAE5",
  warning: "#F59E0B", warningBg: "#FEF3C7",
  error: "#EF4444", errorBg: "#FEE2E2",
};

export default function ManagerFacilitiesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"PENDING" | "HISTORY">("PENDING");
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const endpoint = activeTab === "PENDING" ? "/api/common-area/pending" : "/api/common-area/all";
      const data = (await apiService.get(endpoint)) as any[];
      
      // Sort newest start time first
      const sortedData = data.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      setBookings(sortedData);
    } catch (error) {
      console.error("Error fetching manager bookings:", error);
      Alert.alert("Error", "Could not load bookings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = (id: number, status: "APPROVED" | "REJECTED") => {
    Alert.alert(
      `${status === "APPROVED" ? "Approve" : "Reject"} Request`,
      `Are you sure you want to ${status.toLowerCase()} this booking?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          style: status === "REJECTED" ? "destructive" : "default",
          onPress: async () => {
            try {
              await apiService.put(`/api/common-area/request/${id}?status=${status}`, {});
              
              // If we are on the pending tab, remove it from the list
              if (activeTab === "PENDING") {
                setBookings((prev) => prev.filter((b) => b.id !== id));
              } else {
                // If on history tab, update the status badge locally
                setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b));
              }
              
              Alert.alert("Success", `Booking has been ${status.toLowerCase()}.`);
            } catch (error) {
              Alert.alert("Error", "Failed to update booking status.");
            }
          }
        }
      ]
    );
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const formatTime = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "APPROVED": return { color: COLORS.success, bg: COLORS.successBg };
      case "REJECTED": return { color: COLORS.error, bg: COLORS.errorBg };
      case "PENDING": default: return { color: COLORS.warning, bg: COLORS.warningBg };
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const statusStyle = getStatusStyles(item.status);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.areaName}>{item.areaName}</Text>
            {/* Display the Resident's name if it exists from the backend relation */}
            <Text style={styles.residentName}>
              <Ionicons name="person-outline" size={14} /> {item.resident?.name || "Unknown Resident"}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.color }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.timeRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.timeText}>{formatDate(item.startTime)}</Text>
        </View>
        
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={16} color={COLORS.textLight} />
          <Text style={styles.timeText}>
            {formatTime(item.startTime)} - {formatTime(item.endTime)}
          </Text>
        </View>

        {/* Action Buttons: Only show them if the status is PENDING */}
        {item.status === "PENDING" && (
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, styles.rejectBtn]} 
              onPress={() => handleUpdateStatus(item.id, "REJECTED")}
            >
              <Ionicons name="close-circle-outline" size={20} color={COLORS.error} style={{ marginRight: 4 }} />
              <Text style={styles.rejectBtnText}>Reject</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionBtn, styles.approveBtn]} 
              onPress={() => handleUpdateStatus(item.id, "APPROVED")}
            >
              <Ionicons name="checkmark-circle-outline" size={20} color={COLORS.white} style={{ marginRight: 4 }} />
              <Text style={styles.approveBtnText}>Approve</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.title}>Manage Facilities</Text>
      </View>

      {/* Custom Tab Toggle */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "PENDING" && styles.activeTab]} 
          onPress={() => setActiveTab("PENDING")}
        >
          <Text style={[styles.tabText, activeTab === "PENDING" && styles.activeTabText]}>Pending Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === "HISTORY" && styles.activeTab]} 
          onPress={() => setActiveTab("HISTORY")}
        >
          <Text style={[styles.tabText, activeTab === "HISTORY" && styles.activeTabText]}>All History</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          renderItem={renderItem}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              {activeTab === "PENDING" ? "No pending booking requests right now!" : "No booking history found."}
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 24, paddingBottom: 16, flexDirection: "row", alignItems: "center" },
  backBtn: { marginRight: 16 },
  title: { fontSize: 24, fontWeight: "700", color: COLORS.textDark },
  
  tabContainer: { flexDirection: "row", marginHorizontal: 24, backgroundColor: COLORS.border, padding: 4, borderRadius: 12, marginBottom: 8 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: COLORS.white, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: "600", color: COLORS.textLight },
  activeTabText: { color: COLORS.primary },

  listContainer: { padding: 24, gap: 16 },
  card: { backgroundColor: COLORS.white, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  areaName: { fontSize: 18, fontWeight: "700", color: COLORS.textDark, marginBottom: 4 },
  residentName: { fontSize: 14, color: COLORS.textLight, fontWeight: "500" },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  divider: { height: 1, backgroundColor: COLORS.border, marginBottom: 12 },
  timeRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  timeText: { marginLeft: 8, fontSize: 15, color: COLORS.textDark },
  
  actionRow: { flexDirection: "row", marginTop: 16, gap: 12 },
  actionBtn: { flex: 1, flexDirection: "row", paddingVertical: 12, borderRadius: 12, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  rejectBtn: { backgroundColor: COLORS.white, borderColor: COLORS.error },
  rejectBtnText: { color: COLORS.error, fontWeight: "600", fontSize: 15 },
  approveBtn: { backgroundColor: COLORS.success, borderColor: COLORS.success },
  approveBtnText: { color: COLORS.white, fontWeight: "600", fontSize: 15 },
  
  emptyText: { textAlign: "center", color: COLORS.textLight, marginTop: 40, fontSize: 16 }
});