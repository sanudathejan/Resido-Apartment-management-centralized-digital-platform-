/**
 * Authentication Service for Resiido
 * Supports demo mode when backend is not available
 */

import apiService from './api';
import { API_CONFIG, APP_CONFIG } from '@/constants/config';
import { User, LoginRequest, RegisterRequest, AuthResponse } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Demo mode flag - set to true when backend is not available
const DEMO_MODE = true;

// Demo users for testing
const DEMO_USERS: User[] = [
  {
    id: 1,
    name: 'John Resident',
    email: 'resident@demo.com',
    password: 'demo123',
    role: 'RESIDENT',
    phone: '+94 77 123 4567',
    apartmentNumber: 'A-101',
  },
  {
    id: 2,
    name: 'Sarah Manager',
    email: 'manager@demo.com',
    password: 'demo123',
    role: 'MANAGER',
    phone: '+94 77 987 6543',
    apartmentNumber: 'A-001',
    managedApartment: {
      id: 1,
      name: 'PrimeLux Residence Colombo',
      location: '23/A, Bakers street, Colombo 7',
      address: '23/A, Bakers street, Colombo 7, Sri Lanka',
      numberOfUnits: 64,
    },
  },
];

class AuthService {
  /**
   * Login user with email and password
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      // Demo mode - use local demo users
      if (DEMO_MODE) {
        const user = DEMO_USERS.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        );

        if (user) {
          const { password, ...safeUser } = user;
          await this.saveUserData(safeUser as User);
          return { user: safeUser as User, message: 'Login successful', token: 'demo-token' };
        }

        // Allow any email/password in demo mode for testing
        const demoUser: User = {
          id: Date.now(),
          name: credentials.email.split('@')[0],
          email: credentials.email,
          role: 'RESIDENT',
          apartmentNumber: 'B-4',
          phone: '+94 XX XXX XXXX',
        };
        await this.saveUserData(demoUser);
        return { user: demoUser, message: 'Demo login successful', token: 'demo-token' };
      }

      // Production mode - call API
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
  async register(userData: RegisterRequest): Promise<{ message: string }> {
    try {
      // Demo mode
      if (DEMO_MODE) {
        return { message: 'Registration initiated' };
      }

      // Production mode - call API
      const newUserData: Partial<User> = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'RESIDENT',
      };

      await apiService.post(API_CONFIG.ENDPOINTS.USERS, newUserData);
      
      return { message: 'Registration initiated' };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Verify an OTP for registration
   */
  async verifyRegistration(email: string, code: string): Promise<AuthResponse> {
    try {
      if (DEMO_MODE) {
        if (code !== '12345') {
          throw new Error('Invalid verification code. Use 12345 for demo.');
        }
        
        let user = DEMO_USERS.find(u => u.email === email);
        if (!user) {
          user = {
            id: Date.now(),
            name: email.split('@')[0],
            email: email,
            role: 'RESIDENT',
            apartmentNumber: 'B-' + Math.floor(Math.random() * 20 + 1),
          };
        }
        
        await this.saveUserData(user);
        return { user, message: 'Verification successful', token: 'demo-token' };
      }

      // Production mode - call API
      const response = await apiService.post<AuthResponse>(`${API_CONFIG.ENDPOINTS.USERS}/verify`, { email, code });
      if (response.user) {
         await this.saveUserData(response.user);
      }
      return response;
    } catch (error) {
      console.error('Verification error:', error);
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
