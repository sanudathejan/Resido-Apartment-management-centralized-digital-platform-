/**
 * Status Badge Component
 * Display status with color coding
 */

import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';

type StatusType = 'pending' | 'success' | 'warning' | 'error' | 'info' | 'default';

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  style?: ViewStyle;
}

export default function StatusBadge({ status, type, style }: StatusBadgeProps) {
  const getType = (): StatusType => {
    if (type) return type;
    
    const statusLower = status.toLowerCase();
    if (['completed', 'paid', 'approved', 'active', 'checked_in'].includes(statusLower)) {
      return 'success';
    }
    if (['pending', 'in_progress', 'processing'].includes(statusLower)) {
      return 'pending';
    }
    if (['overdue', 'urgent', 'high'].includes(statusLower)) {
      return 'warning';
    }
    if (['cancelled', 'rejected', 'failed', 'expired'].includes(statusLower)) {
      return 'error';
    }
    return 'default';
  };

  const getColors = () => {
    switch (getType()) {
      case 'success':
        return { bg: '#DCFCE7', text: '#166534' };
      case 'pending':
        return { bg: '#FEF3C7', text: '#92400E' };
      case 'warning':
        return { bg: '#FFEDD5', text: '#C2410C' };
      case 'error':
        return { bg: '#FEE2E2', text: '#991B1B' };
      case 'info':
        return { bg: '#DBEAFE', text: '#1E40AF' };
      default:
        return { bg: Colors.gray[100], text: Colors.gray[600] };
    }
  };

  const colors = getColors();

  return (
    <View style={[styles.badge, { backgroundColor: colors.bg }, style]}>
      <Text style={[styles.text, { color: colors.text }]}>
        {status.replace(/_/g, ' ')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});
