/**
 * Authentication Context for Resiido
 * Manages user authentication state across the app
 */

import { APP_CONFIG } from '@/constants/config';
import { authService } from '@/services';
import {
  LoginRequest,
  RegisterRequest,
  RegistrationInitiateRequest,
  RegistrationInitiateResponse,
  User,
} from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  initiateRegistration: (userData: RegistrationInitiateRequest) => Promise<RegistrationInitiateResponse>;
  verifyRegistrationOtp: (email: string, otp: string) => Promise<void>;
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
      const userData = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
      await AsyncStorage.setItem(
        APP_CONFIG.STORAGE_KEYS.USER_DATA,
        JSON.stringify(response.user)
      );
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      const response = await authService.register(userData);
      setUser(response.user);
      await AsyncStorage.setItem(
        APP_CONFIG.STORAGE_KEYS.USER_DATA,
        JSON.stringify(response.user)
      );
    } catch (error) {
      throw error;
    }
  };

  /**
   * Initiate registration — triggers OTP to be sent to the user's email
   */
  const initiateRegistration = async (
    userData: RegistrationInitiateRequest
  ): Promise<RegistrationInitiateResponse> => {
    try {
      const response = await authService.initiateRegistration(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  /**
   * Verify OTP to complete registration and log the user in
   */
  const verifyRegistrationOtp = async (email: string, otp: string): Promise<void> => {
    try {
      const response = await authService.verifyOtp({ email, otp });
      setUser(response.user);
      await AsyncStorage.setItem(
        APP_CONFIG.STORAGE_KEYS.USER_DATA,
        JSON.stringify(response.user)
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
      console.error('Logout error:', error);
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
        JSON.stringify(updatedUser)
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
        initiateRegistration,
        verifyRegistrationOtp,
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
