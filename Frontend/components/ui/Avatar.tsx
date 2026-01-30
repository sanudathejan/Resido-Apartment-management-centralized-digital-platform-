/**
 * Avatar Component
 * User profile picture or initials
 */

import React from 'react';
import { View, Text, Image, StyleSheet, ViewStyle, ImageStyle } from 'react-native';
import { Colors } from '@/constants/colors';

interface AvatarProps {
  source?: string;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  style?: ViewStyle;
}

export default function Avatar({ source, name, size = 'medium', style }: AvatarProps) {
  const dimensions = {
    small: { size: 32, fontSize: 12 },
    medium: { size: 48, fontSize: 18 },
    large: { size: 64, fontSize: 24 },
    xlarge: { size: 96, fontSize: 36 },
  };

  const { size: avatarSize, fontSize } = dimensions[size];

  const getInitials = (name?: string) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || '?';
  };

  const getBackgroundColor = (name?: string) => {
    const colors = [
      Colors.primary,
      Colors.secondary,
      Colors.accent,
      Colors.success,
      '#8B5CF6',
      '#EC4899',
      '#14B8A6',
    ];
    if (!name) return colors[0];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  if (source) {
    return (
      <Image
        source={{ uri: source }}
        style={[
          styles.avatar as ImageStyle,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          },
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatar,
        styles.initialsContainer,
        {
          width: avatarSize,
          height: avatarSize,
          borderRadius: avatarSize / 2,
          backgroundColor: getBackgroundColor(name),
        },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: {
    backgroundColor: Colors.gray[200],
  },
  initialsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.white,
    fontWeight: '600',
  },
});
