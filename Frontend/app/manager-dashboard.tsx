/**
 * Manager Dashboard Screen
 * Detailed statistics and management overview for apartment managers
 * Modern light theme - 2026 design system
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

/** Local design-system color tokens */
const C = {
  background: '#D8F3DC',
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  white: '#FFFFFF',
  textDark: '#1E293B',
  textLight: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
} as const;

/** Per-stat accent palette keyed by stat id */
const STAT_ACCENT: Record<string, { icon: string; bg: string }> = {
  residents:   { icon: '#2563EB', bg: '#EFF6FF' },
  parking:     { icon: '#7C3AED', bg: '#F5F3FF' },
};

/** Cross-platform shadow helper */
const softShadow = Platform.select({
  ios: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  android: {
    elevation: 3,
  },
  default: {},
}) as Record<string, unknown>;

const cardShadow = Platform.select({
  ios: {
    shadowColor: '#64748B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  android: {
    elevation: 4,
  },
  default: {},
}) as Record<string, unknown>;

interface DashboardStat {
  id: string;
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtitle?: string;
}

export default function ManagerDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStat[]>([]);

  // Mock stats data
  const mockStats: DashboardStat[] = [
    {
      id: 'residents',
      title: 'Total Residents',
      value: 128,
      icon: 'people',
      color: '#2563EB',
      subtitle: '64 units occupied',
    },
    {
      id: 'parking',
      title: 'Available Parking',
      value: '15/80',
      icon: 'car',
      color: '#7C3AED',
      subtitle: '15 slots free',
    },
  ];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    // Simulate API call
    setStats(mockStats);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ stat }: { stat: DashboardStat }) => {
    const accent = STAT_ACCENT[stat.id] ?? { icon: C.primary, bg: C.primaryLight };

    return (
      <TouchableOpacity style={styles.statCard} activeOpacity={0.8}>
        <View style={[styles.statIconContainer, { backgroundColor: accent.bg }]}>
          <Ionicons name={stat.icon as any} size={24} color={accent.icon} />
        </View>
        <Text style={styles.statValue}>{stat.value}</Text>
        <Text style={styles.statTitle}>{stat.title}</Text>
        {stat.subtitle && (
          <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
        )}
      </TouchableOpacity>
    );
  };

  const QuickAction = ({
    icon,
    title,
    onPress,
    iconColor = C.primary,
    iconBg = C.primaryLight,
  }: {
    icon: string;
    title: string;
    onPress: () => void;
    iconColor?: string;
    iconBg?: string;
  }) => (
    <TouchableOpacity
      style={styles.quickAction}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={22} color={iconColor} />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={22} color={C.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manager Dashboard</Text>
          <TouchableOpacity style={styles.headerAction}>
            <Ionicons name="notifications-outline" size={22} color={C.textDark} />
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={C.primary}
              colors={[C.primary]}
            />
          }
        >
          {/* Apartment Info Banner */}
          <View style={styles.apartmentBanner}>
            <View style={styles.apartmentBannerRow}>
              <View style={styles.apartmentLocationIcon}>
                <Ionicons name="location" size={20} color={C.primary} />
              </View>
              <View style={styles.apartmentInfo}>
                <Text style={styles.apartmentName}>
                  {user?.managedApartment?.name || 'PrimeLux Residence'}
                </Text>
                <Text style={styles.apartmentLocation}>
                  {user?.managedApartment?.location || '23/A, Bakers street, Colombo 7'}
                </Text>
              </View>
            </View>
          </View>

          {/* Statistics Grid */}
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            {stats.map((stat) => (
              <StatCard key={stat.id} stat={stat} />
            ))}
          </View>

          {/* Quick Actions */}
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              icon="person-add"
              title="Add Resident"
              onPress={() => {}}
              iconColor="#10B981"
              iconBg="#ECFDF5"
            />
            <QuickAction
              icon="document-text"
              title="Generate Report"
              onPress={() => {}}
              iconColor="#7C3AED"
              iconBg="#F5F3FF"
            />
            <QuickAction
              icon="settings"
              title="Settings"
              onPress={() => router.push('/(tabs)/profile')}
              iconColor="#EA580C"
              iconBg="#FFF7ED"
            />
          </View>

          {/* Recent Activity */}
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <View style={styles.activityList}>
            <ActivityItem
              icon="alert-circle"
              title="SOS Alert resolved"
              description="Unit D-3: Medical emergency"
              time="3 hours ago"
              iconColor="#EF4444"
              iconBg="#FEF2F2"
              isLast
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const ActivityItem = ({
  icon,
  title,
  description,
  time,
  iconColor,
  iconBg,
  isLast = false,
}: {
  icon: string;
  title: string;
  description: string;
  time: string;
  iconColor: string;
  iconBg: string;
  isLast?: boolean;
}) => (
  <View style={[styles.activityItem, isLast && styles.activityItemLast]}>
    <View style={[styles.activityIcon, { backgroundColor: iconBg }]}>
      <Ionicons name={icon as any} size={18} color={iconColor} />
    </View>
    <View style={styles.activityContent}>
      <Text style={styles.activityTitle}>{title}</Text>
      <Text style={styles.activityDescription}>{description}</Text>
    </View>
    <Text style={styles.activityTime}>{time}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: C.background,
  },
  safeArea: {
    flex: 1,
  },

  /* ---- Header ---- */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: C.background,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...softShadow,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.textDark,
  },
  headerAction: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...softShadow,
  },

  /* ---- Scroll content ---- */
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  /* ---- Apartment Banner ---- */
  apartmentBanner: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 18,
    marginBottom: 28,
    ...cardShadow,
  },
  apartmentBannerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  apartmentLocationIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: C.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  apartmentInfo: {
    flex: 1,
  },
  apartmentName: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 4,
  },
  apartmentLocation: {
    fontSize: 14,
    color: C.textLight,
    lineHeight: 20,
  },

  /* ---- Section title ---- */
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 14,
  },

  /* ---- Stats Grid ---- */
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  statCard: {
    width: (width - 52) / 2,
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    justifyContent: 'space-between',
    minHeight: 148,
    ...cardShadow,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    color: C.textDark,
    marginBottom: 2,
  },
  statTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: C.textLight,
  },
  statSubtitle: {
    fontSize: 11,
    color: C.textMuted,
    marginTop: 2,
  },

  /* ---- Quick Actions ---- */
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 28,
  },
  quickAction: {
    width: (width - 52) / 2,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...cardShadow,
  },
  quickActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: C.textDark,
  },

  /* ---- Activity List ---- */
  activityList: {
    backgroundColor: C.white,
    borderRadius: 16,
    overflow: 'hidden',
    ...cardShadow,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  activityItemLast: {
    borderBottomWidth: 0,
  },
  activityIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textDark,
  },
  activityDescription: {
    fontSize: 12,
    color: C.textLight,
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: C.textMuted,
  },
});
