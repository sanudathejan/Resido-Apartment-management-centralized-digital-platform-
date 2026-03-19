import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiService } from "@/services/api";

const COLORS = {
  background: "#F4F7FB", primary: "#2563EB", white: "#FFFFFF",
  textDark: "#1E293B", textLight: "#64748B", border: "#E2E8F0",
  success: "#10B981", successBg: "#D1FAE5",
  warning: "#F59E0B", warningBg: "#FEF3C7",
  error: "#EF4444", errorBg: "#FEE2E2",
};

export default function MyBookingsScreen() {
  const router = useRouter();
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  const fetchMyBookings = async () => {
    setIsLoading(true);
    try {
      const data = (await apiService.get("/api/common-area/my-bookings")) as any[];
      // Sort newest first
      const sortedData = data.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      setBookings(sortedData);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      Alert.alert("Error", "Could not load your bookings.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (id: number) => {
    Alert.alert("Cancel Booking", "Are you sure you want to cancel this booking?", [
      { text: "No", style: "cancel" },
      { 
        text: "Yes, Cancel", 
        style: "destructive",
        onPress: async () => {
          try {
            await apiService.delete(`/api/common-area/${id}`);
            // Remove from UI
            setBookings((prev) => prev.filter(b => b.id !== id));
            Alert.alert("Cancelled", "Your booking has been removed.");
          } catch (error) {
            Alert.alert("Error", "Could not cancel booking.");
          }
        }
      }
    ]);
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
          <Text style={styles.areaName}>{item.areaName}</Text>
          <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
            <Text style={[styles.badgeText, { color: statusStyle.color }]}>{item.status}</Text>
          </View>
        </View>

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

        {/* Only show Cancel button if it's not already rejected/past (Optional logic, currently shows for all) */}
        {item.status !== "REJECTED" && (
          <TouchableOpacity style={styles.cancelBtn} onPress={() => handleCancel(item.id)}>
            <Text style={styles.cancelBtnText}>Cancel Booking</Text>
          </TouchableOpacity>
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
        <Text style={styles.title}>My Bookings</Text>
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
            <Text style={styles.emptyText}>You haven't made any bookings yet.</Text>
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
  listContainer: { padding: 24, paddingTop: 8, gap: 16 },
  card: { backgroundColor: COLORS.white, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  areaName: { fontSize: 18, fontWeight: "700", color: COLORS.textDark },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: "700" },
  timeRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  timeText: { marginLeft: 8, fontSize: 15, color: COLORS.textDark },
  cancelBtn: { marginTop: 12, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.errorBg, alignItems: "center" },
  cancelBtnText: { color: COLORS.error, fontWeight: "600" },
  emptyText: { textAlign: "center", color: COLORS.textLight, marginTop: 40, fontSize: 16 }
});