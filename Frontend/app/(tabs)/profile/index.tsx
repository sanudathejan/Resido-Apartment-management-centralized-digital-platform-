/**
 * Profile Screen
 * User profile and account management — 2026 light theme
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

/* ── design tokens ─────────────────────────────────────────────── */
const C = {
  bg: '#A9A9A9',
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  avatarBg: '#DBEAFE',
  white: '#FFFFFF',
  textDark: '#1E293B',
  textLight: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  success: '#10B981',
  error: '#EF4444',
} as const;

/* ── platform shadow helper ────────────────────────────────────── */
const shadow = (elevation: number) =>
  Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: 0.08,
      shadowRadius: elevation,
    },
    android: {
      elevation,
    },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: 0.08,
      shadowRadius: elevation,
    },
  }) as object;

/* ── component ─────────────────────────────────────────────────── */
export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/welcome');
          },
        },
      ]
    );
  };

  const userName = user?.name || 'John Doe';
  const userEmail = user?.email || 'john.doe@email.com';
  const apartmentNo = user?.apartmentNumber || 'A-101';
  const userRole = user?.role || 'RESIDENT';
  const initial = userName.charAt(0).toUpperCase();

  /* ── menu data ─────────────────────────────────────────────── */
  const menuItems = [
    {
      section: 'Account',
      items: [
        {
          icon: 'person-outline' as const,
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          onPress: () => {},
        },
        {
          icon: 'lock-closed-outline' as const,
          title: 'Change Password',
          subtitle: 'Update your password',
          onPress: () => {},
        },
        {
          icon: 'shield-checkmark-outline' as const,
          title: 'Privacy & Security',
          subtitle: 'Manage your privacy settings',
          onPress: () => {},
        },
      ],
    },
    {
      section: 'Preferences',
      items: [
        {
          icon: 'notifications-outline' as const,
          title: 'Notifications',
          subtitle: 'Manage notification preferences',
          toggle: true,
          value: notificationsEnabled,
          onToggle: setNotificationsEnabled,
        },
        {
          icon: 'moon-outline' as const,
          title: 'Dark Mode',
          subtitle: 'Toggle dark theme',
          toggle: true,
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          icon: 'language-outline' as const,
          title: 'Language',
          subtitle: 'English (US)',
          onPress: () => {},
        },
      ],
    },
    {
      section: 'Support',
      items: [
        {
          icon: 'help-circle-outline' as const,
          title: 'Help Center',
          subtitle: 'Get help with the app',
          onPress: () => {},
        },
        {
          icon: 'chatbubble-outline' as const,
          title: 'Contact Support',
          subtitle: 'Reach out to our team',
          onPress: () => {},
        },
        {
          icon: 'document-text-outline' as const,
          title: 'Terms & Conditions',
          subtitle: 'Read our terms of service',
          onPress: () => {},
        },
        {
          icon: 'information-circle-outline' as const,
          title: 'About Resido',
          subtitle: 'Version 1.0.0',
          onPress: () => {},
        },
      ],
    },
  ];

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* ── flat header ─────────────────────────────────────── */}
      <View style={styles.header}>
        {/* avatar circle */}
        <View style={styles.avatarOuter}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <TouchableOpacity style={styles.cameraBtn} activeOpacity={0.7}>
            <Ionicons name="camera" size={14} color={C.white} />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{userEmail}</Text>

        {/* info pills */}
        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <Ionicons name="home-outline" size={13} color={C.primary} />
            <Text style={styles.pillText}>Apt {apartmentNo}</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="person-outline" size={13} color={C.primary} />
            <Text style={styles.pillText}>{userRole}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── quick stats card (overlapping header) ──────── */}
        <View style={[styles.statsCard, shadow(6)]}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Payments</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Requests</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Visitors</Text>
          </View>
        </View>

        {/* ── menu sections ──────────────────────────────── */}
        {menuItems.map((section, sectionIdx) => (
          <View key={sectionIdx} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.section}</Text>

            <View style={[styles.menuCard, shadow(4)]}>
              {section.items.map((item, itemIdx) => {
                const isLast = itemIdx === section.items.length - 1;

                return (
                  <TouchableOpacity
                    key={itemIdx}
                    style={[styles.menuItem, !isLast && styles.menuItemBorder]}
                    onPress={item.onPress}
                    disabled={!!item.toggle}
                    activeOpacity={0.6}
                  >
                    {/* icon circle */}
                    <View style={styles.menuIconCircle}>
                      <Ionicons
                        name={item.icon as keyof typeof Ionicons.glyphMap}
                        size={20}
                        color={C.primary}
                      />
                    </View>

                    {/* text */}
                    <View style={styles.menuTextBlock}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    </View>

                    {/* right control */}
                    {item.toggle ? (
                      <Switch
                        value={item.value}
                        onValueChange={item.onToggle}
                        trackColor={{ false: C.border, true: '#93BBFD' }}
                        thumbColor={item.value ? C.primary : C.textMuted}
                        ios_backgroundColor={C.border}
                      />
                    ) : (
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color={C.textMuted}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* ── logout button ──────────────────────────────── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.65}
        >
          <Ionicons name="log-out-outline" size={20} color={C.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* ── footer credit ──────────────────────────────── */}
        <Text style={styles.footerText}>
          SDGP Project{'\n'}University of Westminster
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ── styles ────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  /* layout */
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  /* ── header ─────────────────────────────────────────────────── */
  header: {
    backgroundColor: C.bg,
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },

  /* avatar */
  avatarOuter: {
    position: 'relative',
    marginBottom: 14,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#DBEAFE',
    borderWidth: 3,
    borderColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 34,
    fontWeight: '700',
    color: C.primary,
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: C.bg,
  },

  /* name / email */
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: C.textLight,
    marginBottom: 14,
  },

  /* pills */
  pillRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: C.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: C.primary,
    textTransform: 'capitalize',
  },

  /* ── stats card ─────────────────────────────────────────────── */
  statsCard: {
    flexDirection: 'row',
    backgroundColor: C.white,
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 12,
    marginTop: -20,
    marginBottom: 24,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: C.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: C.textLight,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    backgroundColor: C.border,
    marginVertical: 2,
  },

  /* ── menu sections ──────────────────────────────────────────── */
  menuSection: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextBlock: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textDark,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: C.textLight,
  },

  /* ── logout ─────────────────────────────────────────────────── */
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.error,
    marginTop: 8,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: C.error,
  },

  /* ── footer ─────────────────────────────────────────────────── */
  footerText: {
    textAlign: 'center',
    fontSize: 12,
    color: C.textMuted,
    lineHeight: 18,
    marginBottom: 20,
  },
});
