import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
// Using Lucide icons for a clean, modern look similar to the UI
import { Search, Grid, Phone, Home, Megaphone, SquareP, Banknote, UserCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Mock Data: In a real app, this would come from an API or Firebase
const PARKING_DATA = [
  {
    id: '1',
    name: 'John Smith',
    status: 'AVAILABLE NOW',
    statusColor: '#E8F5E9', // Light green background
    statusTextColor: '#2E7D32', // Dark green text
    slot: 'P-B05',
    contact: '+94 77 123 4567',
    rate: '$5.00',
  },
  {
    id: '2',
    name: 'Jane Doe',
    status: 'FREE',
    statusColor: '#E8F5E9',
    statusTextColor: '#2E7D32',
    slot: 'P-A12',
    contact: '+94 77 987 6543',
    rate: 'FREE',
  },
  {
    id: '3',
    name: 'Michael Tan',
    status: 'FROM 6:00 PM',
    statusColor: '#F5F5F5', // Gray background for scheduled slots
    statusTextColor: '#757575',
    slot: 'P-C09',
    contact: '+94 71 456 7890',
    rate: '$3.00',
  },
];

/**
 * Individual Card Component for each Parking Slot
 */
const ParkingCard = ({ item }) => (
  <View style={styles.card}>
    {/* Profile and Rate Header Section */}
    <View style={styles.cardHeader}>
      <View style={styles.userInfo}>
        <View style={styles.avatarPlaceholder}>
          <UserCircle size={40} color="#3498db" strokeWidth={1.5} />
        </View>
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.userName}>{item.name}</Text>
          {/* Dynamic status badge based on availability */}
          <View style={[styles.statusBadge, { backgroundColor: item.statusColor }]}>
            <Text style={[styles.statusText, { color: item.statusTextColor }]}>{item.status}</Text>
          </View>
        </View>
      </View>
      <View style={styles.rateContainer}>
        <Text style={styles.rateLabel}>DAILY RATE</Text>
        <Text style={styles.rateValue}>{item.rate}</Text>
      </View>
    </View>

    {/* Details Box: Slot number and Contact info */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Grid size={18} color="#94a3b8" />
            <Text style={styles.detailText}>Slot Number: <Text style={styles.boldText}>{item.slot}</Text></Text>
          </View>
          <View style={styles.detailRow}>
            <Phone size={18} color="#94a3b8" />
            <Text style={styles.detailText}>Contact: <Text style={styles.boldText}>{item.contact}</Text></Text>
          </View>
        </View>

        {/* Request Button with Plus Icon */}
            <TouchableOpacity style={styles.requestButton} activeOpacity={0.8}>
              <View style={styles.buttonContent}>
                <View style={styles.plusIcon}>
                  <Text style={styles.plusText}>+</Text>
                </View>
                <Text style={styles.requestButtonText}>Request Slot</Text>
              </View>
            </TouchableOpacity>
          </View>
        );

export default function ParkingApp() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3498db" />

      {/* Header: Blue section with title and subtitle */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <TouchableOpacity><Text style={styles.backArrow}>‹</Text></TouchableOpacity>
                <Text style={styles.headerTitle}>Find Available Parking</Text>
                <View style={{ width: 24 }} /> {/* Empty view for centering title */}
              </View>
              <Text style={styles.headerSubtitle}>Rent a temporary slot from other residents</Text>
            </View>

            {/* Main Content Area: Uses negative margin to overlap the blue header */}
            <View style={styles.content}>

            {/* Toggle Tabs: Available Slots vs My Requests */}
                    <View style={styles.tabContainer}>
                      <TouchableOpacity style={[styles.tab, styles.activeTab]}>
                        <View style={styles.tabContent}>
                          <SquareP size={16} color="#27ae60" fill="#27ae60" />
                          <Text style={[styles.tabText, styles.activeTabText]}>Available Slots</Text>
                        </View>
                       </TouchableOpacity>
                         <TouchableOpacity style={styles.tab}>
                          <View style={styles.tabContent}>
                              <Megaphone size={16} color="#64748b" />
                              <Text style={styles.tabText}>My Requests</Text>
                            </View>
                          </TouchableOpacity>
                        </View>

                        {/* Search Bar Input */}
                                <View style={styles.searchContainer}>
                                  <Search size={20} color="#94a3b8" />
                                  <TextInput
                                    style={styles.searchInput}
                                    placeholder="Search by block (e.g. Block B)"
                                    placeholderTextColor="#94a3b8"
                                  />
                                </View>

                        {/* List of Parking Slots */}
                                <FlatList
                                  data={PARKING_DATA}
                                  renderItem={({ item }) => <ParkingCard item={item} />}
                                  keyExtractor={item => item.id}
                                  contentContainerStyle={{ paddingBottom: 100 }} // Space for bottom nav
                                  showsVerticalScrollIndicator={false}
                                />
                              </View>

                        {/* Bottom Navigation Bar */}
                              <View style={styles.bottomNav}>
                                <NavIcon icon={<Home size={24} color="#64748b" />} label="Home" />
                                <NavIcon icon={<Megaphone size={24} color="#64748b" />} label="News" />
                                {/* Active Parking Tab */}
                                <View style={styles.activeNavIcon}>
                                  <SquareP size={28} color="#2ecc71" />
                                  <Text style={[styles.navLabel, { color: '#2ecc71' }]}>Parking</Text>
                                  <View style={styles.activeIndicator} />
                                </View>
                                <NavIcon icon={<Banknote size={24} color="#64748b" />} label="Rent" />
                                <NavIcon icon={<UserCircle size={24} color="#64748b" />} label="Profile" />
                              </View>
                            </SafeAreaView>
                          );
                        }

