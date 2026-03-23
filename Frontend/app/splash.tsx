/**
 * Animated Splash Screen — 10 seconds
 * Beautiful brand reveal animation
 * ALWAYS navigates to the Welcome screen (never directly to home)
 */

import React, { useEffect, useRef } from 'react';
import {
    View,
    StyleSheet,
    Animated,
    Dimensions,
    StatusBar,
    Image,
    Easing,
} from 'react-native';
import { useRouter } from 'expo-router';

const { width, height } = Dimensions.get('window');

const COLORS = {
    background: '#F4F7FB',
    primary: '#2563EB',
    primaryLight: '#EFF6FF',
    textDark: '#1E293B',
    textLight: '#64748B',
    textMuted: '#94A3B8',
    accent: '#7C3AED',
};

export default function SplashScreen() {
    const router = useRouter();

    // Animation values
    const bgScale = useRef(new Animated.Value(1.2)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const logoScale = useRef(new Animated.Value(0.3)).current;
    const logoRotate = useRef(new Animated.Value(0)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const taglineTranslateY = useRef(new Animated.Value(20)).current;
    const subtitleOpacity = useRef(new Animated.Value(0)).current;
    const subtitleTranslateY = useRef(new Animated.Value(15)).current;
    const dotsOpacity = useRef(new Animated.Value(0)).current;
    const dot1Scale = useRef(new Animated.Value(0.5)).current;
    const dot2Scale = useRef(new Animated.Value(0.5)).current;
    const dot3Scale = useRef(new Animated.Value(0.5)).current;
    const ringScale = useRef(new Animated.Value(0)).current;
    const ringOpacity = useRef(new Animated.Value(0.6)).current;
    const ring2Scale = useRef(new Animated.Value(0)).current;
    const ring2Opacity = useRef(new Animated.Value(0.4)).current;
    const fadeOut = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        // Phase 1 (0-1.5s): Background settle + pulsing ring
        const phase1 = Animated.parallel([
            Animated.timing(bgScale, {
                toValue: 1,
                duration: 1500,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: true,
            }),
            // Ring pulse 1
            Animated.sequence([
                Animated.delay(300),
                Animated.parallel([
                    Animated.timing(ringScale, {
                        toValue: 1.8,
                        duration: 1200,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.timing(ringOpacity, {
                        toValue: 0,
                        duration: 1200,
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        ]);

        // Phase 2 (1.5-4s): Logo appears with spring bounce
        const phase2 = Animated.parallel([
            Animated.spring(logoScale, {
                toValue: 1,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.timing(logoOpacity, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            // Ring pulse 2
            Animated.sequence([
                Animated.delay(300),
                Animated.parallel([
                    Animated.timing(ring2Scale, {
                        toValue: 2.2,
                        duration: 1400,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }),
                    Animated.timing(ring2Opacity, {
                        toValue: 0,
                        duration: 1400,
                        useNativeDriver: true,
                    }),
                ]),
            ]),
        ]);

        // Phase 3 (4-5.5s): Tagline slides up
        const phase3 = Animated.parallel([
            Animated.timing(taglineOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(taglineTranslateY, {
                toValue: 0,
                friction: 8,
                tension: 50,
                useNativeDriver: true,
            }),
        ]);

        // Phase 4 (5.5-7s): Subtitle + loading dots
        const phase4 = Animated.parallel([
            Animated.timing(subtitleOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(subtitleTranslateY, {
                toValue: 0,
                friction: 8,
                tension: 50,
                useNativeDriver: true,
            }),
            Animated.timing(dotsOpacity, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
        ]);

        // Phase 5 (7-10s): Dot pulsing animation loop + Fade out at end
        const dotPulse = Animated.loop(
            Animated.sequence([
                Animated.timing(dot1Scale, { toValue: 1.3, duration: 350, useNativeDriver: true }),
                Animated.timing(dot1Scale, { toValue: 0.5, duration: 350, useNativeDriver: true }),
                Animated.timing(dot2Scale, { toValue: 1.3, duration: 350, useNativeDriver: true }),
                Animated.timing(dot2Scale, { toValue: 0.5, duration: 350, useNativeDriver: true }),
                Animated.timing(dot3Scale, { toValue: 1.3, duration: 350, useNativeDriver: true }),
                Animated.timing(dot3Scale, { toValue: 0.5, duration: 350, useNativeDriver: true }),
            ]),
            { iterations: 2 }
        );

        // Run the full 10-second sequence
        Animated.sequence([
            phase1,                          // 0–2s
            phase2,                          // 2–5s
            Animated.delay(300),             // pause
            phase3,                          // 4–5.5s
            Animated.delay(300),             // pause
            phase4,                          // 7–9s
            dotPulse,                        // 9–~11s
            // Fade out at the end
            Animated.timing(fadeOut, {
                toValue: 0,
                duration: 800,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // ALWAYS navigate to Welcome — never skip to home
            router.replace('/welcome');
        });
    }, []);

    const logoSpin = logoRotate.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View style={[styles.container, { opacity: fadeOut }]}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            {/* Pulsing rings behind logo */}
            <Animated.View
                style={[
                    styles.ring,
                    {
                        opacity: ringOpacity,
                        transform: [{ scale: ringScale }],
                    },
                ]}
            />
            <Animated.View
                style={[
                    styles.ring2,
                    {
                        opacity: ring2Opacity,
                        transform: [{ scale: ring2Scale }],
                    },
                ]}
            />

            {/* Logo */}
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

            {/* Tagline */}
            <Animated.Text
                style={[
                    styles.tagline,
                    {
                        opacity: taglineOpacity,
                        transform: [{ translateY: taglineTranslateY }],
                    },
                ]}
            >
                Smart Living, Simplified
            </Animated.Text>

            {/* Subtitle */}
            <Animated.Text
                style={[
                    styles.subtitle,
                    {
                        opacity: subtitleOpacity,
                        transform: [{ translateY: subtitleTranslateY }],
                    },
                ]}
            >
                Your apartment, one tap away
            </Animated.Text>

            {/* Loading dots */}
            <Animated.View style={[styles.dotsContainer, { opacity: dotsOpacity }]}>
                <Animated.View style={[styles.dot, styles.dot1, { transform: [{ scale: dot1Scale }] }]} />
                <Animated.View style={[styles.dot, styles.dot2, { transform: [{ scale: dot2Scale }] }]} />
                <Animated.View style={[styles.dot, styles.dot3, { transform: [{ scale: dot3Scale }] }]} />
            </Animated.View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Rings
    ring: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    ring2: {
        position: 'absolute',
        width: 120,
        height: 120,
        borderRadius: 60,
        borderWidth: 1.5,
        borderColor: COLORS.accent,
    },

    // Logo
    logoContainer: {
        width: width * 0.45,
        height: width * 0.45,
        maxWidth: 220,
        maxHeight: 220,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        width: '100%',
        height: '100%',
    },

    // Text
    tagline: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.textDark,
        marginTop: 24,
        letterSpacing: 0.5,
    },
    subtitle: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textLight,
        marginTop: 8,
        letterSpacing: 0.3,
    },

    // Loading dots
    dotsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 48,
        gap: 10,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    dot1: {
        backgroundColor: COLORS.primary,
    },
    dot2: {
        backgroundColor: COLORS.accent,
    },
    dot3: {
        backgroundColor: COLORS.primary,
    },
});
