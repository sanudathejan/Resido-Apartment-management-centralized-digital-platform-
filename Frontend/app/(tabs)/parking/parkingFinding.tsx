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