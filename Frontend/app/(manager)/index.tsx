/**
 * Manager Home Dashboard Screen
 * Modern 2026 light theme - premium minimal UI
 */

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  Platform,
  Image,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";

const { width } = Dimensions.get("window");

// Design tokens
const COLORS = {
  background: "#D8F3DC",
  primary: "#7C3AED",
  primaryLight: "#EFF6FF",
  textDark: "#1E293B",
  textLight: "#64748B",
  textMuted: "#94A3B8",
  sosRed: "#EF4444",
  sosRedDark: "#DC2626",
  white: "#FFFFFF",
  cardShadow: "#94A3B8",
  border: "#E2E8F0",
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

// 5 Placeholder Actions
const MANAGER_ACTIONS: FeatureCard[] = [
  {
    icon: "wallet",
    title: "Payments",
    subtitle: "Issue & Receive",
    route: "#",
    iconColor: "#059669",
    iconBg: "#ECFDF5",
  },
  {
    icon: "megaphone",
    title: "Announcements",
    subtitle: "Update Residents",
    route: "#",
    iconColor: "#DC2626",
    iconBg: "#FEF2F2",
  },
  {
    icon: "fitness",
    title: "Facilities",
    subtitle: "Reserve Amenities",
    route: "#",
    iconColor: "#7C3AED",
    iconBg: "#F5F3FF",
  },
  {
    icon: "construct",
    title: "Maintenance",
    subtitle: "Manage Repairs",
    route: "#",
    iconColor: "#EA580C",
    iconBg: "#FFF7ED",
  },
  {
    icon: "alert",
    title: "SOS Resolve",
    subtitle: "Emergency",
    route: "#",
    iconColor: COLORS.sosRedDark,
    iconBg: "#ffffff",
    cardBg: "#FECACA",
  },
];

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  return "Good Evening";
}

export default function ManagerHomeScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const userName = user?.name || "Manager Name";

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

  const renderCard = (card: FeatureCard, index: number) => (
    <TouchableOpacity
      key={index}
      style={[
        styles.featureCard,
        card.cardBg ? { backgroundColor: card.cardBg } : null,
      ]}
      onPress={() => console.log(`Navigating to ${card.route}`)}
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
            </View>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => router.push("/(manager)/profile" as any)}
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

          {/* Big Dashboard Button */}
          <TouchableOpacity
            style={styles.dashboardBigButton}
            activeOpacity={0.8}
            onPress={() => console.log("Navigate to Main Dashboard")}
          >
            <View style={styles.dashboardBtnContent}>
              <View style={styles.dashboardIconCircle}>
                <Ionicons name="pie-chart" size={24} color={COLORS.primary} />
              </View>
              <View style={styles.dashboardBtnTextWrap}>
                <Text style={styles.dashboardBtnTitle}>Dashboard</Text>
                <Text style={styles.dashboardBtnSub}>
                  View all details of residents
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.white} />
            </View>
          </TouchableOpacity>

          {/* Quick Actions Title */}
          <Text style={styles.sectionTitle}>Management Actions</Text>

          {/* Feature Grid */}
          <View style={styles.featureGrid}>
            {MANAGER_ACTIONS.map((card, index) => renderCard(card, index))}
          </View>

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
    paddingBottom: Platform.select({ ios: 40, android: 40, web: 30 }),
  },

  /* ── Header ──────────────────────────────────────────────────────── */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginTop: 12,
    marginBottom: 24,
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
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.primary,
  },

  /* ── Big Dashboard Button ────────────────────────────────────────── */
  dashboardBigButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 20,
    marginBottom: 28,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
      },
      android: { elevation: 6 },
    }),
  },
  dashboardBtnContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  dashboardIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  dashboardBtnTextWrap: {
    flex: 1,
  },
  dashboardBtnTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  dashboardBtnSub: {
    color: COLORS.primaryLight,
    fontSize: 13,
    opacity: 0.9,
  },

  /* ── Section Title & Grid ────────────────────────────────────────── */
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

  /* ── Logout Button ───────────────────────────────────────────────── */
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 20,
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
});
