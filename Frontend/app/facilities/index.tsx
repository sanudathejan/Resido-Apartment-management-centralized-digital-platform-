import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, Href } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  background: "#F4F7FB", primary: "#2563EB", white: "#FFFFFF",
  textDark: "#1E293B", textLight: "#64748B", border: "#E2E8F0",
};

const FACILITIES = [
  { name: "Rooftop", icon: "partly-sunny-outline" },
  { name: "Swimming Pool", icon: "water-outline" },
  { name: "Fitness Center", icon: "barbell-outline" },
  { name: "Party hall", icon: "musical-notes-outline" },
  { name: "BBQ area", icon: "flame-outline" },
];

export default function FacilitiesScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Back Button to go to Home */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.title}>Book a Facility</Text>
        <Text style={styles.subtitle}>Select a common area to reserve</Text>
      </View>

      <ScrollView contentContainerStyle={styles.listContainer}>
        {FACILITIES.map((facility, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => router.push(`/facilities/book?area=${facility.name}` as any)}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={facility.icon as any} size={28} color={COLORS.primary} />
            </View>
            <Text style={styles.cardTitle}>{facility.name}</Text>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.historyBtn} 
          onPress={() => router.push("/facilities/my-bookings" as any)}
        >
          <Ionicons name="calendar-outline" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
          <Text style={styles.historyBtnText}>See My Bookings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: 24, paddingBottom: 16 },
  backBtn: { marginBottom: 16 },
  title: { fontSize: 28, fontWeight: "700", color: COLORS.textDark, marginBottom: 4 },
  subtitle: { fontSize: 16, color: COLORS.textLight },
  listContainer: { paddingHorizontal: 24, paddingBottom: 100, gap: 16 }, // Added paddingBottom so it doesn't hide behind footer
  card: { flexDirection: "row", alignItems: "center", backgroundColor: COLORS.white, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border },
  iconContainer: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#EFF6FF", alignItems: "center", justifyContent: "center", marginRight: 16 },
  cardTitle: { flex: 1, fontSize: 18, fontWeight: "600", color: COLORS.textDark },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: COLORS.white, borderTopWidth: 1, borderColor: COLORS.border },
  historyBtn: { flexDirection: "row", backgroundColor: "#EFF6FF", paddingVertical: 16, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#BFDBFE" },
  historyBtnText: { color: COLORS.primary, fontSize: 16, fontWeight: "700" }
});