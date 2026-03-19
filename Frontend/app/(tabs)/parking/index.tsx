/**
 * Parking & Visitor Management Screen
 * Purpose: Allows residents to manage their parking slot availability,
 * respond to lending requests, and track visitor entry/exit.
 */

import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Button,
  Alert,
  Platform,
  TextInput,
  KeyboardAvoidingView,
  Switch,
  Image,
  ActivityIndicator,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import { parkingService } from "@/services";
import { ParkingSlot } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_CONFIG, APP_CONFIG } from "@/constants/config";
import DateTimePicker from "@react-native-community/datetimepicker";

/* ─── Updated Design Tokens ─── */
const C = {
  bg: '#D8F3DC',
  primary: "#1D4ED8", // Deeper blue for better text contrast
  primaryLight: "#DBEAFE",
  white: "#FFFFFF",
  textDark: "#0F172A", // Deep slate for headers
  textLight: "#334155", // Darkened from #64748B for significantly better readability
  textMuted: "#64748B", // Standard grey for secondary info
  border: "#CBD5E1", // Slightly darker border for clearer definition
  success: "#065F46", // Deep emerald (much easier to read than bright green)
  warning: "#92400E",
  error: "#991B1B",
  secondary: "#5B21B6",
} as const;

const shadow = (elevation: number) => ({
  ...Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: elevation },
      shadowOpacity: 0.1,
      shadowRadius: elevation * 2,
    },
    android: { elevation },
  }),
});

