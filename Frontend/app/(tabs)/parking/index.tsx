/**
 * Parking Screen
 * Parking slots and visitor management
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, InputField, StatusBadge, EmptyState } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { parkingService } from '@/services';
import { ParkingSlot, VisitorEntry } from '@/types';

export default function ParkingScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'parking' | 'visitors'>('parking');
  const [parkingSlot, setParkingSlot] = useState<ParkingSlot | null>(null);
  const [visitors, setVisitors] = useState<VisitorEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  
  // Visitor form state
  const [visitorForm, setVisitorForm] = useState({
    name: '',
    phone: '',
    vehicleNumber: '',
    purpose: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      if (user?.id) {
        const [slot, visitorData] = await Promise.all([
          parkingService.getUserParkingSlot(user.id),
          parkingService.getVisitorEntries(user.id),
        ]);
        setParkingSlot(slot);
        setVisitors(visitorData);
      }
    } catch (error) {
      console.error('Error loading parking data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleRegisterVisitor = async () => {
    if (!visitorForm.name || !visitorForm.purpose) {
      Alert.alert('Error', 'Please fill in required fields');
      return;
    }

    try {
      if (user) {
        await parkingService.registerVisitor({
          visitorName: visitorForm.name,
          visitorPhone: visitorForm.phone,
          vehicleNumber: visitorForm.vehicleNumber,
          purpose: visitorForm.purpose,
          resident: user,
        });
        Alert.alert('Success', 'Visitor registered successfully');
        setShowVisitorModal(false);
        setVisitorForm({ name: '', phone: '', vehicleNumber: '', purpose: '' });
        loadData();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to register visitor');
    }
  };

  const toggleSlotAvailability = async () => {
    if (parkingSlot) {
      try {
        const updated = await parkingService.toggleSlotAvailability(
          parkingSlot.id,
          !parkingSlot.isAvailableForLending
        );
        setParkingSlot(updated);
        Alert.alert(
          'Success',
          updated.isAvailableForLending
            ? 'Your slot is now available for lending'
            : 'Your slot is no longer available for lending'
        );
      } catch (error) {
        Alert.alert('Error', 'Failed to update slot availability');
      }
    }
  };

  // Mock data for demo
  const mockParkingSlot: ParkingSlot = {
    id: 1,
    slotNumber: 'P-A12',
    isAvailableForLending: false,
    owner: user!,
    vehicleNumber: 'ABC-1234',
    vehicleType: 'Car',
  };

  const mockVisitors: VisitorEntry[] = [
    {
      id: 1,
      visitorName: 'John Smith',
      visitorPhone: '+94 77 123 4567',
      vehicleNumber: 'XYZ-5678',
      purpose: 'Family visit',
      resident: user!,
      entryTime: new Date().toISOString(),
      status: 'CHECKED_IN',
    },
    {
      id: 2,
      visitorName: 'Jane Doe',
      purpose: 'Delivery',
      resident: user!,
      entryTime: new Date(Date.now() - 86400000).toISOString(),
      exitTime: new Date(Date.now() - 82800000).toISOString(),
      status: 'CHECKED_OUT',
    },
  ];

  const displaySlot = parkingSlot || mockParkingSlot;
  const displayVisitors = visitors.length > 0 ? visitors : mockVisitors;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={Colors.gradients.secondary as [string, string, ...string[]]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Parking & Visitors</Text>
        <Text style={styles.headerSubtitle}>Manage parking and visitor entries</Text>
      </LinearGradient>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('parking')}
          style={[styles.tab, activeTab === 'parking' && styles.tabActive]}
        >
          <Ionicons
            name="car"
            size={20}
            color={activeTab === 'parking' ? Colors.primary : Colors.text.secondary}
          />
          <Text style={[styles.tabText, activeTab === 'parking' && styles.tabTextActive]}>
            My Parking
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('visitors')}
          style={[styles.tab, activeTab === 'visitors' && styles.tabActive]}
        >
          <Ionicons
            name="people"
            size={20}
            color={activeTab === 'visitors' ? Colors.primary : Colors.text.secondary}
          />
          <Text style={[styles.tabText, activeTab === 'visitors' && styles.tabTextActive]}>
            Visitors
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'parking' ? (
          // Parking Section
          <>
            <Card variant="elevated" style={styles.slotCard}>
              <View style={styles.slotHeader}>
                <View style={styles.slotIconContainer}>
                  <Ionicons name="car" size={32} color={Colors.secondary} />
                </View>
                <View style={styles.slotInfo}>
                  <Text style={styles.slotLabel}>Your Parking Slot</Text>
                  <Text style={styles.slotNumber}>{displaySlot.slotNumber}</Text>
                </View>
                <StatusBadge 
                  status={displaySlot.isAvailableForLending ? 'Available' : 'Occupied'} 
                />
              </View>

              <View style={styles.vehicleInfo}>
                <View style={styles.infoRow}>
                  <Ionicons name="speedometer-outline" size={18} color={Colors.text.secondary} />
                  <Text style={styles.infoText}>
                    Vehicle: {displaySlot.vehicleNumber || 'Not registered'}
                  </Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="car-sport-outline" size={18} color={Colors.text.secondary} />
                  <Text style={styles.infoText}>
                    Type: {displaySlot.vehicleType || 'Car'}
                  </Text>
                </View>
              </View>

              <Button
                title={displaySlot.isAvailableForLending ? 'Mark as Unavailable' : 'Lend My Slot'}
                onPress={toggleSlotAvailability}
                variant={displaySlot.isAvailableForLending ? 'outline' : 'primary'}
                icon={
                  <Ionicons
                    name={displaySlot.isAvailableForLending ? 'close-circle-outline' : 'share-outline'}
                    size={20}
                    color={displaySlot.isAvailableForLending ? Colors.primary : Colors.white}
                  />
                }
              />
            </Card>

            {/* Parking Rules */}
            <Card style={styles.rulesCard}>
              <Text style={styles.cardTitle}>Parking Guidelines</Text>
              <View style={styles.ruleItem}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.ruleText}>Park only in your assigned slot</Text>
              </View>
              <View style={styles.ruleItem}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.ruleText}>Register visitors before entry</Text>
              </View>
              <View style={styles.ruleItem}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                <Text style={styles.ruleText}>Speed limit: 10 km/h in premises</Text>
              </View>
            </Card>
          </>
        ) : (
          // Visitors Section
          <>
            <Button
              title="Register New Visitor"
              onPress={() => setShowVisitorModal(true)}
              gradient
              icon={<Ionicons name="person-add" size={20} color={Colors.white} />}
              style={styles.addVisitorButton}
            />

            <Text style={styles.sectionTitle}>Visitor History</Text>
            
            {displayVisitors.length === 0 ? (
              <EmptyState
                icon="people-outline"
                title="No Visitors"
                message="You haven't registered any visitors yet."
              />
            ) : (
              displayVisitors.map((visitor) => (
                <Card key={visitor.id} style={styles.visitorCard}>
                  <View style={styles.visitorHeader}>
                    <View style={styles.visitorAvatar}>
                      <Ionicons name="person" size={24} color={Colors.white} />
                    </View>
                    <View style={styles.visitorInfo}>
                      <Text style={styles.visitorName}>{visitor.visitorName}</Text>
                      <Text style={styles.visitorPurpose}>{visitor.purpose}</Text>
                    </View>
                    <StatusBadge status={visitor.status} />
                  </View>
                  
                  <View style={styles.visitorDetails}>
                    {visitor.visitorPhone && (
                      <View style={styles.detailRow}>
                        <Ionicons name="call-outline" size={16} color={Colors.text.secondary} />
                        <Text style={styles.detailText}>{visitor.visitorPhone}</Text>
                      </View>
                    )}
                    {visitor.vehicleNumber && (
                      <View style={styles.detailRow}>
                        <Ionicons name="car-outline" size={16} color={Colors.text.secondary} />
                        <Text style={styles.detailText}>{visitor.vehicleNumber}</Text>
                      </View>
                    )}
                    <View style={styles.detailRow}>
                      <Ionicons name="time-outline" size={16} color={Colors.text.secondary} />
                      <Text style={styles.detailText}>
                        {new Date(visitor.entryTime).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                </Card>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* Visitor Registration Modal */}
      <Modal
        visible={showVisitorModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowVisitorModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Register Visitor</Text>
            <TouchableOpacity onPress={() => setShowVisitorModal(false)}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <InputField
              label="Visitor Name *"
              placeholder="Enter visitor's name"
              value={visitorForm.name}
              onChangeText={(value) => setVisitorForm((prev) => ({ ...prev, name: value }))}
              icon="person-outline"
            />

            <InputField
              label="Phone Number"
              placeholder="Enter phone number"
              value={visitorForm.phone}
              onChangeText={(value) => setVisitorForm((prev) => ({ ...prev, phone: value }))}
              keyboardType="phone-pad"
              icon="call-outline"
            />

            <InputField
              label="Vehicle Number"
              placeholder="Enter vehicle number (optional)"
              value={visitorForm.vehicleNumber}
              onChangeText={(value) => setVisitorForm((prev) => ({ ...prev, vehicleNumber: value }))}
              icon="car-outline"
              autoCapitalize="characters"
            />

            <InputField
              label="Purpose of Visit *"
              placeholder="e.g., Family visit, Delivery"
              value={visitorForm.purpose}
              onChangeText={(value) => setVisitorForm((prev) => ({ ...prev, purpose: value }))}
              icon="document-text-outline"
            />

            <Button
              title="Register Visitor"
              onPress={handleRegisterVisitor}
              gradient
              size="large"
              style={styles.submitButton}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    padding: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: `${Colors.primary}10`,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  slotCard: {
    marginBottom: 16,
  },
  slotHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  slotIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: `${Colors.secondary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  slotInfo: {
    flex: 1,
  },
  slotLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: 4,
  },
  slotNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  vehicleInfo: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  rulesCard: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  ruleText: {
    fontSize: 14,
    color: Colors.text.secondary,
  },
  addVisitorButton: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 12,
  },
  visitorCard: {
    marginBottom: 12,
  },
  visitorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  visitorAvatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  visitorInfo: {
    flex: 1,
  },
  visitorName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
  },
  visitorPurpose: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  visitorDetails: {
    backgroundColor: Colors.gray[50],
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: Colors.text.secondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  modalContent: {
    padding: 20,
  },
  submitButton: {
    marginTop: 20,
  },
});
