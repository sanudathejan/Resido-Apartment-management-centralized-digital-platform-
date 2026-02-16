import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import ParkingFinding from './parkingFinding'; // Import your search interface
/** * 1. DATA ARRAY:
 * This is where you manage your requests.
 * To add more "Slots" or requests to the screen, just add more objects to this list.
 */
const REQUESTS = [
  {
    id: '1',
    name: 'Marcus Thorne',
    apt: '402B',
    time: 'Today, 6:00 PM',
    car: 'White Tesla Model 3',
    plate: 'ABC-1234',
    type: 'GUEST'
  },
  {
    id: '2',
    name: 'Sarah Jenkins',
    apt: '105C',
    time: 'Tomorrow, 9:00 AM',
    car: 'Silver Honda Civic',
    plate: 'XYZ-5678',
    type: 'URGENT'
  },
  {
    id: '3',
    name: 'David Miller',
    apt: '202A',
    time: 'Feb 15, 2:00 PM',
    car: 'Black Ford F-150',
    plate: 'TRK-9900',
    type: 'RESIDENT'
  },
  {
    id: '4',
    name: 'Elena Rodriguez',
    apt: '301D',
    time: 'Feb 16, 10:30 AM',
    car: 'Blue Toyota Rav4',
    plate: 'SUV-1122',
    type: 'GUEST'
  }
];