export default function ParkingScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"my_parking" | "requests">(
    "my_parking",
  );
  const [parkingSlot, setParkingSlot] = useState<any>(null); // Replace any with your type
  const [loading, setLoading] = useState(false);
  const [selectedSlotForBorrow, setSelectedSlotForBorrow] = useState<any>(null);
  // Date/Time States (Defaulting to now, and 4 hours from now)
  const [borrowStartTime, setBorrowStartTime] = useState(new Date());
  const [borrowEndTime, setBorrowEndTime] = useState(
    new Date(new Date().setHours(new Date().getHours() + 4)),
  );
  // Controls for showing the pickers (especially needed for Android)
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false);

  // Derive parking slot number from user's apartment number
  const derivedSlotNumber = user?.apartmentNumber
    ? `P-${user.apartmentNumber}`
    : "P-Unassigned";

  // Toggle State for the "Lend My Slot" switch
  const [isLending, setIsLending] = useState(false);
  // Available Slots State
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  // My Requests State
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [isRequestsModalVisible, setIsRequestsModalVisible] = useState(false);
  // Pending Requests State (Requests from others for MY slot)
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isPendingModalVisible, setIsPendingModalVisible] = useState(false);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  // Active/Approved Requests State
  const [approvedLending, setApprovedLending] = useState<any[]>([]); // People using MY slot
  const [approvedBorrowing, setApprovedBorrowing] = useState<any[]>([]); // Slots I am using
  //for calender
  const [startMode, setStartMode] = useState<"date" | "time">("date"); // for Android chaining
  const [endMode, setEndMode] = useState<"date" | "time">("date");

  /* ─── INITIALIZATION ─── */
  useEffect(() => {
    fetchMyParkingStatus();
    fetchActiveSchedules();
  }, []);

  const fetchMyParkingStatus = async () => {
    try {
      const token = await AsyncStorage.getItem(
        APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      );
      if (!token) return;

      const url = `${API_CONFIG.BASE_URL}/api/parking/my-slot`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();

        // Save the slot info
        setParkingSlot(data);

        // Sync the toggle UI with the database
        // Check both common Spring Boot serialization patterns just to be safe
        setIsLending(
          data.availableForLending === true ||
            data.isAvailableForLending === true,
        );
      }
    } catch (error) {
      console.error("Failed to fetch initial parking status:", error);
    }
  };

  /* ─── UI HANDLERS ─── */
  const handleToggleLending = async (value: boolean) => {
    // 1. Optimistic Update: Change the UI immediately for a snappy feel
    const previousState = isLending;
    setIsLending(value);

    try {
      // 2. Get the token from storage
      const token = await AsyncStorage.getItem(
        APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      );

      if (!token) {
        throw new Error("No authentication token found");
      }

      // 3. Prepare the URL with the query parameter
      // Note: your requirement was ?available=true/false
      const url = `${API_CONFIG.BASE_URL}/api/parking/my-slot/availability?available=${value}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to update parking status");
      }
    } catch (error) {
      console.error("Parking Update Error:", error);

      // 4. Rollback: If the API fails, switch the toggle back
      setIsLending(previousState);

      Alert.alert(
        "Update Failed",
        "Could not update parking status. Please check your connection.",
      );
    }
  };
  /* ─── API HANDLERS ─── */
  const fetchAvailableSlots = async () => {
    setIsModalVisible(true);
    setIsLoadingSlots(true);
    setHasSearched(true);

    try {
      const token = await AsyncStorage.getItem(
        APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      );
      if (!token) throw new Error("No auth token found");

      // Replace API_CONFIG.BASE_URL with 'http://localhost:8080' if your config isn't set up yet
      const url = `${API_CONFIG.BASE_URL}/api/parking/available`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch available slots");
      }

      const data = await response.json();
      setAvailableSlots(data); // Assuming the API returns an array of slots

      const filteredSlots = data.filter((slot: any) => {
        const apiSlotNum = String(slot.slotNumber);
        const myAptNum = String(user?.apartmentNumber);

        // Exclude the slot if it matches the apartment number (e.g., "405")
        // or the derived format (e.g., "P-405")
        return apiSlotNum !== myAptNum && apiSlotNum !== `P-${myAptNum}`;
      });

      setAvailableSlots(filteredSlots);
    } catch (error) {
      console.error("Fetch slots error:", error);
      Alert.alert("Error", "Could not load available parking slots.");
      setAvailableSlots([]);
      setIsModalVisible(false);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  /* ─── API HANDLERS ─── */
  const submitBorrowRequest = async () => {
    // 1. Validate times
    if (borrowEndTime <= borrowStartTime) {
      Alert.alert("Invalid Time", "End time must be after the start time.");
      return;
    }

    setIsSubmittingRequest(true);

    try {
      const token = await AsyncStorage.getItem(
        APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      );
      if (!token) throw new Error("No auth token found");

      // 2. Format dates to strip milliseconds and 'Z' (e.g., "2026-03-05T10:00:00")
      // Using a quick offset hack to keep local time formatting correct
      const formatToLocalISO = (d: Date) => {
        const offset = d.getTimezoneOffset() * 60000; // offset in milliseconds
        return new Date(d.getTime() - offset).toISOString().slice(0, 19);
      };

      const payload = {
        slot: { id: selectedSlotForBorrow.id }, // Make sure your slot object has an 'id' property
        startTime: formatToLocalISO(borrowStartTime),
        endTime: formatToLocalISO(borrowEndTime),
      };

      const url = `${API_CONFIG.BASE_URL}/api/parking/request`;

      // 3. Send Request
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to send borrow request");

      // 4. Success handling
      Alert.alert(
        "Request Sent",
        "The owner has been notified of your request.",
      );

      // Close everything and reset
      setSelectedSlotForBorrow(null);
      setIsModalVisible(false);

      // Optional: Re-fetch available slots here to refresh the list
      // fetchAvailableSlots();
    } catch (error) {
      console.error("Borrow request error:", error);
      Alert.alert("Error", "Could not send the borrow request.");
    } finally {
      setIsSubmittingRequest(false);
    }
  };

  const fetchMyRequests = async () => {
    setIsRequestsModalVisible(true); // Open modal immediately
    setIsLoadingRequests(true);

    try {
      const token = await AsyncStorage.getItem(
        APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      );
      if (!token) throw new Error("No auth token found");

      const url = `${API_CONFIG.BASE_URL}/api/parking/my-requests`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch requests");

      const data = await response.json();
      setMyRequests(data);
    } catch (error) {
      console.error("Fetch requests error:", error);
      Alert.alert("Error", "Could not load your requests.");
      setMyRequests([]);
      setIsRequestsModalVisible(false);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const deleteRequest = async (requestId: number) => {
    try {
      const token = await AsyncStorage.getItem(
        APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      );
      if (!token) throw new Error("No auth token found");

      const url = `${API_CONFIG.BASE_URL}/api/parking/request/${requestId}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed with status ${response.status}`);
      }

      // If successful, instantly remove it from the UI
      setMyRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (error) {
      console.error("Delete request error:", error);
    }
  };

  const fetchPendingRequests = async () => {
    setIsPendingModalVisible(true);
    setIsLoadingPending(true);

    try {
      const token = await AsyncStorage.getItem(
        APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      );
      if (!token) throw new Error("No auth token found");

      const url = `${API_CONFIG.BASE_URL}/api/parking/my-slot/pending`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to fetch pending requests");

      const data = await response.json();
      setPendingRequests(data);
    } catch (error) {
      console.error("Fetch pending requests error:", error);
      Alert.alert("Error", "Could not load pending requests for your slot.");
      setPendingRequests([]);
    } finally {
      setIsLoadingPending(false);
    }
  };

  const handleRequestAction = async (
    requestId: number,
    action: "APPROVED" | "DENIED",
  ) => {
    try {
      const token = await AsyncStorage.getItem(
        APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      );
      if (!token) throw new Error("No auth token found");

      // Note the query parameter ?status= as defined in your Spring Boot controller
      const url = `${API_CONFIG.BASE_URL}/api/parking/request/${requestId}?status=${action}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        // Try to parse the Spring Boot error JSON
        const errorData = await response.json().catch(() => null);

        // Extract the specific message we wrote in the Java controller
        const errorMessage =
          errorData?.message ||
          "Failed to process the request. Please try again.";

        // Show the specific error to the user!
        Alert.alert("Time Conflict", errorMessage);
        throw new Error(errorMessage);
      }

      // Optimistically remove the request from the list
      setPendingRequests((prev) => prev.filter((req) => req.id !== requestId));

      // Give a tiny delay for the alert so it doesn't clash with the modal
      setTimeout(() => {
        Alert.alert("Success", `Request has been ${action.toLowerCase()}.`);
      }, 100);
    } catch (error) {
      console.error(`Error processing ${action}:`, error);
      Alert.alert("Error", "Could not process the request. Please try again.");
    }
  };

  const fetchActiveSchedules = async () => {
    try {
      const token = await AsyncStorage.getItem(
        APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      );
      if (!token) return;

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      };

      // 1. Fetch who is borrowing MY slot
      const lendRes = await fetch(
        `${API_CONFIG.BASE_URL}/api/parking/my-slot/approved`,
        { headers },
      );
      if (lendRes.ok) {
        const lendData = await lendRes.json();
        const now = new Date();
        // Only keep requests where the end time hasn't passed yet
        const activeLending = lendData.filter(
          (req: any) => new Date(req.endTime) > now,
        );
        setApprovedLending(activeLending);
      }

      // 2. Fetch slots I am borrowing
      const borrowRes = await fetch(
        `${API_CONFIG.BASE_URL}/api/parking/my-requests`,
        { headers },
      );
      if (borrowRes.ok) {
        const borrowData = await borrowRes.json();
        const now = new Date();
        // Only keep APPROVED requests where the end time hasn't passed yet
        const activeBorrowing = borrowData.filter(
          (req: any) =>
            req.status === "APPROVED" && new Date(req.endTime) > now,
        );
        setApprovedBorrowing(activeBorrowing);
      }
    } catch (error) {
      console.error("Failed to fetch active schedules:", error);
    }
  };

  /* ─── RENDER: MY PARKING TAB ─── */
  const renderMyParkingTab = () => (
    <>
      {/* 1. Slot Visual Card: Displays current assignment status */}
      <View style={[styles.card, shadow(2)]}>
        <Image
          source={{
            uri: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1000&auto=format&fit=crop",
          }}
          style={styles.slotImage}
        />
        <View style={styles.slotHeaderOverlay}>
          <View style={styles.badgePrimary}>
            <Text style={styles.badgeTextWhite}>YOUR SLOT</Text>
          </View>
        </View>

        <View style={styles.slotDetails}>
          <View>
            <Text style={styles.slotSubLabel}>ASSIGNED SLOT</Text>
            <Text style={styles.slotMainTitle}>Slot {derivedSlotNumber}</Text>
          </View>
          <View
            style={
              isLending ? styles.statusBadgeGreen : styles.statusBadgeMuted
            }
          >
            <View style={isLending ? styles.dotGreen : styles.dotMuted} />
            <Text
              style={
                isLending ? styles.statusTextGreen : styles.statusTextMuted
              }
            >
              {isLending ? "Lending Active" : "Private"}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Lending Management: Switch to allow others to use the slot */}
      <View style={[styles.toggleCard, shadow(2)]}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Lend My Slot</Text>
          <Text style={styles.cardSubtitle}>
            Mark your slot as free for other residents to use temporarily while
            you're away.
          </Text>
        </View>
        <Switch
          value={isLending}
          onValueChange={handleToggleLending}
          trackColor={{ false: "#CBD5E1", true: "#2563EB" }}
          thumbColor={Platform.OS === "android" ? C.white : ""}
        />
      </View>
      {/* 3. Manage Pending Requests */}
      <View style={{ marginTop: 24 }}>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={fetchPendingRequests}
          activeOpacity={0.8}
        >
          <Ionicons name="people" size={18} color={C.white} />
          <Text style={styles.searchButtonText}>View Pending Requests</Text>
        </TouchableOpacity>
      </View>
      {/* 4. Currently Approved Lends (People using my slot) */}
      {approvedLending.length > 0 && (
        <View style={{ marginTop: 32 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: C.textDark,
              marginBottom: 12,
            }}
          >
            Scheduled Visitors
          </Text>
          {approvedLending.map((req, index) => (
            <View
              key={index}
              style={[
                styles.availableSlotCard,
                shadow(1),
                { borderLeftWidth: 4, borderLeftColor: C.success },
              ]}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View
                  style={[styles.avatarSmall, { backgroundColor: "#ECFDF5" }]}
                >
                  <Ionicons name="car" size={18} color={C.success} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.visitorName}>
                    User #{req.requester?.id || "Unknown"} is using your slot
                  </Text>
                  <Text style={styles.visitorSub}>
                    {new Date(req.startTime).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    •{" "}
                    {new Date(req.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    to{" "}
                    {new Date(req.endTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </>
  );

  /* ─── RENDER: REQUESTS TAB ─── */
  const renderRequestsTab = () => (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>AVAILABLE SLOTS</Text>
      </View>
      <TouchableOpacity
        style={styles.searchButton}
        onPress={fetchAvailableSlots}
        activeOpacity={0.8}
      >
        <Ionicons name="search" size={18} color={C.white} />
        <Text style={styles.searchButtonText}>Find Available Slots</Text>
      </TouchableOpacity>
      <View style={{ height: 16 }} />
      {/* Spacer */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>MY REQUESTS</Text>
      </View>
      <TouchableOpacity
        style={[styles.searchButton, { backgroundColor: C.secondary }]} // Differentiated color
        onPress={fetchMyRequests}
        activeOpacity={0.8}
      >
        <Ionicons name="list" size={18} color={C.white} />
        <Text style={styles.searchButtonText}>View My Requests</Text>
      </TouchableOpacity>
      {/* Approved Borrowings (Slots I am using) */}
      {approvedBorrowing.length > 0 && (
        <View style={{ marginTop: 32 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: C.textDark,
              marginBottom: 12,
            }}
          >
            Your Upcoming Parking
          </Text>
          {approvedBorrowing.map((req, index) => (
            <View
              key={index}
              style={[
                styles.availableSlotCard,
                shadow(1),
                { borderLeftWidth: 4, borderLeftColor: C.primary },
              ]}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <View
                  style={[styles.avatarSmall, { backgroundColor: "#EFF6FF" }]}
                >
                  <Ionicons name="location" size={18} color={C.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.visitorName}>
                    Slot #{req.slot?.slotNumber || "Unknown"} (Owner: User #
                    {req.slot?.owner?.id || "?"})
                  </Text>
                  <Text style={styles.visitorSub}>
                    {new Date(req.startTime).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}{" "}
                    •{" "}
                    {new Date(req.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    to{" "}
                    {new Date(req.endTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Parking</Text>
        <Text style={styles.headerSubtitle}>
          Manage your parking space and requests
        </Text>
      </View>

      {/* Custom Tab Switcher */}
      <View style={styles.tabContainer}>
        <TabButton
          active={activeTab === "my_parking"}
          label="My Parking"
          icon="car"
          onPress={() => setActiveTab("my_parking")}
        />
        <TabButton
          active={activeTab === "requests"}
          label="Requests"
          icon="list"
          onPress={() => setActiveTab("requests")}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "my_parking"
          ? renderMyParkingTab()
          : renderRequestsTab()}
      </ScrollView>
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsModalVisible(false)}
        >
          <Pressable style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Available Slots</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={26} color={C.textMuted} />
              </TouchableOpacity>
            </View>

            {isLoadingSlots ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={C.primary} />
                <Text style={styles.loadingText}>Searching...</Text>
              </View>
            ) : availableSlots.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No slots are currently available to borrow.
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.modalScroll}
              >
                {availableSlots.map((slot, index) => (
                  <View
                    key={index}
                    style={[styles.availableSlotCard, shadow(1)]}
                  >
                    <View style={styles.avatarSmall}>
                      <Ionicons name="car" size={18} color={C.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.visitorName}>
                        Slot {slot.slotNumber || "Unknown"}
                      </Text>
                      <Text style={styles.visitorSub}>Ready to borrow</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.borrowBtn}
                      onPress={() => {
                        // 1. Close the first modal immediately
                        setIsModalVisible(false);
                        // 2. Wait for the iOS closing animation, then open the second modal
                        setTimeout(() => {
                          setSelectedSlotForBorrow(slot);
                        }, 300); // 300ms is usually perfect for iOS
                      }}
                    >
                      <Text style={styles.borrowBtnText}>Borrow</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
      <Modal
        visible={!!selectedSlotForBorrow}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedSlotForBorrow(null)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSelectedSlotForBorrow(null)}
        >
          <Pressable style={styles.modalContent}>
            {/* HEADER STAYS OUTSIDE SCROLLVIEW (Fixed at top) */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Time</Text>
              <TouchableOpacity onPress={() => setSelectedSlotForBorrow(null)}>
                <Ionicons name="close-circle" size={26} color={C.textMuted} />
              </TouchableOpacity>
            </View>

            {/* ─── SCROLLVIEW STARTS HERE ─── */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1, paddingBottom: 10 }}
            >
              <Text style={styles.cardSubtitle}>
                Borrowing Slot {selectedSlotForBorrow?.slotNumber || "Unknown"}
              </Text>

              {/* ─── START TIME SECTION ─── */}
              <View style={{ marginTop: 20 }}>
                <Text style={styles.detailText}>Start Time</Text>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowStartPicker(true)}
                >
                  <Text style={styles.timePickerButtonText}>
                    {borrowStartTime.toLocaleString([], {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={C.primary}
                  />
                </TouchableOpacity>

                {/* iOS INLINE START PICKER */}
                {Platform.OS === "ios" && showStartPicker && (
                  <View
                    style={{
                      backgroundColor: "#F1F5F9",
                      borderRadius: 12,
                      marginTop: 8,
                      overflow: "hidden",
                    }}
                  >
                    <DateTimePicker
                      value={borrowStartTime}
                      mode="datetime"
                      display="spinner"
                      textColor="#1D4ED8"
                      onChange={(event, selectedDate) => {
                        const currentDate = selectedDate || borrowStartTime;
                        setBorrowStartTime(currentDate);
                      }}
                    />
                    <Button
                      title="Done"
                      onPress={() => setShowStartPicker(false)}
                    />
                  </View>
                )}
              </View>

              {/* ─── END TIME SECTION ─── */}
              <View style={{ marginTop: 15, marginBottom: 24 }}>
                <Text style={styles.detailText}>End Time</Text>
                <TouchableOpacity
                  style={styles.timePickerButton}
                  onPress={() => setShowEndPicker(true)}
                >
                  <Text style={styles.timePickerButtonText}>
                    {borrowEndTime.toLocaleString([], {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color={C.primary}
                  />
                </TouchableOpacity>

                {/* iOS INLINE END PICKER */}
                {Platform.OS === "ios" && showEndPicker && (
                  <View
                    style={{
                      backgroundColor: "#F1F5F9",
                      borderRadius: 12,
                      marginTop: 8,
                      overflow: "hidden",
                    }}
                  >
                    <DateTimePicker
                      value={borrowEndTime}
                      mode="datetime"
                      display="spinner"
                      textColor="#1D4ED8"
                      minimumDate={borrowStartTime}
                      onChange={(event, selectedDate) => {
                        const currentDate = selectedDate || borrowEndTime;
                        setBorrowEndTime(currentDate);
                      }}
                    />
                    <Button
                      title="Done"
                      onPress={() => setShowEndPicker(false)}
                    />
                  </View>
                )}
              </View>

              {/* ─── ANDROID NATIVE POPUP PICKERS ─── */}
              {Platform.OS === "android" && showStartPicker && (
                <DateTimePicker
                  value={borrowStartTime}
                  mode={startMode}
                  display="default"
                  onChange={(event, selectedDate) => {
                    if (event.type === "dismissed") {
                      setShowStartPicker(false);
                      setStartMode("date");
                      return;
                    }
                    const currentDate = selectedDate || borrowStartTime;
                    setBorrowStartTime(currentDate);

                    if (startMode === "date") {
                      setStartMode("time");
                    } else {
                      setShowStartPicker(false);
                      setStartMode("date");
                    }
                  }}
                />
              )}

              {Platform.OS === "android" && showEndPicker && (
                <DateTimePicker
                  value={borrowEndTime}
                  mode={endMode}
                  display="default"
                  minimumDate={borrowStartTime}
                  onChange={(event, selectedDate) => {
                    if (event.type === "dismissed") {
                      setShowEndPicker(false);
                      setEndMode("date");
                      return;
                    }
                    const currentDate = selectedDate || borrowEndTime;
                    setBorrowEndTime(currentDate);

                    if (endMode === "date") {
                      setEndMode("time");
                    } else {
                      setShowEndPicker(false);
                      setEndMode("date");
                    }
                  }}
                />
              )}

              {/* ─── CONFIRM BUTTON ─── */}
              <TouchableOpacity
                style={[
                  styles.registerButton,
                  isSubmittingRequest && { opacity: 0.7 },
                ]}
                onPress={submitBorrowRequest}
                disabled={isSubmittingRequest}
              >
                {isSubmittingRequest ? (
                  <ActivityIndicator color={C.white} />
                ) : (
                  <>
                    <Text style={styles.registerButtonText}>
                      Confirm Borrow Request
                    </Text>
                    <Ionicons
                      name="arrow-forward"
                      size={18}
                      color={C.white}
                      style={{ marginLeft: 8 }}
                    />
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
            {/* ─── SCROLLVIEW ENDS HERE ─── */}
          </Pressable>
        </Pressable>
      </Modal>

      {/* ─── NEW: MY REQUESTS MODAL ─── */}
      <Modal
        visible={isRequestsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsRequestsModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsRequestsModalVisible(false)}
        >
          <Pressable style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>My Requests</Text>
              <TouchableOpacity
                onPress={() => setIsRequestsModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={26} color={C.textMuted} />
              </TouchableOpacity>
            </View>

            {isLoadingRequests ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={C.secondary} />
                <Text style={styles.loadingText}>Loading requests...</Text>
              </View>
            ) : myRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  You don't have any active parking requests.
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.modalScroll}
              >
                {myRequests.map((req, index) => (
                  <View
                    key={index}
                    style={[styles.availableSlotCard, shadow(1)]}
                  >
                    <View style={styles.avatarSmall}>
                      <Ionicons name="time" size={18} color={C.secondary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.visitorName}>
                        Slot {req.slot?.slotNumber || "Unknown"}
                      </Text>
                      <Text style={styles.visitorSub}>
                        {new Date(req.startTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        -{" "}
                        {new Date(req.endTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>
                      <Text
                        style={[
                          styles.visitorSub,
                          {
                            color:
                              req.status === "APPROVED" ? C.success : C.warning,
                            fontWeight: "700",
                            marginTop: 2,
                          },
                        ]}
                      >
                        {req.status || "PENDING"}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.borrowBtn,
                        { backgroundColor: "#FEF2F2", borderColor: "#FEE2E2" },
                      ]}
                      onPress={() => deleteRequest(req.id)}
                    >
                      <Text style={[styles.borrowBtnText, { color: C.error }]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
      {/* ─── PENDING REQUESTS MODAL (For My Slot) ─── */}
      <Modal
        visible={isPendingModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsPendingModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setIsPendingModalVisible(false)}
        >
          <Pressable style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Slot Requests</Text>
              <TouchableOpacity
                onPress={() => setIsPendingModalVisible(false)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={26} color={C.textMuted} />
              </TouchableOpacity>
            </View>

            {isLoadingPending ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={C.primary} />
                <Text style={styles.loadingText}>Checking requests...</Text>
              </View>
            ) : pendingRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No one has requested to borrow your slot yet.
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                style={styles.modalScroll}
              >
                {pendingRequests.map((req, index) => (
                  <View
                    key={index}
                    style={[
                      styles.availableSlotCard,
                      shadow(1),
                      { flexDirection: "column", alignItems: "stretch" },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <View style={styles.avatarSmall}>
                        <Ionicons name="person" size={18} color={C.primary} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.visitorName}>
                          User #{req.requester?.id || "Unknown"}
                        </Text>
                        <Text style={styles.visitorSub}>
                          {new Date(req.startTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}{" "}
                          -{" "}
                          {new Date(req.endTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </Text>
                      </View>
                    </View>

                    <View style={{ flexDirection: "row", gap: 10 }}>
                      <TouchableOpacity
                        style={[
                          styles.borrowBtn,
                          {
                            flex: 1,
                            alignItems: "center",
                            backgroundColor: "#FEF2F2",
                            borderColor: "#FEE2E2",
                          },
                        ]}
                        onPress={() => handleRequestAction(req.id, "DENIED")}
                      >
                        <Text
                          style={[styles.borrowBtnText, { color: C.error }]}
                        >
                          Decline
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.borrowBtn,
                          {
                            flex: 1,
                            alignItems: "center",
                            backgroundColor: "#ECFDF5",
                            borderColor: "#D1FAE5",
                          },
                        ]}
                        onPress={() => handleRequestAction(req.id, "APPROVED")}
                      >
                        <Text
                          style={[styles.borrowBtnText, { color: C.success }]}
                        >
                          Accept
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

/* ─── SUB-COMPONENTS ─── */

/**
 * TabButton: Navigates between Parking management and Visitor lists
 */
const TabButton = ({ active, label, icon, onPress }: any) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.tab, active && styles.tabActive]}
  >
    <Ionicons name={icon} size={18} color={active ? C.primary : C.textMuted} />
    <Text style={[styles.tabText, active && styles.tabTextActive]}>
      {label}
    </Text>
  </TouchableOpacity>
);

/**
 * RequestCard: Display for other residents asking to use your parking slot
 */
const RequestCard = ({ name, time, note }: any) => (
  <View style={[styles.requestCard, shadow(1)]}>
    <View style={styles.visitorRow}>
      <View style={styles.avatarSmall} />
      <View style={{ flex: 1 }}>
        <Text style={styles.visitorName}>{name}</Text>
        <Text style={styles.visitorSub}>{time}</Text>
      </View>
      <Ionicons name="chatbubble-ellipses" size={20} color={C.textMuted} />
    </View>
    <Text style={styles.requestNote}>"{note}"</Text>
    <View style={styles.actionRow}>
      <TouchableOpacity style={styles.declineBtn}>
        <Text style={styles.declineText}>Decline</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.acceptBtn}>
        <Text style={styles.acceptText}>Accept</Text>
      </TouchableOpacity>
    </View>
  </View>
);

/* ─── High-Readability StyleSheet ─── */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  headerTitle: { fontSize: 24, fontWeight: "800", color: C.textDark },
  headerSubtitle: { fontSize: 14, color: C.textLight, marginTop: 4 },
  // Search Button
  searchButton: {
    backgroundColor: C.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 16,
    gap: 8,
  },
  searchButtonText: {
    color: C.white,
    fontWeight: "700",
    fontSize: 15,
  },

  // Available Slot Card
  availableSlotCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  borrowBtn: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  borrowBtnText: {
    color: C.primary,
    fontWeight: "700",
    fontSize: 13,
  },

  // Empty State
  emptyState: {
    backgroundColor: "#F8FAFC",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
  },
  emptyStateText: {
    color: C.textMuted,
    fontSize: 13,
    fontStyle: "italic",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.4)", // Dimmed background
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: C.white,
    width: "100%",
    maxHeight: "75%", // Prevents it from taking up the whole screen
    borderRadius: 24,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: { elevation: 10 },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: C.textDark,
  },
  modalScroll: {
    marginTop: 4,
  },
  modalLoading: {
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: C.textMuted,
    fontWeight: "600",
    fontSize: 15,
  },
  // Time Picker Buttons
  timePickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  timePickerButtonText: {
    fontSize: 15,
    color: C.textDark,
    fontWeight: "500",
  },

  // Tabs
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#CBD5E1", //Darker track
    borderRadius: 14,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  tabActive: { backgroundColor: C.white },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: C.textMuted,
  },
  tabTextActive: { color: C.primary },

  scrollContent: { padding: 20, paddingBottom: 40 },

  // Parking Slot Card
  card: {
    backgroundColor: C.white,
    borderRadius: 24,
    overflow: "hidden",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#94A3B8", // (Medium border color)
  },
  slotImage: { width: "100%", height: 160 },
  slotHeaderOverlay: { position: "absolute", top: 12, right: 12 },
  badgePrimary: {
    backgroundColor: C.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeTextWhite: { color: C.white, fontSize: 10, fontWeight: "800" },
  slotDetails: {
    padding: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  slotSubLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.primary,
    letterSpacing: 0.5,
  },
  slotMainTitle: { fontSize: 22, fontWeight: "800", color: C.textDark },

  // Status Badges (Green/Available)
  statusBadgeGreen: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.success,
    marginRight: 6,
  },
  statusTextGreen: { color: C.success, fontSize: 12, fontWeight: "700" },

  // Status Badges (Muted/Private)
  statusBadgeMuted: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  dotMuted: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: C.textMuted,
    marginRight: 6,
  },
  statusTextMuted: { color: C.textMuted, fontSize: 12, fontWeight: "700" },

  // Lending Toggle Card
  toggleCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#94A3B8",
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: C.textDark },
  cardSubtitle: {
    fontSize: 13,
    color: C.textLight,
    marginTop: 4,
    lineHeight: 18,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textLight,
    letterSpacing: 1,
  },
  countBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  countText: { color: C.primary, fontSize: 11, fontWeight: "700" },

  // Request Cards
  requestCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#94A3B8",
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  // Increased darkness and line height for notes
  requestNote: {
    fontSize: 14,
    fontStyle: "italic",
    color: C.textDark,
    marginVertical: 12,
    lineHeight: 20,
  },
  actionRow: { flexDirection: "row", gap: 12, marginTop: 4 },
  declineBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
  },
  acceptBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    backgroundColor: C.primary,
    alignItems: "center",
  },
  declineText: { fontWeight: "700", color: C.textDark },
  acceptText: { fontWeight: "700", color: C.white },

  // Visitor History - Darker labels
  visitorCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#94A3B8",
  },
  visitorRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3E8FF",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: C.secondary, fontWeight: "700" },
  visitorName: { fontSize: 16, fontWeight: "700", color: C.textDark },
  visitorSub: { fontSize: 12, color: C.textMuted, marginTop: 1 },
  statusIn: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusInText: { color: C.success, fontSize: 11, fontWeight: "700" },

  // Details Box - Darkened background and added border for visibility
  detailsBox: {
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    padding: 12,
    marginTop: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  detailItem: { flexDirection: "row", alignItems: "center", gap: 10 },
  detailText: { fontSize: 13, color: C.textLight, fontWeight: "500" },

  registerButton: {
    backgroundColor: C.primary,
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  registerButtonText: { color: C.white, fontWeight: "700", marginLeft: 8 },
  iosModalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.4)", // Darkens the background
  },
  iosPickerContainer: {
    backgroundColor: "white",
    paddingBottom: 30, // Extra padding for iPhones with the bottom home indicator
    paddingTop: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
