/**
 * Resiido App Configuration
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.8:8080', // ipconfig

  ENDPOINTS: {
    // Auth
    LOGIN: "/api/auth/login",
    REGISTER: "/api/auth/register",
    VERIFY: "/api/auth/verify-account",

    // Users
    USERS: "/api/users",
    USER_BY_ID: (id: number) => `/api/users/${id}`,

    // Payments
    PAYMENTS: "/api/payments",
    PAYMENTS_BY_USER: (userId: number) => `/api/payments/user/${userId}`,

    // Maintenance
    MAINTENANCE: "/api/maintenance",
    MAINTENANCE_BY_USER: (userId: number) => `/api/maintenance/user/${userId}`,

    // Parking
    PARKING_SLOTS: "/api/parking/slots",
    PARKING_REQUESTS: "/api/parking/requests",
    PARKING_BY_USER: (userId: number) => `/api/parking/user/${userId}`,

    // SOS
    SOS: "/api/sos",
    SOS_ACTIVE: "/api/sos/active",

    // Announcements
    ANNOUNCEMENTS: "/api/announcements",

    // Common Areas & Bookings
    COMMON_AREAS: "/api/common-areas",
    BOOKINGS: "/api/bookings",
    BOOKINGS_BY_USER: (userId: number) => `/api/bookings/user/${userId}`,

    // Houses
    HOUSES: "/api/houses/status",

    // Manager
    MANAGER_RESIDENTS: "/api/manager/residents",

    // Apartments (Manager)
    APARTMENTS: "/api/apartments",
    APARTMENT_BY_ID: (id: number) => `/api/apartments/${id}`,
    APARTMENT_RESIDENTS: (id: number) => `/api/apartments/${id}/residents`,
  },

  TIMEOUT: 30000, // 30 seconds
};

// App Configuration
export const APP_CONFIG = {
  NAME: "Resiido",
  VERSION: "1.0.0",

  // Storage keys
  STORAGE_KEYS: {
    AUTH_TOKEN: "@resiido_auth_token",
    USER_DATA: "@resiido_user_data",
    THEME: "@resiido_theme",
    ONBOARDING_COMPLETE: "@resiido_onboarding",
  },

  // User roles
  ROLES: {
    RESIDENT: "RESIDENT",
    MANAGER: "MANAGER",
    ADMIN: "ADMIN",
    SECURITY: "SECURITY",
    MAINTENANCE: "MAINTENANCE",
  },

  // Payment types
  PAYMENT_TYPES: {
    RENT: "RENT",
    PARKING: "PARKING",
    LATE_FEE: "LATE_FEE",
    UTILITY: "UTILITY",
    MAINTENANCE: "MAINTENANCE",
  },

  // Maintenance status
  MAINTENANCE_STATUS: {
    PENDING: "PENDING",
    IN_PROGRESS: "IN_PROGRESS",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
  },

  // Pagination
  PAGE_SIZE: 10,
};

// Feature flags
export const FEATURES = {
  SOS_ENABLED: true,
  PARKING_ENABLED: true,
  MAINTENANCE_ENABLED: true,
  PAYMENTS_ENABLED: true,
  ANNOUNCEMENTS_ENABLED: true,
  DARK_MODE_ENABLED: true,
  OTP_LOGIN_ENABLED: false,
  COMMON_AREA_BOOKING_ENABLED: true,
};

// API endpoint aliases for backward compatibility
export const API_ENDPOINTS = API_CONFIG.ENDPOINTS;

export default {
  API: API_CONFIG,
  APP: APP_CONFIG,
  FEATURES,
};