/**
 * Reusable component for Bottom Navigation Items
 */
const NavIcon = ({ icon, label }) => (
  <TouchableOpacity style={styles.navItem} activeOpacity={0.6}>
    {icon}
    <Text style={styles.navLabel}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },

// Header Styles
  header: { backgroundColor: '#3498db', padding: 20, paddingBottom: 45 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backArrow: { fontSize: 36, color: 'white', fontWeight: '300', marginTop: -5 },
  headerTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 8, textAlign: 'left' },

  // Overlapping Content Body
    content: {
      flex: 1,
      marginTop: -25, // This creates the overlap effect
      borderTopLeftRadius: 25,
      borderTopRightRadius: 25,
      backgroundColor: '#f8fafc',
      paddingHorizontal: 16
    },

// Tab Switcher Styles
  tabContainer: { flexDirection: 'row', backgroundColor: '#f1f5f9', borderRadius: 12, padding: 4, marginTop: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 10 },
  activeTab: { backgroundColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tabContent: { flexDirection: 'row', alignItems: 'center' },
  tabText: { marginLeft: 8, color: '#64748b', fontSize: 14, fontWeight: '600' },
  activeTabText: { color: '#27ae60' },

// Search Bar Styles
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderRadius: 14, paddingHorizontal: 15, marginTop: 15, borderWidth: 1, borderColor: '#e2e8f0', height: 55 },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, color: '#334155' },

// Card Component Styles
  card: { backgroundColor: 'white', borderRadius: 20, padding: 18, marginTop: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  userInfo: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#eff6ff', justifyContent: 'center', alignItems: 'center' },
  userName: { fontSize: 17, fontWeight: '700', color: '#1e293b' },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 6, marginTop: 5 },
  statusText: { fontSize: 11, fontWeight: 'bold' },
  rateContainer: { alignItems: 'flex-end' },
  rateLabel: { fontSize: 10, color: '#94a3b8', fontWeight: '800', letterSpacing: 0.5 },
  rateValue: { fontSize: 20, fontWeight: '900', color: '#1e293b' },

// Detail Box Styles
  detailsContainer: { backgroundColor: '#f8fafc', borderRadius: 14, padding: 14, marginTop: 18, borderWidth: 1, borderColor: '#f1f5f9' },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  detailText: { marginLeft: 12, color: '#64748b', fontSize: 14 },
  boldText: { fontWeight: '700', color: '#334155' },

// Request Button Styles
  requestButton: { backgroundColor: '#2ecc71', borderRadius: 14, paddingVertical: 14, marginTop: 18, alignItems: 'center' },
  buttonContent: { flexDirection: 'row', alignItems: 'center' },
  plusIcon: { width: 22, height: 22, borderRadius: 11, borderColor: 'white', borderWidth: 2, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  plusText: { color: 'white', fontSize: 16, fontWeight: 'bold', lineHeight: 18 },
  requestButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

// Bottom Navigation Styles
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#0f172a',
    paddingVertical: 12,
    paddingBottom: 28, // Extra padding for iPhone notches
    position: 'absolute',
    bottom: 0,
    width: '100%',
    justifyContent: 'space-around',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15
  },