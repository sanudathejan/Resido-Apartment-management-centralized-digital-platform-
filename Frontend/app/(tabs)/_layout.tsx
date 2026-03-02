import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Platform, StyleSheet, View } from "react-native";

const TAB_COLORS = {
  active: '#2563EB',
  inactive: '#94A3B8',
  background: '#FFFFFF',
  activeBg: '#EFF6FF',
};

export default function TabLayout() {
  /** * CHANGE THIS TO TEST:
   * true  -> Parking, Parking 2, Payments DISAPPEAR (Manager View)
   * false -> Parking, Parking 2, Payments APPEAR (Resident View)
   */
  const isManager = true;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: TAB_COLORS.active,
        tabBarInactiveTintColor: TAB_COLORS.inactive,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}
    >
      {/* 1. HOME - Always Visible */}
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={focused ? "home" : "home-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* 2. NOTIFICATIONS - Always Visible */}
      <Tabs.Screen
        name="announcements/index"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={focused ? "notifications" : "notifications-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* 3. PARKING - Hides if Manager */}
      <Tabs.Screen
        name="parking/index"
        options={{
          title: "Parking",
          href: isManager ? null : "/parking",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={focused ? "car-sport" : "car-sport-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* 4. PAYMENTS - Hides if Manager */}
      <Tabs.Screen
        name="payments/index"
        options={{
          title: "Payments",
          href: isManager ? null : "/payments",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={focused ? "wallet" : "wallet-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* 5. PARKING 2 - Hides if Manager */}
      <Tabs.Screen
        name="parking2/index"
        options={{
          title: "Parking 2",
          href: isManager ? null : "/parking2",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={focused ? "car" : "car-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />

      {/* 6. PROFILE - Always Visible */}
      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: TAB_COLORS.background,
    borderTopWidth: 0,
    height: Platform.OS === "ios" ? 88 : 68,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: { shadowColor: '#94A3B8', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.08, shadowRadius: 16 },
      android: { elevation: 12 },
    }),
  },
  tabBarLabel: { fontSize: 11, fontWeight: "600", marginTop: 2 },
  tabBarItem: { paddingTop: 2 },
  activeIconContainer: { backgroundColor: TAB_COLORS.activeBg, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 6 },
});