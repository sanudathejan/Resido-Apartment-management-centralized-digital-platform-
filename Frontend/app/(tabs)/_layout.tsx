/**
 * Tab Layout for Resiido
 * Modern 2026 light theme bottom tabs
 * Fixed for proper display on web + mobile
 */

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
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="announcements/index"
        options={{
          title: "Notifications",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons
                name={focused ? "notifications" : "notifications-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="parking/index"
        options={{
          title: "Parking",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons
                name={focused ? "car-sport" : "car-sport-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />


      <Tabs.Screen
        name="profile/index"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconContainer : undefined}>
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={22}
                color={color}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="parking2/index" // This must match your new file path
        options={{
          title: 'Parking 2', // This fixes the "parking2/i..." text
          tabBarLabel: 'Parking 2',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "car-sport" : "car-sport-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="payments/index" // Ensure your new file is in app/(tabs)/payments/index.tsx
        options={{
          title: 'Payments2',
          tabBarLabel: 'Payments2',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "wallet" : "wallet-outline"}
              size={24}
              color={color}
            />
          ),
        }}
      />


    </Tabs>
  );
}

const TAB_HEIGHT = Platform.select({ ios: 88, android: 68, web: 70, default: 68 });
const TAB_PADDING_BOTTOM = Platform.select({ ios: 28, android: 10, web: 10, default: 10 });

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: TAB_COLORS.background,
    borderTopWidth: 0,
    height: TAB_HEIGHT,
    paddingTop: 6,
    paddingBottom: TAB_PADDING_BOTTOM,
    ...Platform.select({
      web: {
        // Not absolute on web — let it flow in the normal layout
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
      },
      ios: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        shadowColor: '#94A3B8',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  tabBarItem: {
    paddingTop: 2,
  },
  activeIconContainer: {
    backgroundColor: TAB_COLORS.activeBg,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 6,
  },
});
