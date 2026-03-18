/**
 * Manager: Issue Bill Screen (With Searchable Resident Dropdown & Back Button)
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Modal,
  Pressable,
  Platform,
  Button,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { API_CONFIG, APP_CONFIG } from "@/constants/config";

// Updated interface to include houseNumber
interface Resident {
  id: number;
  name: string;
  email: string;
  role: string;
  houseNumber?: string; // Ensure your backend sends this field
}

const C = {
  bg: "#F8FAFC",
  primary: "#7C3AED",
  primaryLight: "#F5F3FF",
  white: "#FFFFFF",
  textDark: "#1E293B",
  textLight: "#64748B",
  border: "#E2E8F0",
  overlay: "rgba(0,0,0,0.5)",
};

export default function IssueBillScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("RENT");
  const [dueDate, setDueDate] = useState(new Date());
  const [showDueDatePicker, setShowDueDatePicker] = useState(false);

  // Dropdown & Search State
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(
    null,
  );
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [fetchingResidents, setFetchingResidents] = useState(true);
  const [searchQuery, setSearchQuery] = useState(""); // New state for the search bar

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const token = await AsyncStorage.getItem(
        APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      );
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.USERS}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error("Failed to fetch residents");

      const data: Resident[] = await response.json();
      const residentOnly = data.filter(
        (user) => user.role === "RESIDENT" || user.role === "USER",
      );
      setResidents(residentOnly);
    } catch (error) {
      console.error("Error fetching residents:", error);
      Alert.alert("Notice", "Could not load residents list.");
    } finally {
      setFetchingResidents(false);
    }
  };

  const handleIssueBill = async () => {
    if (!selectedResident || !amount || !dueDate) {
      Alert.alert("Error", "Please fill in all fields and select a resident.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem(
        APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
      );

      const payload = {
        amount: parseFloat(amount),
        type: type,
        dueDate: dueDate.toISOString().split("T")[0],
        resident: { id: selectedResident.id },
      };

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENTS}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) throw new Error(`Status: ${response.status}`);

      Alert.alert("Success", "Bill issued successfully!");
      router.back();
    } catch (error) {
      console.error("Failed to issue bill:", error);
      Alert.alert("Error", "Could not issue the bill.");
    } finally {
      setLoading(false);
    }
  };

  // Filter residents based on the search query (by house number)
  const filteredResidents = residents.filter((resident) => {
    const houseNum = resident.houseNumber
      ? resident.houseNumber.toString().toLowerCase()
      : "";
    return houseNum.includes(searchQuery.toLowerCase());
  });

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* --- NEW CENTERED HEADER WITH BACK BUTTON --- */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={C.textDark} />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Issue New Bill</Text>
          <Text style={styles.headerSubtitle}>Create a payment request</Text>
        </View>
        <View style={styles.backButtonSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.label}>Select Resident</Text>

          <TouchableOpacity
            style={styles.dropdownTrigger}
            onPress={() => {
              setSearchQuery(""); // Clear search when opening
              setDropdownVisible(true);
            }}
            disabled={fetchingResidents}
          >
            <Text
              style={[
                styles.dropdownTriggerText,
                !selectedResident && { color: "#A0AEC0" },
              ]}
            >
              {fetchingResidents
                ? "Loading residents..."
                : selectedResident
                  ? `Unit ${selectedResident.houseNumber || "N/A"} - ${selectedResident.name}`
                  : "Tap to select a resident"}
            </Text>
            <Ionicons name="chevron-down" size={20} color={C.textLight} />
          </TouchableOpacity>

          <Text style={styles.label}>Amount (Rs.)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 1500.00"
            keyboardType="decimal-pad"
            value={amount}
            onChangeText={setAmount}
          />

          <Text style={styles.label}>Bill Type</Text>
          <View style={styles.typeRow}>
            {["RENT", "UTILITY", "LATE FEE", "OTHER"].map((t) => (
              <TouchableOpacity
                key={t}
                style={[styles.typeChip, type === t && styles.typeChipActive]}
                onPress={() => setType(t)}
              >
                <Text
                  style={[styles.typeText, type === t && styles.typeTextActive]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Due Date</Text>
          <TouchableOpacity
            style={styles.input} // Reusing your input style to match the form!
            onPress={() => setShowDueDatePicker(true)}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: 16, color: C.textDark }}>
                {dueDate.toLocaleDateString([], { dateStyle: "medium" })}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={C.textLight} />
            </View>
          </TouchableOpacity>

          {/* ─── iOS INLINE DATE PICKER ─── */}
          {Platform.OS === "ios" && showDueDatePicker && (
            <View
              style={{
                backgroundColor: "#F1F5F9",
                borderRadius: 12,
                marginTop: 8,
                overflow: "hidden",
              }}
            >
              <DateTimePicker
                value={dueDate}
                mode="date"
                display="inline"
                textColor={C.textDark}
                onChange={(event, selectedDate) => {
                  if (selectedDate) setDueDate(selectedDate);
                }}
              />
              <Button
                title="Done"
                onPress={() => setShowDueDatePicker(false)}
              />
            </View>
          )}

          {/* ─── ANDROID NATIVE POPUP PICKER ─── */}
          {Platform.OS === "android" && showDueDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDueDatePicker(false);
                if (event.type !== "dismissed" && selectedDate) {
                  setDueDate(selectedDate);
                }
              }}
            />
          )}

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleIssueBill}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={C.white} />
            ) : (
              <Text style={styles.submitButtonText}>Issue Bill</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* --- CUSTOM DROPDOWN MODAL WITH SEARCH --- */}
      <Modal visible={dropdownVisible} transparent={true} animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDropdownVisible(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Resident</Text>
              <TouchableOpacity onPress={() => setDropdownVisible(false)}>
                <Ionicons name="close" size={24} color={C.textDark} />
              </TouchableOpacity>
            </View>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={C.textLight} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by house number..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                keyboardType="default"
              />
            </View>

            <ScrollView
              style={styles.modalList}
              keyboardShouldPersistTaps="handled"
            >
              {filteredResidents.length === 0 ? (
                <Text
                  style={{
                    padding: 20,
                    textAlign: "center",
                    color: C.textLight,
                  }}
                >
                  No residents found for this unit.
                </Text>
              ) : (
                filteredResidents.map((resident) => (
                  <TouchableOpacity
                    key={resident.id}
                    style={styles.modalListItem}
                    onPress={() => {
                      setSelectedResident(resident);
                      setDropdownVisible(false);
                    }}
                  >
                    <View style={styles.residentInfoLeft}>
                      <Text style={styles.houseNumberBadge}>
                        Unit {resident.houseNumber || "N/A"}
                      </Text>
                      <View>
                        <Text style={styles.residentName}>{resident.name}</Text>
                        <Text style={styles.residentEmail}>
                          {resident.email}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  // Header Styles
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  backButton: { padding: 5, width: 40 },
  headerTextContainer: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 22, fontWeight: "800", color: C.textDark },
  headerSubtitle: { fontSize: 13, color: C.textLight, marginTop: 2 },
  backButtonSpacer: { width: 40 }, // Balances the back button to keep text perfectly centered

  content: { padding: 20 },
  card: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: C.textDark,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#FAFAFA",
  },

  // Dropdown Styles
  dropdownTrigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#FAFAFA",
  },
  dropdownTriggerText: { fontSize: 16, color: C.textDark },

  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  typeChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
  },
  typeChipActive: { backgroundColor: C.primary, borderColor: C.primary },
  typeText: { color: C.textLight, fontWeight: "600" },
  typeTextActive: { color: C.white },
  submitButton: {
    backgroundColor: C.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },
  submitButtonText: { color: C.white, fontSize: 16, fontWeight: "700" },

  // Modal & Search Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: C.overlay,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: C.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "80%",
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", color: C.textDark },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 16, color: C.textDark },

  modalList: { marginBottom: 20 },
  modalListItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    flexDirection: "row",
    alignItems: "center",
  },
  residentInfoLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  houseNumberBadge: {
    backgroundColor: C.primaryLight,
    color: C.primary,
    fontWeight: "700",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    marginRight: 15,
    overflow: "hidden",
  },
  residentName: { fontSize: 16, fontWeight: "600", color: C.textDark },
  residentEmail: { fontSize: 13, color: C.textLight, marginTop: 2 },
});
