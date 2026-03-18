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
  Modal, // Added Modal
  Pressable, // Added Pressable for "tap anywhere to close"
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG, APP_CONFIG } from '@/constants/config'; 

interface Notice {
  id: number;
  title: string;
  content: string;
  postedAt: string;
  author?: { name?: string };
}

const C = {
  bg: '#D8F3DC',
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  white: '#FFFFFF',
  textDark: '#1E293B',
  textLight: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  overlay: 'rgba(0,0,0,0.5)', // For modal background
};

export default function AnnouncementsScreen() {
  const [announcements, setAnnouncements] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal States
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    try {
      const token = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN);
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANNOUNCEMENTS}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);
      const data = await response.json();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error loading announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const openNotice = (notice: Notice) => {
    setSelectedNotice(notice);
    setModalVisible(true);
  };

  const closeNotice = () => {
    setModalVisible(false);
    setSelectedNotice(null);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={C.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notice Board</Text>
        <Text style={styles.headerSubtitle}>Community updates</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => {setRefreshing(true); loadAnnouncements().then(()=>setRefreshing(false))}} />}
      >
        {announcements.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            activeOpacity={0.8} 
            style={styles.announcementCard}
            onPress={() => openNotice(item)} // Open modal on card tap
          >
            <View style={styles.cardHeader}>
              <View style={styles.cardHeaderText}>
                <Text style={styles.announcementTitle}>{item.title}</Text>
                <Text style={styles.announcementDate}>{formatDate(item.postedAt)}</Text>
              </View>
              <Ionicons name="megaphone" size={18} color={C.primary} />
            </View>

            <Text style={styles.announcementContent} numberOfLines={3}>
              {item.content}
            </Text>

            <View style={styles.cardFooter}>
               <Text style={styles.authorText}>By {item.author?.name || 'Manager'}</Text>
               <View style={styles.readMore}>
                  <Text style={styles.readMoreText}>Tap to read</Text>
                  <Ionicons name="chevron-forward" size={14} color={C.primary} />
               </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* --- FULL VIEW MODAL --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeNotice}
      >
        <Pressable style={styles.modalOverlay} onPress={closeNotice}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedNotice?.title}</Text>
              <TouchableOpacity onPress={closeNotice} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={C.textDark} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={true}>
              <Text style={styles.modalDate}>Posted on {selectedNotice ? formatDate(selectedNotice.postedAt) : ''}</Text>
              <Text style={styles.fullContent}>{selectedNotice?.content}</Text>
              <View style={{ height: 20 }} /> 
            </ScrollView>

            <View style={styles.modalFooter}>
               <Text style={styles.authorText}>Author: {selectedNotice?.author?.name || 'Manager'}</Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: C.textDark },
  headerSubtitle: { fontSize: 14, color: C.textLight },
  scrollView: { flex: 1 },
  scrollContent: { padding: 16 },

  // Card Styles
  announcementCard: {
    backgroundColor: C.white, borderRadius: 16, padding: 16, marginBottom: 12,
    ...Platform.select({ ios: { shadowOpacity: 0.1, shadowRadius: 5 }, android: { elevation: 3 } }),
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardHeaderText: { flex: 1 },
  announcementTitle: { fontSize: 17, fontWeight: '700', color: C.textDark },
  announcementDate: { fontSize: 12, color: C.textMuted },
  announcementContent: { fontSize: 14, color: C.textLight, lineHeight: 20, marginVertical: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10 },
  authorText: { fontSize: 12, color: C.textMuted, fontWeight: '500' },
  readMore: { flexDirection: 'row', alignItems: 'center' },
  readMoreText: { fontSize: 13, fontWeight: '600', color: C.primary, marginRight: 4 },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: C.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: C.white,
    borderRadius: 24,
    width: '100%',
    maxHeight: '80%',
    padding: 24,
    ...Platform.select({ ios: { shadowOpacity: 0.3, shadowRadius: 10 }, android: { elevation: 10 } }),
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: C.textDark, flex: 1, marginRight: 10 },
  closeButton: { padding: 4 },
  modalBody: { marginTop: 10 },
  modalDate: { fontSize: 12, color: C.textMuted, marginBottom: 15, fontStyle: 'italic' },
  fullContent: { fontSize: 16, color: C.textDark, lineHeight: 24 },
  modalFooter: { marginTop: 20, paddingTop: 15, borderTopWidth: 1, borderTopColor: C.border },
});