/**
 * Resiido App Colors
 * Modern apartment management app color palette
 * 2026 Light theme - premium minimal design
 */

export const Colors = {
  // Primary brand colors
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',

  // Secondary colors
  secondary: '#7C3AED',
  secondaryDark: '#6D28D9',
  secondaryLight: '#F5F3FF',

  // Dashboard (kept for backward compatibility with other screens)
  dashboard: '#1A4B6E',
  dashboardLight: '#2C6E9E',
  dashboardCard: '#1E5F8A',

  // Accent colors
  accent: '#F59E0B',
  accentDark: '#D97706',
  accentLight: '#FEF3C7',

  // Status colors
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#2563EB',

  // SOS Emergency
  sos: '#EF4444',
  sosLight: '#FEF2F2',
  sosDark: '#DC2626',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Background colors
  background: '#F4F7FB',
  backgroundDark: '#0F172A',
  card: '#FFFFFF',
  cardDark: '#1E293B',

  // Text colors
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    tertiary: '#94A3B8',
    light: '#FFFFFF',
    dark: '#0F172A',
  },

  // Gradient presets (for LinearGradient)
  gradients: {
    primary: ['#2563EB', '#1D4ED8'],
    secondary: ['#7C3AED', '#6D28D9'],
    welcome: ['#2563EB', '#7C3AED'],
    header: ['#2563EB', '#3B82F6'],
    dashboard: ['#1A4B6E', '#0D2137'],
    card: ['#1E5F8A', '#1A4B6E'],
    sos: ['#EF4444', '#DC2626'],
    success: ['#10B981', '#059669'],
    dark: ['#1E293B', '#0F172A'],
  },

  // Shadow colors
  shadow: 'rgba(148, 163, 184, 0.1)',
  shadowDark: 'rgba(15, 23, 42, 0.15)',
};

// Light theme
export const LightTheme = {
  background: Colors.background,
  card: Colors.card,
  text: Colors.text.primary,
  textSecondary: Colors.text.secondary,
  border: Colors.gray[200],
  primary: Colors.primary,
  tabBar: Colors.white,
  tabBarActive: Colors.primary,
  tabBarInactive: Colors.gray[400],
};

// Dark theme
export const DarkTheme = {
  background: Colors.backgroundDark,
  card: Colors.cardDark,
  text: Colors.text.light,
  textSecondary: Colors.gray[400],
  border: Colors.gray[700],
  primary: Colors.primaryLight,
  tabBar: Colors.gray[900],
  tabBarActive: Colors.primaryLight,
  tabBarInactive: Colors.gray[500],
};

export default Colors;
