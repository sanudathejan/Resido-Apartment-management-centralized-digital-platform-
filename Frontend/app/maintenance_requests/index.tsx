import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { apiService } from "@/services/api";

const COLORS = {
  background: '#D8F3DC',
  primary: "#2563EB",
  white: "#FFFFFF",
  textDark: "#1E293B",
  textLight: "#64748B",
  border: "#E2E8F0",
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
};

export default function ResidentMaintenanceScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"NEW" | "HISTORY">("NEW");

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // History State
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activeTab === "HISTORY") fetchMyRequests();
  }, [activeTab]);

  const fetchMyRequests = async () => {
    setIsLoading(true);
    try {
      const data = (await apiService.get("/api/maintenance")) as any[];
      // Sort newest first
      setRequests(data.sort((a, b) => b.id - a.id));
    } catch (error) {
      Alert.alert("Error", "Could not load maintenance history.");
    } finally {
      setIsLoading(false);
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5, // Compress it a bit so the Base64 string isn't massive
      base64: true, // Crucial: This gets the raw image data for our JSON payload
    });

    if (!result.canceled && result.assets[0].base64) {
      setImageBase64(result.assets[0].base64);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert(
        "Missing Fields",
        "Please provide both a title and description.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await apiService.post("/api/maintenance", {
        title,
        description,
        imageBase64, // Send the optional image
      });

      Alert.alert("Success", "Maintenance request submitted!");
      setTitle("");
      setDescription("");
      setImageBase64(null);
      setActiveTab("HISTORY"); // Switch to history tab to see it
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to submit request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    // Remove any accidental quotation marks from the database
    const cleanStatus = status.replace(/"/g, "");

    if (cleanStatus === "PENDING") return COLORS.warning;
    if (cleanStatus === "RESOLVED") return COLORS.success;
    return COLORS.textLight;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Maintenance</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "NEW" && styles.activeTab]}
          onPress={() => setActiveTab("NEW")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "NEW" && styles.activeTabText,
            ]}
          >
            New Request
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "HISTORY" && styles.activeTab]}
          onPress={() => setActiveTab("HISTORY")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "HISTORY" && styles.activeTabText,
            ]}
          >
            My Requests
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "NEW" ? (
        <ScrollView contentContainerStyle={styles.formContainer}>
          <Text style={styles.label}>Issue Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Leaking faucet"
            placeholderTextColor={COLORS.textLight}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe the issue in detail..."
            placeholderTextColor={COLORS.textLight}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          <Text style={styles.label}>Photo (Optional)</Text>
          {imageBase64 ? (
            <View style={styles.imagePreviewContainer}>
              <Image
                source={{ uri: `data:image/jpeg;base64,${imageBase64}` }}
                style={styles.imagePreview}
              />
              <TouchableOpacity
                style={styles.removeImageBtn}
                onPress={() => setImageBase64(null)}
              >
                <Ionicons name="close-circle" size={28} color={COLORS.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.imageUploadBtn} onPress={pickImage}>
              <Ionicons
                name="camera-outline"
                size={32}
                color={COLORS.primary}
              />
              <Text style={styles.imageUploadText}>Upload from Gallery</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.submitBtnText}>Submit Request</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={{ flex: 1 }}>
          {isLoading ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={{ marginTop: 50 }}
            />
          ) : (
            <FlatList
              data={requests}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.listContainer}
              renderItem={({ item }) => (
                <View style={styles.card}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text
                      style={[
                        styles.statusText,
                        { color: getStatusColor(item.status) },
                      ]}
                    >
                      {item.status.replace(/"/g, "")}
                    </Text>
                  </View>
                  <Text style={styles.cardDesc}>{item.description}</Text>
                  {item.imageBase64 && (
                    <Image
                      source={{
                        uri: `data:image/jpeg;base64,${item.imageBase64}`,
                      }}
                      style={styles.cardImage}
                    />
                  )}
                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No maintenance requests found.
                </Text>
              }
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    padding: 24,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 24, fontWeight: "700", color: COLORS.textDark },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 24,
    backgroundColor: COLORS.border,
    padding: 4,
    borderRadius: 12,
    marginBottom: 16,
  },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: COLORS.white, elevation: 2 },
  tabText: { fontSize: 14, fontWeight: "600", color: COLORS.textLight },
  activeTabText: { color: COLORS.primary },
  formContainer: { padding: 24 },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textDark,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 20,
  },
  textArea: { height: 120 },
  imageUploadBtn: {
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderStyle: "dashed",
    borderRadius: 12,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  imageUploadText: { color: COLORS.primary, marginTop: 8, fontWeight: "500" },
  imagePreviewContainer: { position: "relative", marginBottom: 24 },
  imagePreview: { width: "100%", height: 200, borderRadius: 12 },
  removeImageBtn: {
    position: "absolute",
    top: -10,
    right: -10,
    backgroundColor: COLORS.white,
    borderRadius: 20,
  },
  submitBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  submitBtnText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
  listContainer: { padding: 24, paddingTop: 8, gap: 16 },
  card: {
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textDark,
    flex: 1,
  },
  statusText: { fontSize: 14, fontWeight: "700", marginLeft: 8 },
  cardDesc: { color: COLORS.textLight, fontSize: 15, marginBottom: 12 },
  cardImage: { width: "100%", height: 150, borderRadius: 8, marginTop: 8 },
  emptyText: {
    textAlign: "center",
    color: COLORS.textLight,
    marginTop: 40,
    fontSize: 16,
  },
});
