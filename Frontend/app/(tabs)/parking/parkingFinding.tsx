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