export default function ParkingManagement() {
  const router = useRouter();

  // State to track if the parking slot is "Lendable" (available for others)
  const [isLendable, setIsLendable] = useState(false);
  const [activeTab, setActiveTab] = useState('manage');
  /**
   * 2. HANDLER FUNCTION:
   * This manages the button clicks. In a real app, this is where you would
   * send data to your database (backend).
   */
  const handleAction = (type: 'Accept' | 'Decline', name: string) => {
    Alert.alert(type, `${type}ed request from ${name}`);
  };

  return (
<ScrollView showsVerticalScrollIndicator={false}>
  {activeTab === 'manage' ? (
    <>
      {/* ALL YOUR EXISTING CODE GOES HERE (Main Card, Pending Requests title, and the .map loop) */}
      <View style={styles.mainCard}>...</View>
      <View style={styles.sectionHeader}>...</View>
      {REQUESTS.map((item) => (...))}
    </>
  ) : (
    /* SHOW YOUR NEW COMPONENT HERE */
    <ParkingFinding />
  )}
  <View style={{ height: 40 }} />
</ScrollView>

        {/* BLUE HEADER: The top part of the app with the title */}
      <View style={styles.blueHeader}>
        <View style={styles.topNav}>
          <TouchableOpacity onPress={() => router.back()}>
             <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Parking</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* TAB SWITCHER TOGGLE */}
        <View style={styles.tabContainer}>
          <TouchableOpacity

                style={[styles.tabButton, activeTab === 'manage' && styles.activeTabStyle]}
                 onPress={() => setActiveTab('manage')}
               >
                 <Text style={[styles.tabText, activeTab === 'manage' && styles.activeTabText]}>Manage</Text>
               </TouchableOpacity>

               <TouchableOpacity
                 style={[styles.tabButton, activeTab === 'find' && styles.activeTabStyle]}
                 onPress={() => setActiveTab('find')}
               >
                 <Text style={[styles.tabText, activeTab === 'find' && styles.activeTabText]}>Find Slot</Text>
               </TouchableOpacity>
             </View>
             {/* ---------------------------------- */}
           </View>

        {/* MAIN SLOT CARD: Shows your specific parking slot (P-A12) */}
        <View style={styles.mainCard}>
          <View style={styles.slotRow}>
            <View style={styles.iconBox}>
               <Ionicons name="car-outline" size={28} color="#3498DB" />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.slotId}>Slot P-A12</Text>
              <Text style={styles.statusText}>
                {/* Dynamic text color changes based on the switch state */}
                STATUS: <Text style={{ color: isLendable ? '#2ECC71' : '#E74C3C', fontWeight: 'bold' }}>
                  {isLendable ? 'LENDABLE' : 'OCCUPIED'}
                </Text>
              </Text>
            </View>
            <Switch
              value={isLendable}
              onValueChange={setIsLendable}
              trackColor={{ false: "#D1D1D1", true: "#2ECC71" }}
            />
          </View>

          <View style={styles.infoBox}>
             <Ionicons name="information-circle" size={20} color="#3498DB" />
             <Text style={styles.infoText}>
               {isLendable
                 ? "Your slot is now visible to other residents for requests."
                 : "Switch toggle to 'Lendable' to allow others to use your slot."}
             </Text>
          </View>
        </View>

        {/* SECTION TITLE: Dynamic count based on the array length */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Requests</Text>
            <View style={styles.countBadge}><Text style={styles.countText}>{REQUESTS.length}</Text></View>
        </View>

        {/** * 3. THE LOOP (.map):
         * This takes the REQUESTS array and creates a UI Card for every person.
         */}
        {REQUESTS.map((item) => (
          <View key={item.id} style={styles.requestCard}>
            <View style={styles.userRow}>
              {/* Profile Placeholder Icon */}
              <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={20} color="#fff" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userSub}>Apt {item.apt} • {item.time}</Text>
              </View>
              {/* Dynamic Badge: Changes color if the request is "URGENT" */}
              <View style={[styles.typeBadge, item.type === 'URGENT' && styles.urgentBadge]}>
                <Text style={[styles.typeText, item.type === 'URGENT' && styles.urgentText]}>
                  {item.type}
                </Text>
              </View>
            </View>

            {/* Car & License Plate Info */}
            <View style={styles.carDetails}>
              <View style={styles.carRow}>
                  <Ionicons name="car-sport" size={16} color="#7F8C8D" />
                  <Text style={styles.carText}>{item.car}</Text>
              </View>
              <View style={styles.carRow}>
                  <Ionicons name="card" size={16} color="#7F8C8D" />
                  <Text style={styles.carText}>{item.plate}</Text>
              </View>
            </View>

            {/* Action Buttons: Accept or Decline */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                  style={styles.declineBtn}
                  onPress={() => handleAction('Decline', item.name)}
              >
                  <Text style={styles.declineBtnText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                  style={styles.acceptBtn}
                  onPress={() => handleAction('Accept', item.name)}
              >
                  <Text style={styles.acceptBtnText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Bottom padding to ensure content isn't cut off by the nav bar */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  blueHeader: { backgroundColor: '#3498DB', padding: 20, paddingBottom: 50 },
  topNav: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  headerSub: { color: '#E0E0E0', fontSize: 13, marginTop: 5, textAlign: 'center' },
  mainCard: {
    backgroundColor: '#fff', marginHorizontal: 20, marginTop: -30,
    borderRadius: 15, padding: 20, elevation: 4, shadowColor: '#000',
    shadowOpacity: 0.1, shadowRadius: 8, marginBottom: 10
  },
  slotRow: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 45, height: 45, backgroundColor: '#EBF5FB', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  slotId: { fontSize: 17, fontWeight: 'bold', color: '#2C3E50' },
  statusText: { fontSize: 11, color: '#95A5A6', marginTop: 2 },
  infoBox: { flexDirection: 'row', backgroundColor: '#F0F7FD', padding: 12, borderRadius: 10, marginTop: 15 },
  infoText: { flex: 1, fontSize: 12, color: '#34495E', marginLeft: 10, lineHeight: 18 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', margin: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#2C3E50' },
  countBadge: { backgroundColor: '#E74C3C', marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  requestCard: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 15, padding: 15, marginBottom: 15, elevation: 2 },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#BDC3C7', justifyContent: 'center', alignItems: 'center' },
  userName: { fontWeight: 'bold', fontSize: 15, color: '#2C3E50' },
  userSub: { fontSize: 11, color: '#95A5A6' },
  typeBadge: { backgroundColor: '#EBF5FB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  typeText: { fontSize: 10, color: '#3498DB', fontWeight: 'bold' },
  urgentBadge: { backgroundColor: '#FDEDEC' },
  urgentText: { color: '#E74C3C' },
  carDetails: { backgroundColor: '#F8F9FA', padding: 10, borderRadius: 8, marginVertical: 12 },
  carRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  carText: { fontSize: 12, color: '#34495E', marginLeft: 8 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  declineBtn: { flex: 0.48, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#DCDDE1' },
  declineBtnText: { color: '#7F8C8D', fontWeight: '600' },
  acceptBtn: { flex: 0.48, backgroundColor: '#2ECC71', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  acceptBtnText: { color: '#fff', fontWeight: '600' }
});

tabContainer: {
  flexDirection: 'row',
  backgroundColor: 'rgba(255, 255, 255, 0.2)', // Semi-transparent white
  borderRadius: 10,
  marginTop: 15,
  padding: 4,
},
tabButton: {
  flex: 1,
  paddingVertical: 8,
  alignItems: 'center',
  borderRadius: 8,
},
activeTabStyle: {
  backgroundColor: '#fff', // Solid white for active tab
},
tabText: {
  color: '#E0E0E0',
  fontWeight: '600',
},
activeTabText: {
  color: '#3498DB', // Blue text for active tab
},