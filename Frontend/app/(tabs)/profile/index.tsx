/**
 * Profile Screen
 * User profile and account management — 2026 light theme
 */
import { apiService } from "@/services/api";
import React, { useState } from "react";
import { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
  Modal,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/AuthContext";
import * as ImagePicker from "expo-image-picker"; // <-- Added ImagePicker import

/* ── design tokens ─────────────────────────────────────────────── */
const C = {
  bg: "#EBF7ED",
  primary: "#2563EB",
  primaryLight: "#EFF6FF",
  avatarBg: "#DBEAFE",
  white: "#FFFFFF",
  textDark: "#1E293B",
  textLight: "#64748B",
  textMuted: "#94A3B8",
  border: "#E2E8F0",
  success: "#10B981",
  error: "#EF4444",
} as const;

/* ── platform shadow helper ────────────────────────────────────── */
const shadow = (elevation: number) =>
  Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: 0.08,
      shadowRadius: elevation,
    },
    android: {
      elevation,
    },
    default: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: elevation / 2 },
      shadowOpacity: 0.08,
      shadowRadius: elevation,
    },
  }) as object;

/* ── component ─────────────────────────────────────────────────── */
export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();

  // State to hold our profile picture URI
  const [profilePic, setProfilePic] = useState<string | null>(null);

  //states for the Name Edit Modal
  const [isNameModalVisible, setNameModalVisible] = useState(false);
  const [newNameInput, setNewNameInput] = useState(user?.name || "");

  // Function to save the new name
  const handleSaveName = async () => {
    if (!newNameInput.trim()) {
      Alert.alert("Hold up", "Name cannot be empty!");
      return;
    }

    try {
      // 1. Send it to the Spring Boot backend
      await apiService.put("/api/users/name", { name: newNameInput.trim() });

      // 2. Update the local context so the UI changes instantly
      updateUser({ name: newNameInput.trim() });

      // 3. Close the modal and celebrate
      setNameModalVisible(false);
      console.log("Success! Name updated.");
    } catch (error) {
      console.error("Failed to update name:", error);
      Alert.alert("Error", "Could not connect to the server.");
    }
  };

  useEffect(() => {
    const loadProfilePicture = async () => {
      try {
        // Hit the GET endpoint you already made in Spring Boot
        const response = await apiService.get<{ image: string | null }>(
          "/api/users/profile-picture",
        );

        if (response && response.image) {
          setProfilePic(response.image); // Instantly display the saved image!
        }
      } catch (error) {
        console.error("Failed to load profile picture on mount:", error);
      }
    };

    loadProfilePicture();
  }, []); // The empty array means this only runs once when the screen opens

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/welcome");
        },
      },
    ]);
  };

  const saveImageToDatabase = async (base64Data: string | null) => {
    try {
      await apiService.put("/api/users/profile-picture", {
        image: base64Data || "",
      });

      console.log("Success! Saved to DB.");
    } catch (error) {
      console.error("Network error:", error);
      Alert.alert("Error", "Could not connect to the server.");
    }
  };

  /* ── Image Picker & Menu Logic ───────────────────────────────── */
  const pickImage = async () => {
    // Open the native image gallery
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      //Grab the raw Base64 string
      const rawBase64 = result.assets[0].base64;
      //Format it as a Data URI (so it renders easily and saves cleanly)
      const formattedBase64 = `data:image/jpeg;base64,${rawBase64}`;
      //Update the UI immediately
      setProfilePic(formattedBase64);
      updateUser({ profileImage: formattedBase64 });
      //SEND IT TO THE BACKEND!
      await saveImageToDatabase(formattedBase64);
    }
  };

  const confirmDeleteImage = () => {
    Alert.alert(
      "Delete Picture",
      "Are you sure you want to delete your current profile picture?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            //Clear the image from the screen immediately
            setProfilePic(null);
            //Update the global AuthContext so other screens know it's gone
            updateUser({ profileImage: undefined });
            //Tell the Spring Boot backend to delete it from PostgreSQL
            await saveImageToDatabase(null);
          },
        },
      ],
    );
  };

  const handleProfilePicturePress = () => {
    Alert.alert("Profile Picture", "What would you like to do?", [
      { text: "Cancel", style: "cancel" },
      { text: "Change Picture", onPress: pickImage },
      {
        text: "Delete Picture",
        onPress: confirmDeleteImage,
        style: "destructive",
      },
    ]);
  };

  const userName = user?.name || "John Doe";
  const userEmail = user?.email || "john.doe@email.com";
  const apartmentNo = user?.apartmentNumber || "A-101";
  const userRole = user?.role || "RESIDENT";
  const initial = userName.charAt(0).toUpperCase();

  /* ── menu data ─────────────────────────────────────────────── */
  const menuItems = [
    {
      section: "Account",
      items: [
        {
          icon: "person-outline" as const,
          title: "Update Profile Name",
          subtitle: "Update your personal information",
          onPress: () => {
            setNewNameInput(user?.name || ""); // Reset input to current name
            setNameModalVisible(true); // Show the modal
          },
        },
        {
          icon: "camera-outline" as const,
          title: "Update Profile Picture",
          subtitle: "Change your display photo",
          onPress: handleProfilePicturePress, // <-- Linked to our new function!
        },
        {
          icon: "lock-closed-outline" as const,
          title: "Change Password",
          subtitle: "Update your password",
          onPress: () => {},
        },
      ],
    },
    {
      section: "About Us",
      items: [
        {
          icon: "chatbubble-outline" as const,
          title: "Contact Support",
          subtitle: "Reach out to our team",
          onPress: () => {},
        },
        {
          icon: "information-circle-outline" as const,
          title: "About Resido",
          subtitle: "Version 1.0.0",
          onPress: () => {},
        },
      ],
    },
  ];

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* ── flat header ─────────────────────────────────────── */}
      <View style={styles.header}>
        {/* avatar circle */}
        <View style={styles.avatarOuter}>
          <View style={styles.avatar}>
            {/* Show image if we have one, otherwise show initials */}
            {profilePic ? (
              <Image source={{ uri: profilePic }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>{initial}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.cameraBtn}
            activeOpacity={0.7}
            onPress={handleProfilePicturePress} // <-- Linked to our new function!
          >
            <Ionicons name="camera" size={14} color={C.white} />
          </TouchableOpacity>
        </View>

        <Text style={styles.userName}>{userName}</Text>
        <Text style={styles.userEmail}>{userEmail}</Text>

        {/* info pills */}
        <View style={styles.pillRow}>
          <View style={styles.pill}>
            <Ionicons name="home-outline" size={13} color={C.primary} />
            <Text style={styles.pillText}>Apt {apartmentNo}</Text>
          </View>
          <View style={styles.pill}>
            <Ionicons name="person-outline" size={13} color={C.primary} />
            <Text style={styles.pillText}>{userRole}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── menu sections ──────────────────────────────── */}
        {menuItems.map((section, sectionIdx) => (
          <View key={sectionIdx} style={styles.menuSection}>
            <Text style={styles.sectionTitle}>{section.section}</Text>

            <View style={[styles.menuCard, shadow(4)]}>
              {section.items.map((item, itemIdx) => {
                const isLast = itemIdx === section.items.length - 1;

                return (
                  <TouchableOpacity
                    key={itemIdx}
                    style={[styles.menuItem, !isLast && styles.menuItemBorder]}
                    onPress={item.onPress}
                    disabled={false}
                    activeOpacity={0.6}
                  >
                    {/* icon circle */}
                    <View style={styles.menuIconCircle}>
                      <Ionicons
                        name={item.icon as keyof typeof Ionicons.glyphMap}
                        size={20}
                        color={C.primary}
                      />
                    </View>

                    {/* text */}
                    <View style={styles.menuTextBlock}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                    </View>

                    {/* right control */}
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color={C.textMuted}
                    />
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}

        {/* ── logout button ──────────────────────────────── */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.65}
        >
          <Ionicons name="log-out-outline" size={20} color={C.error} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        {/* ── footer credit ──────────────────────────────── */}
        <Text style={styles.footerText}>
          SDGP Project{"\n"}University of Westminster
        </Text>
      </ScrollView>

      {/* ── Name Edit Modal ──────────────────────────────── */}
      <Modal visible={isNameModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Name</Text>

            <TextInput
              style={styles.modalInput}
              value={newNameInput}
              onChangeText={setNewNameInput}
              placeholder="Enter your new name"
              autoCapitalize="words"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnCancel]}
                onPress={() => setNameModalVisible(false)}
              >
                <Text style={styles.modalBtnCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnSave]}
                onPress={handleSaveName}
              >
                <Text style={styles.modalBtnSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ── styles ────────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  /* layout */
  container: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },

  /* ── header ─────────────────────────────────────────────────── */
  header: {
    backgroundColor: C.bg,
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },

  /* avatar */
  avatarOuter: {
    position: "relative",
    marginBottom: 14,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "#DBEAFE",
    borderWidth: 3,
    borderColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden", // <-- Added to ensure images stay inside the circle
  },
  avatarImage: {
    width: "100%", // <-- Added new style for the image
    height: "100%",
  },
  avatarText: {
    fontSize: 34,
    fontWeight: "700",
    color: C.primary,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: C.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: C.bg,
  },

  /* name / email */
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: C.textDark,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: C.textLight,
    marginBottom: 14,
  },

  /* pills */
  pillRow: {
    flexDirection: "row",
    gap: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: C.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.primary,
    textTransform: "capitalize",
  },

  /* ── menu sections ──────────────────────────────────────────── */
  menuSection: {
    marginBottom: 22,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginLeft: 4,
  },
  menuCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  menuIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: C.primaryLight,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  menuTextBlock: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: C.textDark,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: C.textLight,
  },

  /* ── logout ─────────────────────────────────────────────────── */
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: C.error,
    marginTop: 8,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: C.error,
  },

  /* ── footer ─────────────────────────────────────────────────── */
  footerText: {
    textAlign: "center",
    fontSize: 12,
    color: C.textMuted,
    lineHeight: 18,
    marginBottom: 20,
  },

  /* ── Modal Styles ────────────────────────────────────────────── */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: C.white,
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: C.textDark,
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: C.textDark,
    marginBottom: 24,
    backgroundColor: C.primaryLight,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  modalBtnCancel: {
    backgroundColor: C.bg,
  },
  modalBtnSave: {
    backgroundColor: C.primary,
  },
  modalBtnCancelText: {
    color: C.textDark,
    fontWeight: "600",
    fontSize: 16,
  },
  modalBtnSaveText: {
    color: C.white,
    fontWeight: "600",
    fontSize: 16,
  },

});
