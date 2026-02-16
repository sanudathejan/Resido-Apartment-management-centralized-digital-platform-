import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const REQUESTS = [
  { id: '1', name: 'Marcus Thorne', apt: '402B', time: 'Today, 6:00 PM', car: 'White Tesla Model 3', plate: 'ABC-1234', type: 'GUEST' },
  { id: '2', name: 'Sarah Jenkins', apt: '105C', time: 'Tomorrow, 9:00 AM', car: 'Silver Honda Civic', plate: 'XYZ-5678', type: 'URGENT' },
  { id: '3', name: 'David Miller', apt: '202A', time: 'Feb 15, 2:00 PM', car: 'Black Ford F-150', plate: 'TRK-9900', type: 'RESIDENT' },
];

export default function ParkingManagement() {
  const router = useRouter();
  const [isLendable, setIsLendable] = useState(false);

  const handleAction = (type: 'Accept' | 'Decline', name: string) => {
    Alert.alert(type, `${type}ed request from ${name}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.blueHeader}>
          <View style={styles.topNav}>
            {/* If this is a tab, we don't need a back button, but kept for UI */}
            <TouchableOpacity onPress={() => router.replace('/')}>
               <Ionicons name="home-outline" size={24} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Manage My Parking</Text>
            <View style={{ width: 24 }} />
          </View>
          <Text style={styles.headerSub}>Control slot availability and requests</Text>
        </View>

        <View style={styles.mainCard}>
          <View style={styles.slotRow}>
            <View style={styles.iconBox}>
               <Ionicons name="car-outline" size={28} color="#3498DB" />
            </View>
            <View style={{ flex: 1, marginLeft: 15 }}>
              <Text style={styles.slotId}>Slot P-A12</Text>
              <Text style={styles.statusText}>
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
               {isLendable ? "Visible to others." : "Toggle 'Lendable' to share slot."}
             </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Requests</Text>
            <View style={styles.countBadge}><Text style={styles.countText}>{REQUESTS.length}</Text></View>
        </View>

        {REQUESTS.map((item) => (
          <View key={item.id} style={styles.requestCard}>
            <View style={styles.userRow}>
              <View style={styles.avatarPlaceholder}><Ionicons name="person" size={20} color="#fff" /></View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.userName}>{item.name}</Text>
                <Text style={styles.userSub}>Apt {item.apt} • {item.time}</Text>
              </View>
              <View style={[styles.typeBadge, item.type === 'URGENT' && styles.urgentBadge]}>
                <Text style={[styles.typeText, item.type === 'URGENT' && styles.urgentText]}>{item.type}</Text>
              </View>
            </View>
            <View style={styles.carDetails}>
                <Text style={styles.carText}><Ionicons name="car-sport" size={14}/> {item.car}</Text>
                <Text style={styles.carText}><Ionicons name="card" size={14}/> {item.plate}</Text>
            </View>
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.declineBtn} onPress={() => handleAction('Decline', item.name)}>
                  <Text style={styles.declineBtnText}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAction('Accept', item.name)}>
                  <Text style={styles.acceptBtnText}>Accept</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <View style={{ height: 100 }} />
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
    carText: { fontSize: 12, color: '#34495E', marginBottom: 4 },
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
    declineBtn: { flex: 0.48, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#DCDDE1' },
    declineBtnText: { color: '#7F8C8D', fontWeight: '600' },
    acceptBtn: { flex: 0.48, backgroundColor: '#2ECC71', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
    acceptBtnText: { color: '#fff', fontWeight: '600' }
  });