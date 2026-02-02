/**
 * Common Area Booking Screen
 * Book facilities like gym, pool, party hall, etc.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
  Dimensions,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { CommonArea, CommonAreaBooking } from '@/types';

const { width } = Dimensions.get('window');

// Mock common areas data
const mockCommonAreas: CommonArea[] = [
  {
    id: 1,
    name: 'Swimming Pool',
    description: 'Olympic-sized pool with lifeguard on duty',
    capacity: 20,
    isAvailable: true,
    apartmentId: 1,
    openTime: '06:00',
    closeTime: '21:00',
    rules: ['No diving', 'Shower before entering', 'Children must be supervised'],
  },
  {
    id: 2,
    name: 'Fitness Center',
    description: 'Fully equipped gym with modern equipment',
    capacity: 15,
    isAvailable: true,
    apartmentId: 1,
    openTime: '05:00',
    closeTime: '23:00',
    rules: ['Wipe equipment after use', 'Return weights to rack', 'No food allowed'],
  },
  {
    id: 3,
    name: 'Party Hall',
    description: 'Spacious hall for events and celebrations',
    capacity: 100,
    isAvailable: true,
    apartmentId: 1,
    openTime: '09:00',
    closeTime: '22:00',
    rules: ['Advance booking required', 'Clean up after use', 'Noise limit after 10pm'],
  },
  {
    id: 4,
    name: 'BBQ Area',
    description: 'Outdoor BBQ pit with seating area',
    capacity: 30,
    isAvailable: true,
    apartmentId: 1,
    openTime: '10:00',
    closeTime: '21:00',
    rules: ['Bring your own supplies', 'Dispose of coal properly', 'Clean grill after use'],
  },
  {
    id: 5,
    name: 'Meeting Room',
    description: 'Conference room with projector and whiteboard',
    capacity: 12,
    isAvailable: false,
    apartmentId: 1,
    openTime: '08:00',
    closeTime: '20:00',
    rules: ['Keep quiet', 'Maximum 2 hour booking', 'No food or drinks'],
  },
  {
    id: 6,
    name: 'Rooftop Garden',
    description: 'Beautiful garden with city views',
    capacity: 25,
    isAvailable: true,
    apartmentId: 1,
    openTime: '06:00',
    closeTime: '22:00',
    rules: ['No littering', 'No loud music', 'Pet-friendly'],
  },
];

// Mock bookings
const mockBookings: CommonAreaBooking[] = [
  {
    id: 1,
    commonArea: mockCommonAreas[0],
    resident: { id: 1, name: 'John Doe', email: 'john@email.com', role: 'RESIDENT' },
    date: '2026-02-05',
    startTime: '10:00',
    endTime: '12:00',
    purpose: 'Swimming practice',
    status: 'APPROVED',
  },
  {
    id: 2,
    commonArea: mockCommonAreas[2],
    resident: { id: 1, name: 'John Doe', email: 'john@email.com', role: 'RESIDENT' },
    date: '2026-02-10',
    startTime: '18:00',
    endTime: '22:00',
    purpose: 'Birthday party',
    status: 'PENDING',
  },
];

export default function CommonAreaScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'areas' | 'bookings'>('areas');
  const [commonAreas, setCommonAreas] = useState<CommonArea[]>([]);
  const [bookings, setBookings] = useState<CommonAreaBooking[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState<CommonArea | null>(null);
  
  // Booking form state
  const [bookingForm, setBookingForm] = useState({
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Use mock data for demo
      setCommonAreas(mockCommonAreas);
      setBookings(mockBookings);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleBookArea = (area: CommonArea) => {
    if (!area.isAvailable) {
      Alert.alert('Not Available', 'This area is currently unavailable for booking.');
      return;
    }
    setSelectedArea(area);
    setShowBookingModal(true);
  };

  const handleSubmitBooking = () => {
    if (!bookingForm.date || !bookingForm.startTime || !bookingForm.endTime) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Add new booking to list
    const newBooking: CommonAreaBooking = {
      id: bookings.length + 1,
      commonArea: selectedArea!,
      resident: user!,
      date: bookingForm.date,
      startTime: bookingForm.startTime,
      endTime: bookingForm.endTime,
      purpose: bookingForm.purpose,
      status: 'PENDING',
    };

    setBookings([...bookings, newBooking]);
    setShowBookingModal(false);
    setBookingForm({ date: '', startTime: '', endTime: '', purpose: '' });
    Alert.alert('Success', 'Booking request submitted successfully!');
  };

  const getAreaIcon = (name: string): string => {
    const icons: { [key: string]: string } = {
      'Swimming Pool': 'water',
      'Fitness Center': 'fitness',
      'Party Hall': 'musical-notes',
      'BBQ Area': 'bonfire',
      'Meeting Room': 'people',
      'Rooftop Garden': 'leaf',
    };
    return icons[name] || 'business';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return Colors.success;
      case 'PENDING': return Colors.warning;
      case 'REJECTED': return Colors.error;
      case 'CANCELLED': return Colors.gray[400];
      default: return Colors.gray[400];
    }
  };

  const AreaCard = ({ area }: { area: CommonArea }) => (
    <TouchableOpacity 
      style={styles.areaCard}
      onPress={() => handleBookArea(area)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={area.isAvailable ? ['#1E5F8A', '#1A4B6E'] : ['#4A4A4A', '#333333']}
        style={styles.areaCardGradient}
      >
        <View style={styles.areaCardHeader}>
          <View style={[styles.areaIcon, { backgroundColor: area.isAvailable ? Colors.primary : Colors.gray[500] }]}>
            <Ionicons name={getAreaIcon(area.name) as any} size={24} color={Colors.white} />
          </View>
          {!area.isAvailable && (
            <View style={styles.unavailableBadge}>
              <Text style={styles.unavailableBadgeText}>Unavailable</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.areaName}>{area.name}</Text>
        <Text style={styles.areaDescription} numberOfLines={2}>
          {area.description}
        </Text>
        
        <View style={styles.areaDetails}>
          <View style={styles.areaDetailItem}>
            <Ionicons name="people-outline" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.areaDetailText}>Max {area.capacity}</Text>
          </View>
          <View style={styles.areaDetailItem}>
            <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.7)" />
            <Text style={styles.areaDetailText}>{area.openTime} - {area.closeTime}</Text>
          </View>
        </View>

        {area.isAvailable && (
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => handleBookArea(area)}
          >
            <Text style={styles.bookButtonText}>Book Now</Text>
          </TouchableOpacity>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );

  const BookingCard = ({ booking }: { booking: CommonAreaBooking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={[styles.bookingIcon, { backgroundColor: Colors.primary }]}>
          <Ionicons name={getAreaIcon(booking.commonArea.name) as any} size={20} color={Colors.white} />
        </View>
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingArea}>{booking.commonArea.name}</Text>
          <Text style={styles.bookingDate}>{booking.date}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Text style={styles.statusText}>{booking.status}</Text>
        </View>
      </View>
      
      <View style={styles.bookingDetails}>
        <View style={styles.bookingDetailRow}>
          <Ionicons name="time-outline" size={16} color={Colors.gray[400]} />
          <Text style={styles.bookingDetailText}>
            {booking.startTime} - {booking.endTime}
          </Text>
        </View>
        {booking.purpose && (
          <View style={styles.bookingDetailRow}>
            <Ionicons name="document-text-outline" size={16} color={Colors.gray[400]} />
            <Text style={styles.bookingDetailText}>{booking.purpose}</Text>
          </View>
        )}
      </View>

      {booking.status === 'PENDING' && (
        <TouchableOpacity style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel Booking</Text>
        </TouchableOpacity>
      )}
    </View>
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
            <Text style={styles.headerTitle}>Common Area Booking</Text>
            <View style={{ width: 40 }} />
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'areas' && styles.activeTab]}
              onPress={() => setActiveTab('areas')}
            >
              <Text style={[styles.tabText, activeTab === 'areas' && styles.activeTabText]}>
                Available Areas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'bookings' && styles.activeTab]}
              onPress={() => setActiveTab('bookings')}
            >
              <Text style={[styles.tabText, activeTab === 'bookings' && styles.activeTabText]}>
                My Bookings
              </Text>
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
            {activeTab === 'areas' ? (
              <View style={styles.areasGrid}>
                {commonAreas.map((area) => (
                  <AreaCard key={area.id} area={area} />
                ))}
              </View>
            ) : (
              <View style={styles.bookingsList}>
                {bookings.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Ionicons name="calendar-outline" size={60} color={Colors.gray[400]} />
                    <Text style={styles.emptyTitle}>No Bookings Yet</Text>
                    <Text style={styles.emptySubtitle}>
                      Book a common area to see your reservations here
                    </Text>
                  </View>
                ) : (
                  bookings.map((booking) => (
                    <BookingCard key={booking.id} booking={booking} />
                  ))
                )}
              </View>
            )}
          </ScrollView>

          {/* Booking Modal */}
          <Modal
            visible={showBookingModal}
            animationType="slide"
            transparent={true}
            onRequestClose={() => setShowBookingModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Book {selectedArea?.name}</Text>
                  <TouchableOpacity onPress={() => setShowBookingModal(false)}>
                    <Ionicons name="close" size={24} color={Colors.text.primary} />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <Text style={styles.inputLabel}>Date *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD (e.g., 2026-02-10)"
                    placeholderTextColor={Colors.gray[400]}
                    value={bookingForm.date}
                    onChangeText={(text) => setBookingForm({ ...bookingForm, date: text })}
                  />

                  <Text style={styles.inputLabel}>Start Time *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="HH:MM (e.g., 10:00)"
                    placeholderTextColor={Colors.gray[400]}
                    value={bookingForm.startTime}
                    onChangeText={(text) => setBookingForm({ ...bookingForm, startTime: text })}
                  />

                  <Text style={styles.inputLabel}>End Time *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="HH:MM (e.g., 12:00)"
                    placeholderTextColor={Colors.gray[400]}
                    value={bookingForm.endTime}
                    onChangeText={(text) => setBookingForm({ ...bookingForm, endTime: text })}
                  />

                  <Text style={styles.inputLabel}>Purpose (Optional)</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="What will you use this area for?"
                    placeholderTextColor={Colors.gray[400]}
                    value={bookingForm.purpose}
                    onChangeText={(text) => setBookingForm({ ...bookingForm, purpose: text })}
                    multiline
                    numberOfLines={3}
                  />

                  {selectedArea?.rules && (
                    <View style={styles.rulesContainer}>
                      <Text style={styles.rulesTitle}>Rules & Guidelines</Text>
                      {selectedArea.rules.map((rule, index) => (
                        <View key={index} style={styles.ruleItem}>
                          <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
                          <Text style={styles.ruleText}>{rule}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.submitButton}
                    onPress={handleSubmitBooking}
                    activeOpacity={0.8}
                  >
                    <LinearGradient
                      colors={['#2ECC71', '#27AE60']}
                      style={styles.submitButtonGradient}
                    >
                      <Text style={styles.submitButtonText}>Submit Booking Request</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </ScrollView>
              </View>
            </View>
          </Modal>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
}

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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  activeTabText: {
    color: Colors.white,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  areasGrid: {
    gap: 15,
  },
  areaCard: {
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 0,
  },
  areaCardGradient: {
    padding: 15,
  },
  areaCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  areaIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unavailableBadge: {
    backgroundColor: 'rgba(231, 76, 60, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  unavailableBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.white,
  },
  areaName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 6,
  },
  areaDescription: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 12,
  },
  areaDetails: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 12,
  },
  areaDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  areaDetailText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  bookButton: {
    backgroundColor: 'rgba(46, 204, 113, 0.9)',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  bookButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  bookingsList: {
    gap: 15,
  },
  bookingCard: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    padding: 15,
  },
  bookingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookingInfo: {
    flex: 1,
    marginLeft: 12,
  },
  bookingArea: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  bookingDate: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
  },
  bookingDetails: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[200],
  },
  bookingDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bookingDetailText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  cancelButton: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.error,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 15,
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 8,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.gray[200],
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  rulesContainer: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text.primary,
    marginBottom: 10,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ruleText: {
    fontSize: 13,
    color: Colors.text.secondary,
    flex: 1,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 25,
    marginBottom: 20,
  },
  submitButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
});
