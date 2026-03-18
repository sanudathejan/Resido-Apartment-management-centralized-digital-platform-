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
  // Manager-specific fields
  managedApartmentId?: number;
  managedApartment?: Apartment;
}

export type UserRole = 'RESIDENT' | 'MANAGER' | 'ADMIN' | 'SECURITY' | 'MAINTENANCE';

// Apartment/Building types
export interface Apartment {
  id: number;
  name: string;
  location: string;
  address: string;
  numberOfUnits: number;
  numberOfFloors?: number;
  amenities?: string[];
  managerId?: number;
  createdAt?: string;
}

// Common Area Booking types
export interface CommonArea {
  id: number;
  name: string;
  description?: string;
  capacity?: number;
  isAvailable: boolean;
  apartmentId: number;
  images?: string[];
  rules?: string[];
  openTime?: string;
  closeTime?: string;
}

export interface CommonAreaBooking {
  id: number;
  commonArea: CommonArea;
  resident: User;
  date: string;
  startTime: string;
  endTime: string;
  purpose?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt?: string;
  approvedBy?: User;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
  role?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  phone?: string;
  apartmentNumber?: string;
  requestedHouseNumber?: string;
}

export interface AuthResponse {
  user: User;
  token?: string;
  message?: string;
}

export interface Payment {
  id: number;
  amount: number;
  type: string; // 'RENT', 'MAINTENANCE', 'UTILITY', 'LATE_FEE'
  dueDate: string; // 'YYYY-MM-DD'
  receiptImage?: string; // Base64
  status: 'PENDING' | 'REVIEW' | 'PAID' | 'REJECTED';
  paid: boolean;
  resident: {
    id: number;
    name: string;
    email: string;
  };
}

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
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}
