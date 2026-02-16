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