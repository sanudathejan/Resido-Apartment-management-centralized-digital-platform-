/**
 * Authentication Context for Resiido
 * Manages user authentication state across the app
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User, LoginRequest, RegisterRequest } from "@/types";
import { authService } from "@/services";
import { APP_CONFIG } from "@/constants/config";
import { apiService } from "@/services/api";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  verifyRegistration: (email: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const userData = await AsyncStorage.getItem(
        APP_CONFIG.STORAGE_KEYS.USER_DATA,
      );
      if (userData) {
        setUser(JSON.parse(userData));
        loadProfilePicture();
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProfilePicture = async () => {
    try {
      const response = await apiService.get<{ image: string | null }>(
        "/api/users/profile-picture",
      );
      if (response && response.image) {
        // Update the state and storage with the fetched image
        setUser((prev) =>
          prev ? { ...prev, profilePicture: response.image } : null,
        );
      }
    } catch (error) {
      console.error("Silent failed to fetch profile pic on login:", error);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      await AsyncStorage.setItem(
        APP_CONFIG.STORAGE_KEYS.USER_DATA,
        JSON.stringify(response.user),
      );
      loadProfilePicture();
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      await authService.register(userData);
      // Wait for PIN verification before setting user
    } catch (error) {
      throw error;
    }
  };

  const verifyRegistration = async (email: string, code: string) => {
    try {
      const response = await authService.verifyRegistration(email, code);
      setUser(response.user);
      await AsyncStorage.setItem(
        APP_CONFIG.STORAGE_KEYS.USER_DATA,
        JSON.stringify(response.user),
      );
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      // Still clear user even if logout fails
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      AsyncStorage.setItem(
        APP_CONFIG.STORAGE_KEYS.USER_DATA,
        JSON.stringify(updatedUser),
      );
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        verifyRegistration,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
