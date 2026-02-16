/**
 * Rent & Payments Screen
 * View payment history and pending payments
 * Modern 2026 Light Theme
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { paymentService } from '@/services';
import { Payment } from '@/types';

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
  successBg: '#ECFDF5',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  error: '#EF4444',
};

const shadow = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  android: {
    elevation: 3,
  },
  default: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
});

const shadowLg = Platform.select({
  ios: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
  android: {
    elevation: 5,
  },
  default: {
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
  },
});

export default function RentScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState({
    totalPending: 0,
    totalPaid: 0,
    pendingCount: 0,
    paidCount: 0,
  });

  // Mock data for demo
  const mockPayments: Payment[] = [
    {
      id: 1,
      amount: 25000,
      type: 'RENT',
      dueDate: '2026-02-01',
      isPaid: false,
      resident: user!,
    },
    {
      id: 2,
      amount: 2500,
      type: 'PARKING',
      dueDate: '2026-02-01',
      isPaid: false,
      resident: user!,
    },
    {
      id: 3,
      amount: 25000,
      type: 'RENT',
      dueDate: '2026-01-01',
      isPaid: true,
      paidDate: '2025-12-28',
      resident: user!,
    },
    {
      id: 4,
      amount: 2500,
      type: 'PARKING',
      dueDate: '2026-01-01',
      isPaid: true,
      paidDate: '2025-12-28',
      resident: user!,
    },
    {
      id: 5,
      amount: 5000,
      type: 'UTILITY',
      dueDate: '2025-12-15',
      isPaid: true,
      paidDate: '2025-12-14',
      resident: user!,
    },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Use mock data for demo
      setPayments(mockPayments);
      const pending = mockPayments.filter((p) => !p.isPaid);
      const paid = mockPayments.filter((p) => p.isPaid);
      setSummary({
        totalPending: pending.reduce((sum, p) => sum + p.amount, 0),
        totalPaid: paid.reduce((sum, p) => sum + p.amount, 0),
        pendingCount: pending.length,
        paidCount: paid.length,
      });
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const pendingPayments = payments.filter((p) => !p.isPaid);
  const paidPayments = payments.filter((p) => p.isPaid);

  const getPaymentIcon = (type: string): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'RENT':
        return 'home';
      case 'PARKING':
        return 'car';
      case 'UTILITY':
        return 'flash';
      case 'MAINTENANCE':
        return 'construct';
      case 'LATE_FEE':
        return 'alert-circle';
      default:
        return 'card';
    }
  };

  const getPaymentColor = (type: string): string => {
    switch (type) {
      case 'RENT':
        return C.primary;
      case 'PARKING':
        return '#8B5CF6';
      case 'UTILITY':
        return C.warning;
      case 'LATE_FEE':
        return C.error;
      case 'MAINTENANCE':
        return '#06B6D4';
      default:
        return C.textLight;
    }
  };

  const formatCurrency = (amount: number): string => {
    return `LKR ${amount.toLocaleString()}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={C.primary} />
        <Text style={styles.loadingText}>Loading payments...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Flat Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Rent & Payments</Text>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          {/* Pending Card - Warning Tinted */}
          <View style={[styles.summaryCard, styles.summaryCardPending, shadowLg]}>
            <View style={styles.summaryIconRow}>
              <View style={styles.summaryIconPending}>
                <Ionicons name="time-outline" size={16} color={C.warning} />
              </View>
            </View>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={styles.summaryAmount}>
              {formatCurrency(summary.totalPending)}
            </Text>
            <Text style={styles.summaryCount}>
              {summary.pendingCount} payment{summary.pendingCount !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Paid Card - Success Tinted */}
          <View style={[styles.summaryCard, styles.summaryCardPaid, shadowLg]}>
            <View style={styles.summaryIconRow}>
              <View style={styles.summaryIconPaid}>
                <Ionicons name="checkmark-circle-outline" size={16} color={C.success} />
              </View>
            </View>
            <Text style={styles.summaryLabel}>Paid (This Year)</Text>
            <Text style={styles.summaryAmount}>
              {formatCurrency(summary.totalPaid)}
            </Text>
            <Text style={styles.summaryCount}>
              {summary.paidCount} payment{summary.paidCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('pending')}
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="time-outline"
            size={16}
            color={activeTab === 'pending' ? C.success : C.textMuted}
            style={styles.tabIcon}
          />
          <Text
            style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}
          >
            Pending ({pendingPayments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('history')}
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="receipt-outline"
            size={16}
            color={activeTab === 'history' ? C.success : C.textMuted}
            style={styles.tabIcon}
          />
          <Text
            style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}
          >
            Payment History
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={C.primary}
            colors={[C.primary]}
          />
        }
      >
        {activeTab === 'pending' ? (
          // Pending Payments
          <>
            {pendingPayments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconCircle, shadowLg]}>
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={48}
                    color={C.success}
                  />
                </View>
                <Text style={styles.emptyTitle}>All Caught Up!</Text>
                <Text style={styles.emptyMessage}>
                  You have no pending payments. Great job!
                </Text>
              </View>
            ) : (
              <>
                {pendingPayments.map((payment) => {
                  const color = getPaymentColor(payment.type);
                  return (
                    <View key={payment.id} style={[styles.paymentCard, shadow]}>
                      <View style={styles.paymentHeader}>
                        <View
                          style={[
                            styles.paymentIcon,
                            { backgroundColor: `${color}14` },
                          ]}
                        >
                          <Ionicons
                            name={getPaymentIcon(payment.type)}
                            size={24}
                            color={color}
                          />
                        </View>
                        <View style={styles.paymentInfo}>
                          <Text style={styles.paymentType}>{payment.type}</Text>
                          <Text style={styles.paymentDue}>
                            Due: {formatDate(payment.dueDate)}
                          </Text>
                        </View>
                        <View style={styles.paymentAmountContainer}>
                          <Text style={styles.paymentAmount}>
                            {formatCurrency(payment.amount)}
                          </Text>
                        </View>
                      </View>

                      <TouchableOpacity
                        style={styles.payNowButton}
                        onPress={() => {}}
                        activeOpacity={0.8}
                      >
                        <Ionicons
                          name="card-outline"
                          size={18}
                          color={C.white}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.payNowText}>Pay Now</Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}

                {/* Pay All Button */}
                {pendingPayments.length > 1 && (
                  <TouchableOpacity
                    style={[styles.payAllButton, shadow]}
                    onPress={() => {}}
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="wallet-outline"
                      size={20}
                      color={C.white}
                      style={{ marginRight: 10 }}
                    />
                    <Text style={styles.payAllText}>
                      Pay All ({formatCurrency(summary.totalPending)})
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}
          </>
        ) : (
          // Payment History
          <>
            {paidPayments.length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconCircle, shadowLg]}>
                  <Ionicons
                    name="receipt-outline"
                    size={48}
                    color={C.textMuted}
                  />
                </View>
                <Text style={styles.emptyTitle}>No Payment History</Text>
                <Text style={styles.emptyMessage}>
                  Your payment history will appear here.
                </Text>
              </View>
            ) : (
              paidPayments.map((payment) => {
                const color = getPaymentColor(payment.type);
                return (
                  <View key={payment.id} style={[styles.historyCard, shadow]}>
                    <View style={styles.historyRow}>
                      <View
                        style={[
                          styles.historyIcon,
                          { backgroundColor: `${color}14` },
                        ]}
                      >
                        <Ionicons
                          name={getPaymentIcon(payment.type)}
                          size={20}
                          color={color}
                        />
                      </View>
                      <View style={styles.historyInfo}>
                        <Text style={styles.historyType}>{payment.type}</Text>
                        <Text style={styles.historyDate}>
                          Paid: {formatDate(payment.paidDate || payment.dueDate)}
                        </Text>
                      </View>
                      <View style={styles.historyRight}>
                        <Text style={styles.historyAmount}>
                          {formatCurrency(payment.amount)}
                        </Text>
                        <View style={styles.statusBadge}>
                          <Ionicons
                            name="checkmark-circle"
                            size={12}
                            color={C.success}
                            style={{ marginRight: 4 }}
                          />
                          <Text style={styles.statusText}>Paid</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  /* Loading */
  loadingContainer: {
    flex: 1,
    backgroundColor: C.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: C.textLight,
    fontWeight: '500',
  },

  /* Root */
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },

  /* Header */
  header: {
    backgroundColor: C.bg,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 18,
    letterSpacing: -0.3,
  },

  /* Summary Cards */
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
  },
  summaryCardPending: {
    borderTopWidth: 3,
    borderTopColor: C.warning,
  },
  summaryCardPaid: {
    borderTopWidth: 3,
    borderTopColor: C.success,
  },
  summaryIconRow: {
    marginBottom: 10,
  },
  summaryIconPending: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: C.warningBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIconPaid: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: C.successBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: C.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 19,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 12,
    color: C.textLight,
  },

  /* Tabs */
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: C.white,
    paddingHorizontal: 12,
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
    paddingVertical: 12,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: C.successBg,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: C.textMuted,
  },
  tabTextActive: {
    color: C.success,
  },

  /* Scroll */
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },

  /* Payment Card (Pending) */
  paymentCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: '600',
    color: C.textDark,
    textTransform: 'capitalize',
  },
  paymentDue: {
    fontSize: 13,
    color: C.warning,
    fontWeight: '500',
    marginTop: 3,
  },
  paymentAmountContainer: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: C.textDark,
  },

  /* Pay Now Button */
  payNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.primary,
    borderRadius: 14,
    paddingVertical: 14,
  },
  payNowText: {
    fontSize: 15,
    fontWeight: '700',
    color: C.white,
  },

  /* Pay All Button */
  payAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: C.success,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 8,
  },
  payAllText: {
    fontSize: 16,
    fontWeight: '700',
    color: C.white,
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: C.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
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
    maxWidth: 260,
  },

  /* History Card */
  historyCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIcon: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  historyInfo: {
    flex: 1,
  },
  historyType: {
    fontSize: 15,
    fontWeight: '600',
    color: C.textDark,
    textTransform: 'capitalize',
  },
  historyDate: {
    fontSize: 12,
    color: C.textLight,
    marginTop: 2,
  },
  historyRight: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: C.textDark,
    marginBottom: 4,
  },

  /* Status Badge */
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: C.successBg,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: C.success,
  },
});
