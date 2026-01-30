/**
 * Maintenance Screen
 * Submit and track maintenance requests
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, InputField, StatusBadge, EmptyState, LoadingSpinner } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { maintenanceService } from '@/services';
import { MaintenanceRequest, MaintenanceStatus } from '@/types';

export default function MaintenanceScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'new' | 'history'>('new');
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    { value: 'Plumbing', icon: 'water-outline' },
    { value: 'Electrical', icon: 'flash-outline' },
    { value: 'HVAC', icon: 'thermometer-outline' },
    { value: 'Appliance', icon: 'hardware-chip-outline' },
    { value: 'Structural', icon: 'home-outline' },
    { value: 'Pest Control', icon: 'bug-outline' },
    { value: 'Cleaning', icon: 'sparkles-outline' },
    { value: 'Other', icon: 'ellipsis-horizontal-outline' },
  ];

  const priorities = [
    { value: 'LOW', label: 'Low', color: Colors.info },
    { value: 'MEDIUM', label: 'Medium', color: Colors.warning },
    { value: 'HIGH', label: 'High', color: Colors.accent },
    { value: 'URGENT', label: 'Urgent', color: Colors.error },
  ];

  // Mock data
  const mockRequests: MaintenanceRequest[] = [
    {
      id: 1,
      title: 'Leaking faucet in bathroom',
      description: 'The bathroom faucet has been leaking for 2 days. Water dripping constantly.',
      status: 'IN_PROGRESS',
      category: 'Plumbing',
      priority: 'MEDIUM',
      resident: user!,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 2,
      title: 'AC not cooling properly',
      description: 'Air conditioner is running but not cooling the room effectively.',
      status: 'PENDING',
      category: 'HVAC',
      priority: 'HIGH',
      resident: user!,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 3,
      title: 'Broken light fixture',
      description: 'Kitchen ceiling light stopped working. Changed bulb but still not working.',
      status: 'COMPLETED',
      category: 'Electrical',
      priority: 'LOW',
      resident: user!,
      createdAt: new Date(Date.now() - 604800000).toISOString(),
    },
  ];

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      // Use mock data for demo
      setRequests(mockRequests);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRequests();
    setRefreshing(false);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = 'Title is required';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.category) newErrors.category = 'Please select a category';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Request Submitted',
        'Your maintenance request has been submitted successfully. We will get back to you soon.',
        [
          {
            text: 'OK',
            onPress: () => {
              setForm({ title: '', description: '', category: '', priority: 'MEDIUM' });
              setActiveTab('history');
              loadRequests();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to submit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: MaintenanceStatus): string => {
    switch (status) {
      case 'PENDING':
        return Colors.warning;
      case 'IN_PROGRESS':
        return Colors.info;
      case 'COMPLETED':
        return Colors.success;
      case 'CANCELLED':
        return Colors.error;
      default:
        return Colors.gray[400];
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <LinearGradient
        colors={['#8B5CF6', '#6366F1'] as [string, string, ...string[]]}
        style={styles.header}
      >
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Maintenance</Text>
          <View style={styles.placeholder} />
        </View>
        <Text style={styles.headerSubtitle}>Submit and track repair requests</Text>
      </LinearGradient>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('new')}
          style={[styles.tab, activeTab === 'new' && styles.tabActive]}
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={activeTab === 'new' ? '#8B5CF6' : Colors.text.secondary}
          />
          <Text style={[styles.tabText, activeTab === 'new' && styles.tabTextActive]}>
            New Request
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('history')}
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
        >
          <Ionicons
            name="list-outline"
            size={20}
            color={activeTab === 'history' ? '#8B5CF6' : Colors.text.secondary}
          />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            My Requests ({requests.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          activeTab === 'history' ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        {activeTab === 'new' ? (
          // New Request Form
          <>
            <Card style={styles.formCard}>
              <Text style={styles.formLabel}>Issue Title *</Text>
              <InputField
                placeholder="Brief description of the issue"
                value={form.title}
                onChangeText={(value) => setForm((prev) => ({ ...prev, title: value }))}
                icon="create-outline"
                error={errors.title}
              />

              <Text style={styles.formLabel}>Category *</Text>
              <View style={styles.categoryGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.value}
                    onPress={() => {
                      setForm((prev) => ({ ...prev, category: cat.value }));
                      if (errors.category) setErrors((prev) => ({ ...prev, category: '' }));
                    }}
                    style={[
                      styles.categoryItem,
                      form.category === cat.value && styles.categoryItemActive,
                    ]}
                  >
                    <Ionicons
                      name={cat.icon as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={form.category === cat.value ? Colors.white : '#8B5CF6'}
                    />
                    <Text
                      style={[
                        styles.categoryText,
                        form.category === cat.value && styles.categoryTextActive,
                      ]}
                    >
                      {cat.value}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.category && <Text style={styles.errorText}>{errors.category}</Text>}

              <Text style={styles.formLabel}>Priority</Text>
              <View style={styles.priorityContainer}>
                {priorities.map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    onPress={() => setForm((prev) => ({ ...prev, priority: p.value as any }))}
                    style={[
                      styles.priorityItem,
                      form.priority === p.value && { backgroundColor: `${p.color}15`, borderColor: p.color },
                    ]}
                  >
                    <View style={[styles.priorityDot, { backgroundColor: p.color }]} />
                    <Text
                      style={[
                        styles.priorityText,
                        form.priority === p.value && { color: p.color, fontWeight: '600' },
                      ]}
                    >
                      {p.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.formLabel}>Description *</Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Provide detailed information about the issue..."
                  value={form.description}
                  onChangeText={(value) => setForm((prev) => ({ ...prev, description: value }))}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  placeholderTextColor={Colors.gray[400]}
                />
              </View>
              {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}

              <Button
                title="Submit Request"
                onPress={handleSubmit}
                loading={submitting}
                gradient
                size="large"
                style={styles.submitButton}
                icon={<Ionicons name="send" size={20} color={Colors.white} />}
              />
            </Card>
          </>
        ) : (
          // Request History
          <>
            {loading ? (
              <LoadingSpinner message="Loading requests..." />
            ) : requests.length === 0 ? (
              <EmptyState
                icon="construct-outline"
                title="No Requests"
                message="You haven't submitted any maintenance requests yet."
                actionLabel="Submit a Request"
                onAction={() => setActiveTab('new')}
              />
            ) : (
              requests.map((request) => (
                <Card key={request.id} style={styles.requestCard} variant="elevated">
                  <View style={styles.requestHeader}>
                    <View
                      style={[
                        styles.statusIndicator,
                        { backgroundColor: getStatusColor(request.status) },
                      ]}
                    />
                    <View style={styles.requestInfo}>
                      <Text style={styles.requestTitle}>{request.title}</Text>
                      <Text style={styles.requestDate}>
                        Submitted: {formatDate(request.createdAt || new Date().toISOString())}
                      </Text>
                    </View>
                    <StatusBadge status={request.status} />
                  </View>

                  <Text style={styles.requestDescription} numberOfLines={2}>
                    {request.description}
                  </Text>

                  <View style={styles.requestMeta}>
                    <View style={styles.metaItem}>
                      <Ionicons name="folder-outline" size={14} color={Colors.text.secondary} />
                      <Text style={styles.metaText}>{request.category}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="flag-outline" size={14} color={Colors.text.secondary} />
                      <Text style={styles.metaText}>{request.priority}</Text>
                    </View>
                  </View>

                  {request.status === 'PENDING' && (
                    <TouchableOpacity style={styles.cancelButton}>
                      <Text style={styles.cancelText}>Cancel Request</Text>
                    </TouchableOpacity>
                  )}
                </Card>
              ))
            )}
          </>
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
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  placeholder: {
    width: 40,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
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
    backgroundColor: '#8B5CF615',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: '#8B5CF6',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  formCard: {
    padding: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 10,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryItem: {
    width: '23%',
    aspectRatio: 1,
    backgroundColor: '#8B5CF615',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  categoryItemActive: {
    backgroundColor: '#8B5CF6',
  },
  categoryText: {
    fontSize: 10,
    color: Colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  categoryTextActive: {
    color: Colors.white,
  },
  priorityContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  priorityItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gray[200],
    backgroundColor: Colors.gray[50],
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  textAreaContainer: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.gray[200],
    marginBottom: 10,
  },
  textArea: {
    padding: 14,
    fontSize: 15,
    color: Colors.text.primary,
    minHeight: 120,
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: -8,
    marginBottom: 12,
    marginLeft: 4,
  },
  submitButton: {
    marginTop: 10,
  },
  requestCard: {
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  statusIndicator: {
    width: 4,
    height: 40,
    borderRadius: 2,
    marginRight: 12,
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  requestDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  requestMeta: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.gray[100],
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  cancelButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  cancelText: {
    fontSize: 13,
    color: Colors.error,
    fontWeight: '600',
  },
});
