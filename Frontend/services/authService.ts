/**
 * Authentication Service for Resiido
 * Supports demo mode when backend is not available
 */

import { API_CONFIG, APP_CONFIG } from '@/constants/config';
import {
  AuthResponse,
  LoginRequest,
  OtpVerifyRequest,
  RegisterRequest,
  RegistrationInitiateRequest,
  RegistrationInitiateResponse,
  User,
} from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from './api';

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
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      // Demo mode - create user locally
      if (DEMO_MODE) {
        const newUser: User = {
          id: Date.now(),
          name: userData.name || userData.email.split('@')[0],
          email: userData.email,
          role: userData.role || 'RESIDENT',
          phone: userData.phone,
          apartmentNumber: 'B-' + Math.floor(Math.random() * 20 + 1),
        };

        // If registering as manager, add managed apartment
        if (userData.role === 'MANAGER') {
          newUser.managedApartment = {
            id: 1,
            name: 'PrimeLux Residence Colombo',
            location: '23/A, Bakers street, Colombo 7',
            address: '23/A, Bakers street, Colombo 7, Sri Lanka',
            numberOfUnits: 64,
          };
        }

        await this.saveUserData(newUser);
        return { user: newUser, message: 'Registration successful', token: 'demo-token' };
      }

      // Production mode - call API
      const newUserData: Partial<User> = {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role || 'RESIDENT',
      };

      const user = await apiService.post<User>(API_CONFIG.ENDPOINTS.USERS, newUserData);
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

  /**
   * Initiate registration — sends OTP to email via backend
   */
  async initiateRegistration(
    userData: RegistrationInitiateRequest
  ): Promise<RegistrationInitiateResponse> {
    try {
      if (DEMO_MODE) {
        // In demo mode, simulate OTP being sent
        console.log('[DEMO] OTP sent to:', userData.email);
        return {
          message: 'OTP sent successfully to ' + userData.email,
          email: userData.email,
        };
      }

      const response = await apiService.post<RegistrationInitiateResponse>(
        API_CONFIG.ENDPOINTS.REGISTER,
        userData
      );
      return response;
    } catch (error) {
      console.error('Initiate registration error:', error);
      throw error;
    }
  }

  /**
   * Verify OTP and complete registration
   */
  async verifyOtp(request: OtpVerifyRequest): Promise<AuthResponse> {
    try {
      if (DEMO_MODE) {
        // In demo mode, accept any 6-digit OTP
        if (request.otp.length === 6) {
          const demoUser: User = {
            id: Date.now(),
            name: request.email.split('@')[0],
            email: request.email,
            role: 'RESIDENT',
            apartmentNumber: 'B-' + Math.floor(Math.random() * 20 + 1),
            phone: '+94 XX XXX XXXX',
          };
          await this.saveUserData(demoUser);
          return {
            user: demoUser,
            message: 'Registration verified successfully',
            token: 'demo-token',
          };
        }
        throw new Error('Invalid OTP. Please try again.');
      }

      const response = await apiService.post<AuthResponse>(
        API_CONFIG.ENDPOINTS.VERIFY_OTP,
        request
      );
      if (response.user) {
        await this.saveUserData(response.user);
        if (response.token) {
          apiService.setToken(response.token);
          await AsyncStorage.setItem(APP_CONFIG.STORAGE_KEYS.AUTH_TOKEN, response.token);
        }
      }
      return response;
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error;
    }
  }

  /**
   * Resend OTP to email
   */
  async resendOtp(email: string): Promise<RegistrationInitiateResponse> {
    try {
      if (DEMO_MODE) {
        console.log('[DEMO] OTP resent to:', email);
        return { message: 'OTP resent to ' + email, email };
      }

      const response = await apiService.post<RegistrationInitiateResponse>(
        API_CONFIG.ENDPOINTS.RESEND_OTP,
        { email }
      );
      return response;
    } catch (error) {
      console.error('Resend OTP error:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();
export default authService;
