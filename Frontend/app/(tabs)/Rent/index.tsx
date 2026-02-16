/**
 * Rent & Payments Screen
 * View payment history and pending payments
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Card, Button, StatusBadge, EmptyState, LoadingSpinner } from '@/components/ui';
import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { paymentService } from '@/services';
import { Payment } from '@/types';

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
        return Colors.primary;
      case 'PARKING':
        return Colors.secondary;
      case 'UTILITY':
        return Colors.accent;
      case 'LATE_FEE':
        return Colors.error;
      default:
        return Colors.info;
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
    return <LoadingSpinner fullScreen message="Loading payments..." />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Summary */}
      <LinearGradient
        colors={['#10B981', '#059669'] as [string, string, ...string[]]}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Rent & Payments</Text>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Pending</Text>
            <Text style={styles.summaryAmount}>{formatCurrency(summary.totalPending)}</Text>
            <Text style={styles.summaryCount}>{summary.pendingCount} payments</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardLight]}>
            <Text style={[styles.summaryLabel, styles.textDark]}>Paid (This Year)</Text>
            <Text style={[styles.summaryAmount, styles.textDark]}>{formatCurrency(summary.totalPaid)}</Text>
            <Text style={[styles.summaryCount, styles.textDark]}>{summary.paidCount} payments</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          onPress={() => setActiveTab('pending')}
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            Pending ({pendingPayments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('history')}
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            Payment History
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
        {activeTab === 'pending' ? (
          // Pending Payments
          <>
            {pendingPayments.length === 0 ? (
              <EmptyState
                icon="checkmark-circle-outline"
                title="All Caught Up!"
                message="You have no pending payments. Great job!"
              />
            ) : (
              <>
                {pendingPayments.map((payment) => (
                  <Card key={payment.id} style={styles.paymentCard} variant="elevated">
                    <View style={styles.paymentHeader}>
                      <View
                        style={[
                          styles.paymentIcon,
                          { backgroundColor: `${getPaymentColor(payment.type)}15` },
                        ]}
                      >
                        <Ionicons
                          name={getPaymentIcon(payment.type)}
                          size={24}
                          color={getPaymentColor(payment.type)}
                        />
                      </View>
                      <View style={styles.paymentInfo}>
                        <Text style={styles.paymentType}>{payment.type}</Text>
                        <Text style={styles.paymentDue}>
                          Due: {formatDate(payment.dueDate)}
                        </Text>
                      </View>
                      <View style={styles.paymentAmountContainer}>
                        <Text style={styles.paymentAmount}>{formatCurrency(payment.amount)}</Text>
                      </View>
                    </View>

                    <Button
                      title="Pay Now"
                      onPress={() => {}}
                      variant="primary"
                      size="medium"
                      icon={<Ionicons name="card-outline" size={18} color={Colors.white} />}
                    />
                  </Card>
                ))}

                {/* Pay All Button */}
                {pendingPayments.length > 1 && (
                  <Button
                    title={`Pay All (${formatCurrency(summary.totalPending)})`}
                    onPress={() => {}}
                    gradient
                    size="large"
                    icon={<Ionicons name="wallet-outline" size={20} color={Colors.white} />}
                    style={styles.payAllButton}
                  />
                )}
              </>
            )}
          </>
        ) : (
          // Payment History
          <>
            {paidPayments.length === 0 ? (
              <EmptyState
                icon="receipt-outline"
                title="No Payment History"
                message="Your payment history will appear here."
              />
            ) : (
              paidPayments.map((payment) => (
                <Card key={payment.id} style={styles.historyCard}>
                  <View style={styles.paymentHeader}>
                    <View
                      style={[
                        styles.paymentIcon,
                        { backgroundColor: `${getPaymentColor(payment.type)}15` },
                      ]}
                    >
                      <Ionicons
                        name={getPaymentIcon(payment.type)}
                        size={22}
                        color={getPaymentColor(payment.type)}
                      />
                    </View>
                    <View style={styles.paymentInfo}>
                      <Text style={styles.paymentType}>{payment.type}</Text>
                      <Text style={styles.paidDate}>
                        Paid: {formatDate(payment.paidDate || payment.dueDate)}
                      </Text>
                    </View>
                    <View style={styles.paymentAmountContainer}>
                      <Text style={styles.historyAmount}>{formatCurrency(payment.amount)}</Text>
                      <StatusBadge status="Paid" type="success" />
                    </View>
                  </View>
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 16,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
  },
  summaryCardLight: {
    backgroundColor: Colors.white,
  },
  summaryLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 4,
  },
  summaryCount: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  textDark: {
    color: Colors.text.primary,
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
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: `${Colors.success}10`,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text.secondary,
  },
  tabTextActive: {
    color: Colors.success,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  paymentCard: {
    marginBottom: 16,
  },
  historyCard: {
    marginBottom: 12,
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
    color: Colors.text.primary,
    textTransform: 'capitalize',
  },
  paymentDue: {
    fontSize: 13,
    color: Colors.warning,
    marginTop: 2,
  },
  paidDate: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  paymentAmountContainer: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text.primary,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  payAllButton: {
    marginTop: 8,
  },
});
