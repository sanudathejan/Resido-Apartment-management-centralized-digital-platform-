/**
 * Login Screen
 * Modern 2026 light theme - premium minimal UI
 * Supports both Resident and Manager login
 * Logo image already includes "RESIIDO" branding
 */

import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  TextInput,
  Image,
  Animated,
  Easing,
  ActivityIndicator,
  Modal,
} from "react-native";
import { apiService } from "@/services/api";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { API_CONFIG } from "@/constants/config";

const COLORS = {
  background: "#F4F7FB",
  primary: "#2563EB",
  primaryLight: "#EFF6FF",
  textDark: "#1E293B",
  textLight: "#64748B",
  textMuted: "#94A3B8",
  white: "#FFFFFF",
  border: "#E2E8F0",
  error: "#EF4444",
  cardShadow: "#94A3B8",
  residentColor: "#2563EB",
  managerColor: "#7C3AED",
  residentBg: "#EFF6FF",
  managerBg: "#F5F3FF",
};

type LoginRole = "resident" | "manager";

export default function LoginScreen() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<LoginRole>("resident");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const roleColor =
    selectedRole === "resident" ? COLORS.residentColor : COLORS.managerColor;

  // Slide-down animation for brand
  const slideAnim = useRef(new Animated.Value(-30)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Forgot Password States
  const [isForgotModalVisible, setForgotModalVisible] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1); //Email, and then OTP & New Password
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert("Missing Email", "Please enter your email address.");
      return;
    }
    if (!password) {
      Alert.alert("Missing Password", "Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      await login({
        email: email.trim(),
        password,
        role: selectedRole.toUpperCase(),
      });

      // Route based on the role they selected
      if (selectedRole === "manager") {
        router.replace("/(manager)"); // Routes to your new manager directory
      } else {
        router.replace("/(tabs)"); // Routes to the existing resident tabs
      }
    } catch (error: any) {
      Alert.alert(
        "Login Failed",
        error.message || "Invalid credentials. Please try again.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!forgotEmail.trim()) {
      Alert.alert("Error", "Please enter your email.");
      return;
    }
    setIsForgotLoading(true);
    try {
      await apiService.post("/api/users/forgot-password", {
        email: forgotEmail.trim(),
      });
      Alert.alert(
        "Success",
        "An OTP has been sent to your email.",
      );
      setForgotStep(2);
    } catch (error) {
      Alert.alert("Error", "Could not request OTP. Try again.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotOtp.trim() || !forgotNewPassword) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    setIsForgotLoading(true);
    try {
      await apiService.post("/api/users/reset-password", {
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
        newPassword: forgotNewPassword,
      });
      Alert.alert(
        "Success",
        "Your password has been reset! You can now log in.",
      );

      // Close modal and clean up
      setForgotModalVisible(false);
      setForgotStep(1);
      setForgotOtp("");
      setForgotNewPassword("");
      setEmail(forgotEmail); // Pre-fill login email
    } catch (error: any) {
      Alert.alert("Error", error.message || "Invalid OTP. Please try again.");
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Back Button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={22} color={COLORS.textDark} />
            </TouchableOpacity>

            {/* Logo */}
            <Animated.View
              style={[
                styles.brandSection,
                {
                  transform: [{ translateY: slideAnim }],
                  opacity: fadeAnim,
                },
              ]}
            >
              <Image
                source={require("../assets/images/ResiiDo_logo_nobg.png")}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.subtitle}>Welcome back</Text>
            </Animated.View>

            {/* Role Selector */}
            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[
                  styles.roleTab,
                  selectedRole === "resident" && {
                    backgroundColor: COLORS.residentBg,
                    borderColor: COLORS.residentColor,
                  },
                ]}
                onPress={() => setSelectedRole("resident")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="home-outline"
                  size={18}
                  color={
                    selectedRole === "resident"
                      ? COLORS.residentColor
                      : COLORS.textMuted
                  }
                />
                <Text
                  style={[
                    styles.roleTabText,
                    selectedRole === "resident" && {
                      color: COLORS.residentColor,
                      fontWeight: "700",
                    },
                  ]}
                >
                  Resident
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleTab,
                  selectedRole === "manager" && {
                    backgroundColor: COLORS.managerBg,
                    borderColor: COLORS.managerColor,
                  },
                ]}
                onPress={() => setSelectedRole("manager")}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="briefcase-outline"
                  size={18}
                  color={
                    selectedRole === "manager"
                      ? COLORS.managerColor
                      : COLORS.textMuted
                  }
                />
                <Text
                  style={[
                    styles.roleTabText,
                    selectedRole === "manager" && {
                      color: COLORS.managerColor,
                      fontWeight: "700",
                    },
                  ]}
                >
                  Manager
                </Text>
              </TouchableOpacity>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {/* Email */}
              <Text style={styles.inputLabel}>Email</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === "email" && { borderColor: roleColor },
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={COLORS.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="you@example.com"
                  placeholderTextColor={COLORS.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  onFocus={() => setFocusedField("email")}
                  onBlur={() => setFocusedField(null)}
                />
              </View>

              {/* Password */}
              <Text style={styles.inputLabel}>Password</Text>
              <View
                style={[
                  styles.inputContainer,
                  focusedField === "password" && { borderColor: roleColor },
                ]}
              >
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={COLORS.textMuted}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  onFocus={() => setFocusedField("password")}
                  onBlur={() => setFocusedField(null)}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={COLORS.textMuted}
                  />
                </TouchableOpacity>
              </View>

              {/* Forgot Password */}
              <TouchableOpacity
                style={styles.forgotButton}
                activeOpacity={0.7}
                onPress={() => {
                  setForgotEmail(email); // Pre-fill with whatever they already typed
                  setForgotStep(1);
                  setForgotModalVisible(true);
                }}
              >
                <Text style={[styles.forgotText, { color: roleColor }]}>
                  Forgot password?
                </Text>
              </TouchableOpacity>

              {/* Login Button */}
              <Pressable
                style={({ pressed }) => [
                  styles.loginButton,
                  { backgroundColor: roleColor },
                  isLoading && styles.loginButtonDisabled,
                  pressed && { opacity: 0.85 },
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.loginButtonText}>Log in</Text>
                )}
              </Pressable>

              {/* Register Link */}
              <View style={styles.registerLink}>
                <Text style={styles.registerLinkText}>
                  Don't have an account?{" "}
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/register")}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[styles.registerLinkAction, { color: roleColor }]}
                  >
                    Sign up
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* ── Forgot Password Modal ──────────────────────────────── */}
        <Modal visible={isForgotModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Reset Password</Text>
              <Text style={styles.modalSubtitle}>
                {forgotStep === 1
                  ? "Enter your email to receive a reset code."
                  : `Enter the code sent to ${forgotEmail} and your new password.`}
              </Text>

              {forgotStep === 1 ? (
                <TextInput
                  style={styles.modalInput}
                  placeholder="Email Address"
                  value={forgotEmail}
                  onChangeText={setForgotEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              ) : (
                <>
                  <TextInput
                    style={styles.modalInput}
                    placeholder="6-Digit OTP"
                    value={forgotOtp}
                    onChangeText={setForgotOtp}
                    keyboardType="number-pad"
                  />
                  <TextInput
                    style={styles.modalInput}
                    placeholder="New Password"
                    value={forgotNewPassword}
                    onChangeText={setForgotNewPassword}
                    secureTextEntry
                  />
                </>
              )}

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.modalBtnCancel]}
                  onPress={() => setForgotModalVisible(false)}
                >
                  <Text style={styles.modalBtnCancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalBtn,
                    styles.modalBtnSave,
                    { backgroundColor: roleColor },
                  ]}
                  onPress={
                    forgotStep === 1 ? handleRequestOtp : handleResetPassword
                  }
                  disabled={isForgotLoading}
                >
                  {isForgotLoading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.modalBtnSaveText}>
                      {forgotStep === 1 ? "Send OTP" : "Reset Password"}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },

  // Back
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.cardShadow,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },

  // Brand
  brandSection: {
    alignItems: "center",
    marginTop: 24,
    marginBottom: 28,
  },
  logo: {
    width: 110,
    height: 110,
    maxHeight: 110,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textLight,
    marginTop: 4,
    fontWeight: "500",
  },

  // Role Selector
  roleSelector: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 28,
  },
  roleTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  roleTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMuted,
  },

  // Form
  form: {},
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    marginBottom: 16,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 15,
    color: COLORS.textDark,
  },
  eyeButton: {
    padding: 6,
    marginLeft: 4,
  },

  // Forgot
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 24,
    marginTop: -4,
  },
  forgotText: {
    fontSize: 14,
    fontWeight: "600",
  },

  // Login Button
  loginButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 28,
    minHeight: 52,
    ...Platform.select({
      ios: {
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  // Register Link
  registerLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerLinkText: {
    fontSize: 14,
    color: COLORS.textLight,
  },
  registerLinkAction: {
    fontSize: 14,
    fontWeight: "700",
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 8 },
    }),
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 20,
    lineHeight: 20,
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: COLORS.textDark,
    marginBottom: 16,
    backgroundColor: COLORS.background,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalBtnCancel: {
    backgroundColor: COLORS.background,
  },
  modalBtnSave: {
    // Background color is set dynamically via inline style
  },
  modalBtnCancelText: {
    color: COLORS.textDark,
    fontWeight: "600",
    fontSize: 15,
  },
  modalBtnSaveText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 15,
  },
});
