import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import { apiService } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const COLORS = {
  background: "#F4F7FB",
  primary: "#2563EB",
  white: "#FFFFFF",
  textDark: "#1E293B",
  textLight: "#64748B",
  border: "#E2E8F0",
  success: "#10B981",
  error: "#EF4444",
};

export default function BookFacilityScreen() {
  const { area } = useLocalSearchParams();
  const router = useRouter();

  // State
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [isLoadingCal, setIsLoadingCal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Time Selection State
  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(
    new Date(new Date().getTime() + 60 * 60 * 1000),
  ); // Default 1 hr later

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // Fetch booked slots whenever the screen loads or date changes
  useEffect(() => {
    if (area) fetchCalendar();
  }, [area, date]);

  const fetchCalendar = async () => {
    setIsLoadingCal(true);
    try {
      const data = (await apiService.get(
        `/api/common-area/calendar?area=${area}`,
      )) as any[];

      // Add a quick safety check just in case the backend returns something weird!
      if (!Array.isArray(data)) {
        setExistingBookings([]);
        return;
      }

      // Filter the data to only show bookings for the currently selected DATE
      const filteredForToday = data.filter((booking: any) => {
        const bookingDate = new Date(booking.startTime).toDateString();
        return bookingDate === date.toDateString();
      });
      setExistingBookings(filteredForToday);
    } catch (error) {
      console.error("Failed to fetch calendar", error);
    } finally {
      setIsLoadingCal(false);
    }
  };

  // Helper to format Date as "YYYY-MM-DDTHH:mm:ss" strictly in LOCAL time (No 'Z' for UTC)
  const formatLocalISOString = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, "0");
    const YYYY = date.getFullYear();
    const MM = pad(date.getMonth() + 1);
    const DD = pad(date.getDate());
    const HH = pad(date.getHours());
    const mm = pad(date.getMinutes());
    const ss = pad(date.getSeconds());

    return `${YYYY}-${MM}-${DD}T${HH}:${mm}:${ss}`;
  };

  const handleBook = async () => {
    // 1. Combine Date + Time into final ISO objects
    const finalStart = new Date(date);
    finalStart.setHours(startTime.getHours(), startTime.getMinutes(), 0, 0);

    const finalEnd = new Date(date);
    finalEnd.setHours(endTime.getHours(), endTime.getMinutes(), 0, 0);

    // 2. Basic Validation: End time must be after Start time
    if (finalEnd <= finalStart) {
      Alert.alert("Invalid Time", "End time must be after the start time.");
      return;
    }

    // 3. NEW: Conflict/Overlap Validation
    // Check if the proposed time overlaps with any existing APPROVED bookings
    const hasConflict = existingBookings.some((booking) => {
      const bookedStart = new Date(booking.startTime);
      const bookedEnd = new Date(booking.endTime);

      // A conflict happens if the new start time is BEFORE an existing end time
      // AND the new end time is AFTER an existing start time.
      // (Using strictly < and > means back-to-back bookings like 1:00-2:00 and 2:00-3:00 are allowed!)
      return finalStart < bookedEnd && finalEnd > bookedStart;
    });

    if (hasConflict) {
      Alert.alert(
        "Time Conflict 🕒",
        "Your selected time overlaps with an already approved booking. Please check the list below and choose an open time slot.",
      );
      return; // Stop the function here so it doesn't send the API request
    }

    // 4. Submit to Backend
    setIsSubmitting(true);
    try {
      await apiService.post("/api/common-area/book", {
        areaName: area,
        startTime: formatLocalISOString(finalStart),
        endTime: formatLocalISOString(finalEnd),
      });
      Alert.alert(
        "Success!",
        "Your booking request has been sent to the manager.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Could not complete booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to format time nicely (e.g., "2:30 PM")
  const formatTime = (d: Date) =>
    d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.title}>Book {area}</Text>

        {/* Picker Section */}
        <View style={styles.card}>
          <Text style={styles.label}>Select Date</Text>
          <TouchableOpacity
            style={styles.pickerBtn}
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons
              name="calendar-outline"
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.pickerText}>{date.toDateString()}</Text>
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={styles.flex1}>
              <Text style={styles.label}>Start Time</Text>
              <TouchableOpacity
                style={styles.pickerBtn}
                onPress={() => setShowStartPicker(true)}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.pickerText}>{formatTime(startTime)}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ width: 16 }} />
            <View style={styles.flex1}>
              <Text style={styles.label}>End Time</Text>
              <TouchableOpacity
                style={styles.pickerBtn}
                onPress={() => setShowEndPicker(true)}
              >
                <Ionicons
                  name="time-outline"
                  size={20}
                  color={COLORS.primary}
                />
                <Text style={styles.pickerText}>{formatTime(endTime)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Existing Bookings for Context */}
        <View style={styles.calendarSection}>
          <Text style={styles.sectionTitle}>
            Approved Bookings for this Date
          </Text>
          {isLoadingCal ? (
            <ActivityIndicator
              color={COLORS.primary}
              style={{ marginTop: 20 }}
            />
          ) : existingBookings.length === 0 ? (
            <Text style={styles.emptyText}>
              No approved bookings yet. You're clear!
            </Text>
          ) : (
            existingBookings.map((b, i) => (
              <View key={i} style={styles.bookingSlot}>
                <View style={styles.dot} />
                <Text style={styles.slotText}>
                  {formatTime(new Date(b.startTime))} -{" "}
                  {formatTime(new Date(b.endTime))}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* Submit Button pinned to bottom */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitBtn, isSubmitting && { opacity: 0.7 }]}
          onPress={handleBook}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <Text style={styles.submitBtnText}>Request Booking</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Date/Time Pickers (Native Overlays) */}
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={(event, selected) => {
            setShowDatePicker(false);
            if (selected) setDate(selected);
          }}
        />
      )}
      {showStartPicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          display="default"
          onChange={(event, selected) => {
            setShowStartPicker(false);
            if (selected) setStartTime(selected);
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endTime}
          mode="time"
          display="default"
          onChange={(event, selected) => {
            setShowEndPicker(false);
            if (selected) setEndTime(selected);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 24, paddingBottom: 100 },
  backBtn: { marginBottom: 16 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.textDark,
    marginBottom: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textLight,
    marginBottom: 8,
  },
  pickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  pickerText: {
    marginLeft: 10,
    fontSize: 16,
    color: COLORS.textDark,
    fontWeight: "500",
  },
  row: { flexDirection: "row", marginTop: 16 },
  flex1: { flex: 1 },
  calendarSection: { marginTop: 8 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 16,
  },
  emptyText: { color: COLORS.textLight, fontStyle: "italic" },
  bookingSlot: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.error,
    marginRight: 12,
  },
  slotText: { fontSize: 15, color: COLORS.textDark, fontWeight: "500" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});
