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
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { maintenanceService } from '@/services';
import { MaintenanceRequest, MaintenanceStatus } from '@/types';

const C = {
  bg: '#F4F7FB',
  primary: '#2563EB',
  primaryLight: '#EFF6FF',
  white: '#FFFFFF',
  textDark: '#1E293B',
  textLight: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  purple: '#7C3AED',
  purpleBg: '#F5F3FF',
};

const shadow = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
  android: {
    elevation: 3,
  },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
  },
}) as object;

const shadowSmall = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  android: {
    elevation: 2,
  },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
}) as object;

const shadowLarge = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  android: {
    elevation: 5,
  },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
}) as object;

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
    { value: 'LOW', label: 'Low', color: C.primary },
    { value: 'MEDIUM', label: 'Medium', color: C.warning },
    { value: 'HIGH', label: 'High', color: '#F97316' },
    { value: 'URGENT', label: 'Urgent', color: C.error },
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
        return C.warning;
      case 'IN_PROGRESS':
        return C.primary;
      case 'COMPLETED':
        return C.success;
      case 'CANCELLED':
        return C.error;
      default:
        return C.textMuted;
    }
  };

  const getStatusLabel = (status: MaintenanceStatus): string => {
    switch (status) {
      case 'PENDING':
        return 'Pending';
      case 'IN_PROGRESS':
        return 'In Progress';
      case 'COMPLETED':
        return 'Completed';
      case 'CANCELLED':
        return 'Cancelled';
      default:
        return status;
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
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, shadowSmall]}>
            <Ionicons name="arrow-back" size={20} color={C.textDark} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Maintenance</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('new')}
          style={[styles.tab, activeTab === 'new' && styles.tabActive]}
        >
          <Ionicons
            name="add-circle-outline"
            size={20}
            color={activeTab === 'new' ? C.purple : C.textLight}
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
            color={activeTab === 'history' ? C.purple : C.textLight}
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
            <View style={[styles.formCard, shadow]}>
              {/* Title Input */}
              <Text style={styles.formLabel}>Issue Title *</Text>
              <View
                style={[
                  styles.inputContainer,
                  errors.title ? styles.inputContainerError : null,
                ]}
              >
                <Ionicons
                  name="create-outline"
                  size={18}
                  color={C.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Brief description of the issue"
                  value={form.title}
                  onChangeText={(value) => {
                    setForm((prev) => ({ ...prev, title: value }));
                    if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                  }}
                  placeholderTextColor={C.textMuted}
                />
              </View>
              {errors.title ? <Text style={styles.errorText}>{errors.title}</Text> : null}

              {/* Category Grid */}
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
                      shadowSmall,
                      form.category === cat.value && styles.categoryItemActive,
                    ]}
                  >
                    <Ionicons
                      name={cat.icon as keyof typeof Ionicons.glyphMap}
                      size={24}
                      color={form.category === cat.value ? C.white : C.purple}
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
              {errors.category ? <Text style={styles.errorText}>{errors.category}</Text> : null}

              {/* Priority Selector */}
              <Text style={styles.formLabel}>Priority</Text>
              <View style={styles.priorityContainer}>
                {priorities.map((p) => (
                  <TouchableOpacity
                    key={p.value}
                    onPress={() => setForm((prev) => ({ ...prev, priority: p.value as any }))}
                    style={[
                      styles.priorityItem,
                      form.priority === p.value && {
                        backgroundColor: `${p.color}12`,
                        borderColor: p.color,
                      },
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

              {/* Description Textarea */}
              <Text style={styles.formLabel}>Description *</Text>
              <View
                style={[
                  styles.textAreaContainer,
                  errors.description ? styles.textAreaContainerError : null,
                ]}
              >
                <TextInput
                  style={styles.textArea}
                  placeholder="Provide detailed information about the issue..."
                  value={form.description}
                  onChangeText={(value) => {
                    setForm((prev) => ({ ...prev, description: value }));
                    if (errors.description)
                      setErrors((prev) => ({ ...prev, description: '' }));
                  }}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  placeholderTextColor={C.textMuted}
                />
              </View>
              {errors.description ? (
                <Text style={styles.errorText}>{errors.description}</Text>
              ) : null}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color={C.white} />
                ) : (
                  <>
                    <Ionicons name="send" size={18} color={C.white} />
                    <Text style={styles.submitButtonText}>Submit Request</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : (
          // Request History
          <>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={C.purple} />
                <Text style={styles.loadingText}>Loading requests...</Text>
              </View>
            ) : requests.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyCircle, shadowLarge]}>
                  <Ionicons name="construct-outline" size={40} color={C.purple} />
                </View>
                <Text style={styles.emptyTitle}>No Requests</Text>
                <Text style={styles.emptyMessage}>
                  You haven't submitted any maintenance requests yet.
                </Text>
                <TouchableOpacity
                  style={styles.emptyAction}
                  onPress={() => setActiveTab('new')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.emptyActionText}>Submit a Request</Text>
                </TouchableOpacity>
              </View>
            ) : (
              requests.map((request) => (
                <View key={request.id} style={[styles.requestCard, shadow]}>
                  <View
                    style={[
                      styles.statusBar,
                      { backgroundColor: getStatusColor(request.status) },
                    ]}
                  />
                  <View style={styles.requestContent}>
                    <View style={styles.requestHeader}>
                      <View style={styles.requestInfo}>
                        <Text style={styles.requestTitle}>{request.title}</Text>
                        <Text style={styles.requestDate}>
                          Submitted: {formatDate(request.createdAt || new Date().toISOString())}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: `${getStatusColor(request.status)}14` },
                        ]}
                      >
                        <View
                          style={[
                            styles.statusDot,
                            { backgroundColor: getStatusColor(request.status) },
                          ]}
                        />
                        <Text
                          style={[
                            styles.statusText,
                            { color: getStatusColor(request.status) },
                          ]}
                        >
                          {getStatusLabel(request.status)}
                        </Text>
                      </View>
                    </View>

                    <Text style={styles.requestDescription} numberOfLines={2}>
                      {request.description}
                    </Text>

                    <View style={styles.requestMeta}>
                      <View style={styles.metaItem}>
                        <Ionicons name="folder-outline" size={14} color={C.textLight} />
                        <Text style={styles.metaText}>{request.category}</Text>
                      </View>
                      <View style={styles.metaItem}>
                        <Ionicons name="flag-outline" size={14} color={C.textLight} />
                        <Text style={styles.metaText}>{request.priority}</Text>
                      </View>
                    </View>

                    {request.status === 'PENDING' && (
                      <TouchableOpacity style={styles.cancelButton} activeOpacity={0.6}>
                        <Text style={styles.cancelText}>Cancel Request</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
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
    backgroundColor: C.bg,
  },

  /* ---- Header ---- */
  header: {
    backgroundColor: C.bg,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.textDark,
  },
  placeholder: {
    width: 42,
  },

  /* ---- Tabs ---- */
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: C.white,
    paddingHorizontal: 8,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
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
    backgroundColor: C.purpleBg,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textLight,
  },
  tabTextActive: {
    color: C.purple,
  },

  /* ---- Scroll ---- */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  /* ---- Form Card ---- */
  formCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textDark,
    marginBottom: 10,
    marginTop: 4,
  },

  /* ---- Input ---- */
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    paddingHorizontal: 14,
    marginBottom: 6,
  },
  inputContainerError: {
    borderColor: C.error,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: C.textDark,
    paddingVertical: 14,
  },

  /* ---- Category Grid ---- */
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  categoryItem: {
    width: '22%' as any,
    aspectRatio: 1,
    backgroundColor: C.purpleBg,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  categoryItemActive: {
    backgroundColor: C.purple,
  },
  categoryText: {
    fontSize: 10,
    color: C.textLight,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  categoryTextActive: {
    color: C.white,
  },

  /* ---- Priority ---- */
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
    borderWidth: 1.5,
    borderColor: C.border,
    backgroundColor: C.white,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityText: {
    fontSize: 12,
    color: C.textLight,
  },

  /* ---- Textarea ---- */
  textAreaContainer: {
    backgroundColor: C.bg,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: C.border,
    marginBottom: 6,
  },
  textAreaContainerError: {
    borderColor: C.error,
  },
  textArea: {
    padding: 14,
    fontSize: 15,
    color: C.textDark,
    minHeight: 120,
  },

  /* ---- Errors ---- */
  errorText: {
    fontSize: 12,
    color: C.error,
    marginBottom: 12,
    marginLeft: 4,
  },

  /* ---- Submit Button ---- */
  submitButton: {
    backgroundColor: C.purple,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 14,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },

  /* ---- Loading ---- */
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 16,
  },
  loadingText: {
    fontSize: 14,
    color: C.textLight,
  },

  /* ---- Empty State ---- */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
  },
  emptyCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    color: C.textLight,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  emptyAction: {
    backgroundColor: C.purple,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  emptyActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.white,
  },

  /* ---- Request Cards ---- */
  requestCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    marginBottom: 14,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  statusBar: {
    width: 4,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  requestContent: {
    flex: 1,
    padding: 16,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  requestInfo: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textDark,
    marginBottom: 4,
  },
  requestDate: {
    fontSize: 12,
    color: C.textLight,
  },

  /* ---- Status Badge ---- */
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },

  /* ---- Request Body ---- */
  requestDescription: {
    fontSize: 14,
    color: C.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  requestMeta: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: C.textLight,
  },

  /* ---- Cancel ---- */
  cancelButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  cancelText: {
    fontSize: 13,
    color: C.error,
    fontWeight: '600',
  },
});
