/**
 * Animated Splash Screen
 * Shows the Resiido logo with a fade-in + scale animation
 * before redirecting to Welcome or Home based on auth state
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
    Image,
    Text,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

const { width, height } = Dimensions.get('window');

const COLORS = {
    background: '#F4F7FB',
    primary: '#2563EB',
    textLight: '#64748B',
};

export default function SplashScreen() {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();

    // Animations
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.6)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const bgOpacity = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Start animation sequence
        Animated.sequence([
            // 1. Logo fades in + scales up
            Animated.parallel([
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.spring(logoScale, {
                    toValue: 1,
                    friction: 6,
                    tension: 40,
                    useNativeDriver: true,
                }),
            ]),
            // 2. Tagline fades in
            Animated.timing(taglineOpacity, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            // 3. Short pause
            Animated.delay(600),
        ]).start(() => {
            // Navigate after animation
            if (!isLoading) {
                if (isAuthenticated) {
                    router.replace('/(tabs)');
                } else {
                    router.replace('/welcome');
                }
            }
        });
    }, [isLoading, isAuthenticated]);

    // If auth is still loading after animation, wait for it
    useEffect(() => {
        if (!isLoading) {
            // Auth loaded — animations will handle navigation
        }
    }, [isLoading]);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            <Animated.View
                style={[
                    styles.logoContainer,
                    {
                        opacity: logoOpacity,
                        transform: [{ scale: logoScale }],
                    },
                ]}
            >
                <Image
                    source={require('../assets/images/ResiiDo_logo_nobg.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>

            <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
                Smart living, simplified
            </Animated.Text>

            {/* Loading dots */}
            <Animated.View style={[styles.loadingContainer, { opacity: taglineOpacity }]}>
                <View style={styles.dot} />
                <View style={[styles.dot, styles.dotMiddle]} />
                <View style={styles.dot} />
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: width * 0.45,
        height: width * 0.45,
    },
    tagline: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.textLight,
        marginTop: 12,
        letterSpacing: 0.3,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 40,
        gap: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        opacity: 0.3,
    },
    dotMiddle: {
        opacity: 0.6,
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});
