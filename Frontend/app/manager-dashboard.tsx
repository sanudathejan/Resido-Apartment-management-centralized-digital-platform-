/**
 * Manager Dashboard Screen
 * Detailed statistics and management overview for apartment managers
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
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

const { width } = Dimensions.get('window');

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
      color: '#3498DB',
      subtitle: '64 units occupied',
    },
    {
      id: 'maintenance',
      title: 'Pending Requests',
      value: 12,
      icon: 'construct',
      color: '#F39C12',
      subtitle: '3 urgent',
    },
    {
      id: 'payments',
      title: 'Pending Payments',
      value: 'Rs. 2.4M',
      icon: 'card',
      color: '#E74C3C',
      subtitle: '18 residents',
    },
    {
      id: 'visitors',
      title: 'Visitors Today',
      value: 24,
      icon: 'person-add',
      color: '#2ECC71',
      subtitle: '8 checked out',
    },
    {
      id: 'parking',
      title: 'Available Parking',
      value: '15/80',
      icon: 'car',
      color: '#9B59B6',
      subtitle: '15 slots free',
    },
    {
      id: 'bookings',
      title: 'Area Bookings',
      value: 8,
      icon: 'calendar',
      color: '#1ABC9C',
      subtitle: 'Today',
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

  const StatCard = ({ stat }: { stat: DashboardStat }) => (
    <TouchableOpacity style={styles.statCard} activeOpacity={0.8}>
      <LinearGradient
        colors={['#1E5F8A', '#1A4B6E']}
        style={styles.statCardGradient}
      >
        <View style={[styles.statIconContainer, { backgroundColor: stat.color }]}>
          <Ionicons name={stat.icon as any} size={24} color={Colors.white} />
        </View>
        <Text style={styles.statValue}>{stat.value}</Text>
        <Text style={styles.statTitle}>{stat.title}</Text>
        {stat.subtitle && (
          <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const QuickAction = ({ 
    icon, 
    title, 
    onPress, 
    color = Colors.primary 
  }: { 
    icon: string; 
    title: string; 
    onPress: () => void;
    color?: string;
  }) => (
    <TouchableOpacity 
      style={styles.quickAction} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={22} color={Colors.white} />
      </View>
      <Text style={styles.quickActionText}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1A4B6E', '#0D2137']}
        style={styles.background}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Manager Dashboard</Text>
            <TouchableOpacity style={styles.headerAction}>
              <Ionicons name="notifications-outline" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={Colors.white}
              />
            }
          >
            {/* Apartment Info Banner */}
            <View style={styles.apartmentBanner}>
              <Text style={styles.apartmentName}>
                {user?.managedApartment?.name || 'PrimeLux Residence'}
              </Text>
              <Text style={styles.apartmentLocation}>
                {user?.managedApartment?.location || '23/A, Bakers street, Colombo 7'}
              </Text>
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
                icon="megaphone"
                title="Create Announcement"
                onPress={() => router.push('/(tabs)/announcements')}
                color="#3498DB"
              />
              <QuickAction
                icon="person-add"
                title="Add Resident"
                onPress={() => {}}
                color="#2ECC71"
              />
              <QuickAction
                icon="document-text"
                title="Generate Report"
                onPress={() => {}}
                color="#9B59B6"
              />
              <QuickAction
                icon="settings"
                title="Settings"
                onPress={() => router.push('/(tabs)/profile')}
                color="#F39C12"
              />
            </View>

            {/* Recent Activity */}
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.activityList}>
              <ActivityItem
                icon="construct"
                title="New maintenance request"
                description="Unit B-12: Plumbing issue"
                time="10 mins ago"
                color="#F39C12"
              />
              <ActivityItem
                icon="card"
                title="Payment received"
                description="Unit A-5: Rent for February"
                time="1 hour ago"
                color="#2ECC71"
              />
              <ActivityItem
                icon="person-add"
                title="Visitor check-in"
                description="Unit C-8: Guest arrived"
                time="2 hours ago"
                color="#3498DB"
              />
              <ActivityItem
                icon="alert-circle"
                title="SOS Alert resolved"
                description="Unit D-3: Medical emergency"
                time="3 hours ago"
                color="#E74C3C"
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

const ActivityItem = ({ 
  icon, 
  title, 
  description, 
  time, 
  color 
}: { 
  icon: string; 
  title: string; 
  description: string; 
  time: string;
  color: string;
}) => (
  <View style={styles.activityItem}>
    <View style={[styles.activityIcon, { backgroundColor: color }]}>
      <Ionicons name={icon as any} size={18} color={Colors.white} />
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
  },
  background: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  headerAction: {
    width: 40,
    height: 40,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  apartmentBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,
  },
  apartmentName: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 5,
  },
  apartmentLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 25,
  },
  statCard: {
    width: (width - 52) / 2,
    height: 140,
    borderRadius: 15,
    overflow: 'hidden',
  },
  statCardGradient: {
    flex: 1,
    padding: 15,
    justifyContent: 'space-between',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.white,
  },
  statTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  statSubtitle: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 25,
  },
  quickAction: {
    width: (width - 52) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: Colors.white,
  },
  activityList: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 15,
    overflow: 'hidden',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
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
    color: Colors.white,
  },
  activityDescription: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: 2,
  },
  activityTime: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.5)',
  },
});
