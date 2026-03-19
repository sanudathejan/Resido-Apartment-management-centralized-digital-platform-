/**
 * Home Dashboard Screen
 * Modern 2026 light theme - premium minimal UI
 * Supports both Resident and Manager views
 * Compact 2-column feature grid
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Alert,
  Switch,
  Platform,
  Image,
} from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { API_CONFIG, APP_CONFIG } from '@/constants/config';
import Assistance from '@/app/Assistance/Assistance';

const { width } = Dimensions.get("window");

// Design tokens
const COLORS = {
  background: '#D8F3DC',
  primary: "#2563EB",
  primaryLight: "#EFF6FF",
  sosRed: "#EF4444",
  sosRedDark: "#DC2626",
  textDark: "#1E293B",
  textLight: "#64748B",
  textMuted: "#94A3B8",
  white: "#FFFFFF",
  cardShadow: "#94A3B8",
  border: "#E2E8F0",
  green: "#10B981",
  avatarBg: "#DBEAFE",
};

type FeatureCard = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  route: string;
  iconColor: string;
  iconBg: string;
  cardBg?: string;
};

// Removed the 'SOS Alert' object from QUICK_ACTIONS
const QUICK_ACTIONS: FeatureCard[] = [
  {
    icon: "megaphone",
    title: "Announcements",
    subtitle: "Latest Updates",
    route: "/(tabs)/announcements",
    iconColor: "#DC2626",
    iconBg: "#FEF2F2",
  },
  {
    icon: "car-sport",
    title: "Parking",
    subtitle: "Manage Slots",
    route: "/(tabs)/parking",
    iconColor: "#2563EB",
    iconBg: "#EFF6FF",
  },
  {
    icon: "wallet",
    title: "Payments",
    subtitle: "Rent & Bills",
    route: "/(tabs)/payments",
    iconColor: "#059669",
    iconBg: "#ECFDF5",
  },
];

const SERVICES_ACTIONS: FeatureCard[] = [
  {
    icon: "fitness",
    title: "Facilities",
    subtitle: "Book Amenities",
    route: "/facilities",
    iconColor: "#7C3AED",
    iconBg: "#F5F3FF",
  },
  {
    icon: "construct",
    title: "Maintenance",
    subtitle: "Request Repairs",
    route: "/maintenance_requests",
    iconColor: "#EA580C",
    iconBg: "#FFF7ED",
  },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function HomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const [viewMode, setViewMode] = useState<"RESIDENT" | "MANAGER">(
    user?.role === "MANAGER" ? "MANAGER" : "RESIDENT",
  );

  const userName = user?.name || "John Resident";
  const apartmentNo = user?.apartmentNumber || "A-101";

  const apartmentName = user?.managedApartment?.name || "PrimeLux Residence";
  const apartmentLocation =
    user?.managedApartment?.location || "23/A, Bakers street, Colombo 7";
  const numberOfResidences = user?.managedApartment?.numberOfUnits || 64;

  // --- NEW: Check Pending Assistance Effect ---
  useEffect(() => {
    const checkPendingAssistance = async () => {
      try {
        const token = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
        if (!token) return;

        const response = await fetch(`${API_CONFIG.BASE_URL}/api/assistance/check-pending`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          if (data.hasPending) {
            Alert.alert(
              "Community Alert",
              "There might be residents who need your help.",
              [
                { text: "Dismiss", style: "cancel" },
                { text: "View Needs", onPress: () => router.push('/Assistance/active-assistance' as any) }
              ]
            );
          }
        }
      } catch (error) {
        console.error("Failed to check pending assistance:", error);
      }
    };

    // Trigger the check
    checkPendingAssistance();
  }, [router]); // Added router to dependency array to satisfy React linting rules

  const handleLogout = () => {
    if (Platform.OS === "web") {
      const confirmLogout = window.confirm("Are you sure you want to log out?");
      if (confirmLogout) {
        logout();
        router.replace("/welcome");
      }
    } else {
      Alert.alert("Log out", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log out",
          style: "destructive",
          onPress: () => {
            logout();
            router.replace("/welcome");
          },
        },
      ]);
    }
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "RESIDENT" ? "MANAGER" : "RESIDENT");
  };

  const renderCard = (card: FeatureCard) => (
    <TouchableOpacity
      key={card.title}
      style={[
        styles.featureCard,
        card.cardBg ? { backgroundColor: card.cardBg } : null,
      ]}
      onPress={() => router.push(card.route as any)}
      activeOpacity={0.7}
    >
      <View
        style={[styles.featureIconContainer, { backgroundColor: card.iconBg }]}
      >
        <Ionicons name={card.icon} size={22} color={card.iconColor} />
      </View>
      <Text style={styles.featureTitle}>{card.title}</Text>
      <Text style={styles.featureSubtitle}>{card.subtitle}</Text>
    </TouchableOpacity>
  );

  // Manager Dashboard View
  const ManagerDashboard = () => (
    <>
      {/* Manager Info Card */}
      <View style={styles.managerCard}>
        <View style={styles.managerCardHeader}>
          <Ionicons name="business" size={20} color={COLORS.primary} />
          <Text style={styles.managerCardTitle}>Building Overview</Text>
        </View>
        <View style={styles.managerStatRow}>
          <View style={styles.managerStat}>
            <Text style={styles.managerStatValue}>{numberOfResidences}</Text>
            <Text style={styles.managerStatLabel}>Units</Text>
          </View>
          <View style={styles.managerStatDivider} />
          <View style={styles.managerStat}>
            <Text style={styles.managerStatValue}>{apartmentName}</Text>
            <Text style={styles.managerStatLabel}>Property</Text>
          </View>
        </View>
        <Text style={styles.managerLocation}>
          <Ionicons
            name="location-outline"
            size={13}
            color={COLORS.textLight}
          />{" "}
          {apartmentLocation}
        </Text>
        <TouchableOpacity
          style={styles.dashboardLink}
          onPress={() => router.push("/manager-dashboard" as any)}
          activeOpacity={0.7}
        >
          <Text style={styles.dashboardLinkText}>Open Dashboard</Text>
          <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Put the Assistance Button prominently in the Manager Dashboard too */}
      <View style={styles.assistanceContainer}>
         <Assistance />
      </View>
    </>
  );

  const ResidentDashboard = () => (
    <>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.featureGrid}>
        {QUICK_ACTIONS.map(renderCard)}
        {/* We place the new AssistanceButton where the 4th card used to be */}
        <View style={styles.assistanceCardWrapper}>
            <Assistance />
        </View>
      </View>

      <View style={styles.separator} />

      <Text style={styles.sectionTitle}>Services</Text>
      <View style={styles.featureGrid}>{SERVICES_ACTIONS.map(renderCard)}</View>
    </>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.greeting}>{getGreeting()} 👋</Text>
              <Text style={styles.userName}>{userName}</Text>
              <View style={styles.apartmentBadge}>
                <Ionicons
                  name="home-outline"
                  size={13}
                  color={COLORS.primary}
                />
                <Text style={styles.apartmentText}>{apartmentNo}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => router.push("/(tabs)/profile")}
              activeOpacity={0.8}
            >
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {userName.charAt(0).toUpperCase()}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* View Mode Toggle */}
          {(user?.role === "MANAGER" || user?.role === "ADMIN") && (
            <View style={styles.viewModeToggle}>
              <Text
                style={[
                  styles.viewModeLabel,
                  viewMode === "RESIDENT" && styles.viewModeLabelActive,
                ]}
              >
                Resident
              </Text>
              <Switch
                value={viewMode === "MANAGER"}
                onValueChange={toggleViewMode}
                trackColor={{ false: COLORS.border, true: COLORS.primary }}
                thumbColor={COLORS.white}
                style={styles.viewModeSwitch}
              />
              <Text
                style={[
                  styles.viewModeLabel,
                  viewMode === "MANAGER" && styles.viewModeLabelActive,
                ]}
              >
                Manager
              </Text>
            </View>
          )}

          {/* Dashboard Content */}
          {viewMode === "RESIDENT" ? (
            <ResidentDashboard />
          ) : (
            <ManagerDashboard />
          )}

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <Ionicons
              name="log-out-outline"
              size={18}
              color={COLORS.textLight}
            />
            <Text style={styles.logoutText}>Log out</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: Platform.select({ ios: 120, android: 100, web: 30 }),
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 12,
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: COLORS.textLight,
    fontWeight: "500",
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textDark,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  apartmentBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: "flex-start",
    gap: 5,
  },
  apartmentText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.primary,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.avatarBg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
  },
  viewModeToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    alignSelf: "center",
    ...Platform.select({
      ios: {
        shadowColor: COLORS.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  viewModeLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: COLORS.textMuted,
    marginHorizontal: 8,
  },
  viewModeLabelActive: {
    color: COLORS.textDark,
    fontWeight: "700",
  },
  viewModeSwitch: {
    transform: [{ scaleX: 0.85 }, { scaleY: 0.85 }],
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  featureGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: "48%",
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.cardShadow,
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
    color: COLORS.textDark,
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 11,
    color: COLORS.textLight,
    fontWeight: "400",
  },
  // --- New styles for the Assistance Button Placement ---
  assistanceCardWrapper: {
    width: "48%",
    marginBottom: 12,
    // You can let the button fill this space naturally
  },
  assistanceContainer: {
     marginTop: 10,
     marginBottom: 20,
  },
  // ----------------------------------------------------
  managerCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.cardShadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 3 },
    }),
  },
  managerCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 14,
  },
  managerCardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textDark,
  },
  managerStatRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  managerStat: {
    flex: 1,
    alignItems: "center",
  },
  managerStatValue: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 2,
  },
  managerStatLabel: {
    fontSize: 12,
    color: COLORS.textLight,
  },
  managerStatDivider: {
    width: 1,
    height: 28,
    backgroundColor: COLORS.border,
    marginHorizontal: 10,
  },
  managerLocation: {
    fontSize: 13,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  dashboardLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  dashboardLinkText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.primary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },
  logoutText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textLight,
  },
  separator: {
    height: 3,
    backgroundColor: "#333333",
    marginVertical: 18,
    width: "100%",
  },
});