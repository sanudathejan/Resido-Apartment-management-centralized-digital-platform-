/**
 * Authentication Service for Resiido
 */

import apiService from './api';
import { API_CONFIG, APP_CONFIG } from '@/constants/config';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // For now, using basic user endpoint until auth endpoint is ready
      const users = await apiService.get<User[]>(API_CONFIG.ENDPOINTS.USERS);
      
      const user = users.find(
        (u) => u.email === credentials.email && u.password === credentials.password
      );

      if (user) {
        await this.saveUserData(user);
        return { user, message: 'Login successful', token: 'temp-token' };
      }

      throw new Error('Invalid email or password');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const newUser: Partial<User> = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'RESIDENT',
      };

      const user = await apiService.post<User>(API_CONFIG.ENDPOINTS.USERS, newUser);
      await this.saveUserData(user);
      
      return { user, message: 'Registration successful' };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN,
        APP_CONFIG.STORAGE_KEYS.USER_DATA,
      ]);
      apiService.setToken(null);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Save user data to storage
   */
  private async saveUserData(user: User): Promise<void> {
    await AsyncStorage.setItem(
      APP_CONFIG.STORAGE_KEYS.USER_DATA,
      JSON.stringify(user)
    );
  }

  /**
   * Get current user from storage
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(APP_CONFIG.STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: number, data: Partial<User>): Promise<User> {
    const endpoint = API_CONFIG.ENDPOINTS.USER_BY_ID(userId);
    const user = await apiService.put<User>(endpoint, data);
    await this.saveUserData(user);
    return user;
  }
}

export const authService = new AuthService();
export default authService;
