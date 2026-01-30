/**
 * TypeScript interfaces for Resiido API
 */

// User types
export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  apartmentNumber?: string;
  profileImage?: string;
}

export type UserRole = 'RESIDENT' | 'ADMIN' | 'SECURITY' | 'MAINTENANCE';

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
  apartmentNumber?: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
  message?: string;
}

// Payment types
export interface Payment {
  id: number;
  amount: number;
  type: PaymentType;
  dueDate: string;
  isPaid: boolean;
  paidDate?: string;
  resident: User;
}

export type PaymentType = 'RENT' | 'PARKING' | 'LATE_FEE' | 'UTILITY' | 'MAINTENANCE';

// Maintenance types
export interface MaintenanceRequest {
  id: number;
  title: string;
  description: string;
  status: MaintenanceStatus;
  resident: User;
  createdAt?: string;
  updatedAt?: string;
  category?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  assignedTo?: User;
  images?: string[];
}

export type MaintenanceStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

// Parking types
export interface ParkingSlot {
  id: number;
  slotNumber: string;
  isAvailableForLending: boolean;
  owner: User;
  vehicleNumber?: string;
  vehicleType?: string;
}

export interface ParkingRequest {
  id: number;
  slot: ParkingSlot;
  requestedBy: User;
  startDate: string;
  endDate: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason?: string;
}

export interface VisitorEntry {
  id: number;
  visitorName: string;
  visitorPhone?: string;
  vehicleNumber?: string;
  purpose: string;
  resident: User;
  entryTime: string;
  exitTime?: string;
  status: 'PENDING' | 'CHECKED_IN' | 'CHECKED_OUT';
}

// SOS types
export interface SosAlert {
  id: number;
  timestamp: string;
  resident: User;
  isActive: boolean;
  message?: string;
  location?: string;
  respondedBy?: User;
  respondedAt?: string;
}

// Announcement types
export interface Announcement {
  id: number;
  title: string;
  content: string;
  category: AnnouncementCategory;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  createdAt: string;
  createdBy: User;
  expiresAt?: string;
  isRead?: boolean;
}

export type AnnouncementCategory = 'GENERAL' | 'MAINTENANCE' | 'SECURITY' | 'EVENT' | 'EMERGENCY';

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  size: number;
}

// Dashboard types
export interface DashboardStats {
  pendingPayments: number;
  activeMaintenanceRequests: number;
  unreadAnnouncements: number;
  upcomingVisitors: number;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
