/**
 * Gradient Background Component
 * Modern gradient background for screens
 */

import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';

interface GradientBackgroundProps {
  children: React.ReactNode;
  colors?: string[];
  style?: ViewStyle;
  variant?: 'primary' | 'secondary' | 'dark' | 'welcome' | 'header';
}

export default function GradientBackground({
  children,
  colors,
  style,
  variant = 'primary',
}: GradientBackgroundProps) {
  const gradientColors = colors || Colors.gradients[variant] || Colors.gradients.primary;

  return (
    <LinearGradient
      colors={gradientColors as [string, string, ...string[]]}
      style={[styles.container, style]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
