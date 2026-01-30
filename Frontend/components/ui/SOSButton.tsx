/**
 * SOS Button Component
 * Emergency button for immediate assistance
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
  Vibration,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';

interface SOSButtonProps {
  onActivate: () => Promise<void>;
  onCancel?: () => void;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export default function SOSButton({
  onActivate,
  onCancel,
  disabled = false,
  size = 'medium',
}: SOSButtonProps) {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const dimensions = {
    small: { size: 80, iconSize: 32, fontSize: 14 },
    medium: { size: 120, iconSize: 48, fontSize: 18 },
    large: { size: 160, iconSize: 64, fontSize: 22 },
  };

  const { size: buttonSize, iconSize, fontSize } = dimensions[size];

  useEffect(() => {
    if (isActive) {
      // Pulse animation
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      
      // Vibration pattern
      const pattern = [0, 500, 200, 500];
      Vibration.vibrate(pattern, true);

      return () => {
        pulse.stop();
        Vibration.cancel();
      };
    }
  }, [isActive]);

  const handlePress = () => {
    if (disabled || isLoading) return;

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (isActive) {
      Alert.alert(
        'Cancel Emergency',
        'Are you sure you want to cancel the emergency alert?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes, Cancel',
            style: 'destructive',
            onPress: () => {
              setIsActive(false);
              onCancel?.();
            },
          },
        ]
      );
    } else {
      Alert.alert(
        '⚠️ Emergency Alert',
        'This will immediately alert security, neighbors, and building management. Continue?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'ACTIVATE SOS',
            style: 'destructive',
            onPress: async () => {
              setIsLoading(true);
              try {
                await onActivate();
                setIsActive(true);
              } catch (error) {
                Alert.alert('Error', 'Failed to send emergency alert. Please try again.');
              } finally {
                setIsLoading(false);
              }
            },
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.pulseRing,
          {
            width: buttonSize + 40,
            height: buttonSize + 40,
            borderRadius: (buttonSize + 40) / 2,
            transform: [{ scale: pulseAnim }],
            opacity: isActive ? 0.3 : 0,
          },
        ]}
      />
      
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={handlePress}
          disabled={disabled}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={
              isActive
                ? ['#FF4444', '#CC0000']
                : disabled
                ? [Colors.gray[300], Colors.gray[400]]
                : (Colors.gradients.sos as [string, string, ...string[]])
            }
            style={[
              styles.button,
              {
                width: buttonSize,
                height: buttonSize,
                borderRadius: buttonSize / 2,
              },
            ]}
          >
            <Ionicons
              name={isActive ? 'close' : 'warning'}
              size={iconSize}
              color={Colors.white}
            />
            <Text style={[styles.buttonText, { fontSize }]}>
              {isLoading ? 'Sending...' : isActive ? 'CANCEL' : 'SOS'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
      
      {!isActive && (
        <Text style={styles.helpText}>Press for Emergency Assistance</Text>
      )}
      
      {isActive && (
        <Text style={styles.activeText}>
          🚨 Alert Sent! Help is on the way
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  pulseRing: {
    position: 'absolute',
    backgroundColor: Colors.sos,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.sos,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonText: {
    color: Colors.white,
    fontWeight: '800',
    marginTop: 4,
  },
  helpText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.text.secondary,
  },
  activeText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.sos,
  },
});
