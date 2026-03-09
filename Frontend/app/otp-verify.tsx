/**
 * OTP Verification Screen
 * Matches the Register/Login high-fidelity design style
 */

import { Colors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Dimensions,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

// Number of OTP digits expected
const OTP_LENGTH = 5;

export default function OtpVerifyScreen() {
    const router = useRouter();
    const { email } = useLocalSearchParams<{ email: string }>();

    const { verifyRegistrationOtp } = useAuth();

    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);

    // Refs for each digit input to auto-advance focus
    const inputRefs = useRef<Array<TextInput | null>>(Array(OTP_LENGTH).fill(null));

    // Countdown timer for Resend OTP
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (resendTimer > 0) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        } else {
            setCanResend(true);
        }
        return () => clearInterval(interval);
    }, [resendTimer]);

    const handleOtpChange = (text: string, index: number) => {
        // Ensure only digits are typed
        const numericValue = text.replace(/[^0-9]/g, '');

        if (numericValue) {
            const newOtp = [...otp];
            newOtp[index] = numericValue.substring(numericValue.length - 1); // Only take last char
            setOtp(newOtp);

            setErrorMsg(''); // Clear error on typed input

            // Auto-advance
            if (index < OTP_LENGTH - 1) {
                inputRefs.current[index + 1]?.focus();
            } else if (index === OTP_LENGTH - 1 && newOtp.every(d => d !== '')) {
                // Auto-submit when last digit is filled
                // Keyboard.dismiss();
            }
        }
    };

    const handleKeyPress = (e: any, index: number) => {
        if (e.nativeEvent.key === 'Backspace') {
            const newOtp = [...otp];
            if (otp[index] === '' && index > 0) {
                // If current box is empty, go to previous and clear it
                newOtp[index - 1] = '';
                setOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
            } else {
                // Clear current box
                newOtp[index] = '';
                setOtp(newOtp);
            }
            setErrorMsg('');
        }
    };

    const handleVerify = async () => {
        const otpString = otp.join('');

        if (otpString.length < OTP_LENGTH) {
            setErrorMsg('OTP must be 5 digits');
            return;
        }

        setIsLoading(true);
        setErrorMsg('');
        try {
            if (email) {
                await verifyRegistrationOtp(email, otpString);
                // On success, go to tabs
                router.replace('/(tabs)');
            } else {
                setErrorMsg('Email not found. Please restart registration.');
            }
        } catch (error: any) {
            setErrorMsg(error.message || 'Invalid verification code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOtp = () => {
        // Note: We could hook up authService.resendOtp(email) here.
        // Assuming backend takes care of it, we just reset the timer for UI
        setResendTimer(60);
        setCanResend(false);
        setErrorMsg('');
        // TODO: Await actual service call here
    };

    return (
        <View style={styles.container}>
            {/* Gradient Header */}
            <LinearGradient
                colors={['#2ECC71', '#27AE60', '#3498DB']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <SafeAreaView>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Ionicons name="arrow-back" size={24} color={Colors.white} />
                    </TouchableOpacity>

                    <View style={styles.headerContent}>
                        <Image
                            source={require('../assets/images/ResiiDo_logo_nobg.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                        <Text style={styles.title}>VERIFICATION</Text>
                        <Text style={styles.subtitle}>Enter the OTP sent to</Text>
                        <Text style={styles.emailText}>{email || 'your email'}</Text>
                    </View>
                </SafeAreaView>
            </LinearGradient>

            {/* White Form Card */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.formContainer}
            >
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.formCard}>

                        {/* OTP Inputs Box */}
                        <View style={styles.otpContainer}>
                            {otp.map((digit, index) => (
                                <TextInput
                                    key={index}
                                    ref={(ref) => { inputRefs.current[index] = ref; }}
                                    style={[
                                        styles.otpInput,
                                        digit !== '' && styles.otpInputFilled,
                                        errorMsg ? styles.otpInputError : null
                                    ]}
                                    value={digit}
                                    onChangeText={(text) => handleOtpChange(text, index)}
                                    onKeyPress={(e) => handleKeyPress(e, index)}
                                    keyboardType="numeric"
                                    maxLength={1}
                                    selectTextOnFocus
                                />
                            ))}
                        </View>

                        {/* Inline Error Message */}
                        {errorMsg ? (
                            <View style={styles.errorContainer}>
                                <Ionicons name="alert-circle" size={20} color={Colors.error} />
                                <Text style={styles.errorText}>{errorMsg}</Text>
                            </View>
                        ) : null}

                        {/* Verify Button */}
                        <TouchableOpacity
                            style={[
                                styles.verifyButton,
                                (isLoading || otp.join('').length < OTP_LENGTH) && styles.verifyButtonDisabled
                            ]}
                            onPress={handleVerify}
                            disabled={isLoading || otp.join('').length < OTP_LENGTH}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={['#3498DB', '#2980B9']}
                                style={styles.verifyButtonGradient}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                            >
                                <Text style={styles.verifyButtonText}>
                                    {isLoading ? 'Verifying...' : 'Verify Email'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Resend OTP */}
                        <View style={styles.resendContainer}>
                            <Text style={styles.resendText}>Didn't receive the code? </Text>
                            <TouchableOpacity
                                onPress={handleResendOtp}
                                disabled={!canResend}
                            >
                                <Text style={[
                                    styles.resendLink,
                                    !canResend && styles.resendLinkDisabled
                                ]}>
                                    {canResend ? 'Resend OTP' : `Resend in ${resendTimer}s`}
                                </Text>
                            </TouchableOpacity>
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        paddingBottom: 30,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    backButton: {
        marginLeft: 20,
        marginTop: 10,
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    headerContent: {
        alignItems: 'center',
        paddingTop: 10,
    },
    logo: {
        width: 70,
        height: 70,
        marginBottom: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: '800',
        color: Colors.white,
        marginTop: 5,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: 10,
    },
    emailText: {
        fontSize: 16,
        fontWeight: '700',
        color: Colors.white,
        marginTop: 4,
    },
    formContainer: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 30,
        paddingBottom: 20,
    },
    formCard: {
        flex: 1,
        paddingTop: 10,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.sosLight,
        padding: 12,
        borderRadius: 8,
        marginBottom: 20,
    },
    errorText: {
        color: Colors.error,
        fontSize: 14,
        marginLeft: 8,
        flex: 1,
    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        paddingHorizontal: 10,
    },
    otpInput: {
        width: 45,
        height: 55,
        backgroundColor: Colors.white,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: Colors.gray[200],
        fontSize: 24,
        fontWeight: '600',
        color: Colors.text.primary,
        textAlign: 'center',
    },
    otpInputFilled: {
        borderColor: Colors.primary,
        backgroundColor: '#F8FFF9',
    },
    otpInputError: {
        borderColor: Colors.error,
    },
    verifyButton: {
        borderRadius: 12,
        overflow: 'hidden',
        marginBottom: 24,
    },
    verifyButtonDisabled: {
        opacity: 0.7,
    },
    verifyButtonGradient: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    verifyButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    resendContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 10,
    },
    resendText: {
        color: Colors.text.secondary,
        fontSize: 14,
        fontWeight: '500',
    },
    resendLink: {
        color: Colors.primary,
        fontSize: 14,
        fontWeight: '700',
    },
    resendLinkDisabled: {
        color: Colors.gray[400],
    },
});
