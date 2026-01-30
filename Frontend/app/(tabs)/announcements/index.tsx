/**
 * Announcements Screen
 * Community news and notifications
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, StatusBadge, EmptyState, LoadingSpinner } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { announcementService } from '@/services';
import { Announcement } from '@/types';

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return Colors.error;
      case 'HIGH':
        return Colors.warning;
      case 'NORMAL':
        return Colors.info;
      default:
        return Colors.gray[400];
    }
  };

  const getCategoryIcon = (category: string): keyof typeof Ionicons.glyphMap => {
    switch (category) {
      case 'MAINTENANCE':
        return 'construct';
      case 'EVENT':
        return 'calendar';
      case 'SECURITY':
        return 'shield';
      case 'EMERGENCY':
        return 'warning';
      default:
        return 'information-circle';
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
    return <LoadingSpinner fullScreen message="Loading announcements..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={Colors.gradients.primary as [string, string, ...string[]]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Announcements</Text>
        <Text style={styles.headerSubtitle}>Stay updated with community news</Text>
      </LinearGradient>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key || 'all'}
              onPress={() => setSelectedCategory(cat.key)}
              style={[
                styles.filterChip,
                selectedCategory === cat.key && styles.filterChipActive,
              ]}
            >
              <Ionicons
                name={cat.icon as keyof typeof Ionicons.glyphMap}
                size={16}
                color={selectedCategory === cat.key ? Colors.white : Colors.text.secondary}
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === cat.key && styles.filterChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Announcements List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredAnnouncements.length === 0 ? (
          <EmptyState
            icon="megaphone-outline"
            title="No Announcements"
            message="There are no announcements in this category yet."
          />
        ) : (
          filteredAnnouncements.map((announcement) => (
            <TouchableOpacity 
              key={announcement.id}
              activeOpacity={0.7}
            >
              <Card style={styles.announcementCard} variant="elevated">
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.categoryIcon,
                      { backgroundColor: `${getPriorityColor(announcement.priority)}15` },
                    ]}
                  >
                    <Ionicons
                      name={getCategoryIcon(announcement.category)}
                      size={20}
                      color={getPriorityColor(announcement.priority)}
                    />
                  </View>
                  <View style={styles.cardHeaderText}>
                    <Text style={styles.announcementTitle}>{announcement.title}</Text>
                    <Text style={styles.announcementDate}>
                      {formatDate(announcement.createdAt)}
                    </Text>
                  </View>
                  <StatusBadge status={announcement.priority} />
                </View>
                
                <Text style={styles.announcementContent} numberOfLines={3}>
                  {announcement.content}
                </Text>
                
                <View style={styles.cardFooter}>
                  <View style={styles.authorInfo}>
                    <Ionicons name="person-circle-outline" size={16} color={Colors.gray[400]} />
                    <Text style={styles.authorText}>
                      {announcement.createdBy?.name || 'Admin'}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.readMore}>
                    <Text style={styles.readMoreText}>Read More</Text>
                    <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  filterContainer: {
    backgroundColor: Colors.white,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.gray[100],
    gap: 6,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
  },
  filterChipTextActive: {
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  announcementCard: {
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardHeaderText: {
    flex: 1,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  announcementDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  announcementContent: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  authorText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  readMore: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
});
