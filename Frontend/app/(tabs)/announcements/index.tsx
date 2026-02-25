/**
 * Announcements Screen
 * Community news and notifications - Modern 2026 light theme
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { announcementService } from '@/services';
import { Announcement } from '@/types';

const C = {
  bg: '#D8F3DC',
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  white: '#FFFFFF',
  textDark: '#1E293B',
  textLight: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  gray50: '#F8FAFC',
  gray100: '#F1F5F9',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
};

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { key: null, label: 'All', icon: 'grid-outline' },
    { key: 'GENERAL', label: 'General', icon: 'information-circle-outline' },
    { key: 'MAINTENANCE', label: 'Maintenance', icon: 'construct-outline' },
    { key: 'EVENT', label: 'Events', icon: 'calendar-outline' },
    { key: 'SECURITY', label: 'Security', icon: 'shield-outline' },
    { key: 'EMERGENCY', label: 'Emergency', icon: 'warning-outline' },
  ];

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const data = await announcementService.getActiveAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnnouncements();
    setRefreshing(false);
  };

  const filteredAnnouncements = selectedCategory
    ? announcements.filter((a) => a.category === selectedCategory)
    : announcements;

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return { color: C.error, bg: '#FEF2F2', label: 'Urgent' };
      case 'HIGH':
        return { color: C.warning, bg: '#FEF3C7', label: 'High' };
      case 'NORMAL':
        return { color: C.primary, bg: C.primaryLight, label: 'Normal' };
      default:
        return { color: C.textMuted, bg: C.gray100, label: priority };
    }
  };

  const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    switch (category) {
      case 'MAINTENANCE': return 'construct';
      case 'EVENT': return 'calendar';
      case 'SECURITY': return 'shield';
      case 'EMERGENCY': return 'warning';
      default: return 'information-circle';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={{ color: C.textLight, marginTop: 12, fontSize: 14 }}>Loading announcements...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Announcements</Text>
        <Text style={styles.headerSubtitle}>Stay updated with community news</Text>
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.key;
            return (
              <TouchableOpacity
                key={cat.key || 'all'}
                onPress={() => setSelectedCategory(cat.key)}
                style={[styles.filterChip, isActive && styles.filterChipActive]}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={cat.icon as keyof typeof Ionicons.glyphMap}
                  size={15}
                  color={isActive ? C.white : C.textLight}
                />
                <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Announcements List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredAnnouncements.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <Ionicons name="megaphone-outline" size={40} color={C.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>No Announcements</Text>
            <Text style={styles.emptySubtitle}>There are no announcements in this category yet.</Text>
          </View>
        ) : (
          filteredAnnouncements.map((announcement) => {
            const priorityStyle = getPriorityStyle(announcement.priority);
            return (
              <TouchableOpacity key={announcement.id} activeOpacity={0.7} style={styles.announcementCard}>
                <View style={styles.cardHeader}>
                  <View style={[styles.categoryIcon, { backgroundColor: `${priorityStyle.color}15` }]}>
                    <Ionicons name={getCategoryIcon(announcement.category)} size={20} color={priorityStyle.color} />
                  </View>
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.announcementTitle}>{announcement.title}</Text>
                    <Text style={styles.announcementDate}>{formatDate(announcement.createdAt)}</Text>
                  </View>
                  <View style={[styles.priorityBadge, { backgroundColor: priorityStyle.bg }]}>
                    <Text style={[styles.priorityText, { color: priorityStyle.color }]}>{priorityStyle.label}</Text>
                  </View>
                </View>

                <Text style={styles.announcementContent} numberOfLines={3}>
                  {announcement.content}
                </Text>

                <View style={styles.cardFooter}>
                  <View style={styles.authorInfo}>
                    <Ionicons name="person-circle-outline" size={16} color={C.textMuted} />
                    <Text style={styles.authorText}>{announcement.createdBy?.name || 'Admin'}</Text>
                  </View>
                  <TouchableOpacity style={styles.readMore}>
                    <Text style={styles.readMoreText}>Read More</Text>
                    <Ionicons name="chevron-forward" size={14} color={C.primary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: C.textDark, letterSpacing: -0.5, marginBottom: 4 },
  headerSubtitle: { fontSize: 14, color: C.textLight, fontWeight: '500' },

  filterContainer: { paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: C.border },
  filterScroll: { paddingHorizontal: 16, gap: 8 },
  filterChip: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 20, backgroundColor: C.white, gap: 6, borderWidth: 1, borderColor: C.border,
  },
  filterChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  filterChipText: { fontSize: 13, fontWeight: '600', color: C.textLight },
  filterChipTextActive: { color: C.white },

  scrollView: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 100 },

  announcementCard: {
    backgroundColor: C.white, borderRadius: 20, padding: 16, marginBottom: 14,
    ...Platform.select({
      ios: { shadowColor: C.textMuted, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  categoryIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardHeaderText: { flex: 1 },
  announcementTitle: { fontSize: 16, fontWeight: '700', color: C.textDark, marginBottom: 4 },
  announcementDate: { fontSize: 12, color: C.textLight },
  priorityBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  priorityText: { fontSize: 11, fontWeight: '700' },
  announcementContent: { fontSize: 14, color: C.textLight, lineHeight: 20, marginBottom: 12 },

  cardFooter: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: 12, borderTopWidth: 1, borderTopColor: C.border,
  },
  authorInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  authorText: { fontSize: 12, color: C.textLight },
  readMore: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  readMoreText: { fontSize: 13, fontWeight: '600', color: C.primary },

  emptyState: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: C.white, alignItems: 'center', justifyContent: 'center', marginBottom: 16,
    ...Platform.select({
      ios: { shadowColor: C.textMuted, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12 },
      android: { elevation: 3 },
    }),
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: C.textDark, marginBottom: 6 },
  emptySubtitle: { fontSize: 14, color: C.textLight, textAlign: 'center' },
});
