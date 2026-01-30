/**
 * Resiido App Colors
 * Modern apartment management app color palette
 * Based on High Fidelity Prototype - Green/Blue theme
 */

export const Colors = {
  // Primary brand colors (Green from prototype)
  primary: '#2ECC71',      // Resiido Green
  primaryDark: '#27AE60',
  primaryLight: '#58D68D',
  
  // Secondary colors (Blue from prototype)
  secondary: '#3498DB',    // Resiido Blue
  secondaryDark: '#2980B9',
  secondaryLight: '#5DADE2',
  
  // Dashboard blue (Dark blue from prototype)
  dashboard: '#1A4B6E',    // Dark blue for dashboard
  dashboardLight: '#2C6E9E',
  dashboardCard: '#1E5F8A',
  
  // Accent colors
  accent: '#F39C12',       // Orange/Amber
  accentDark: '#D68910',
  accentLight: '#F5B041',
  
  // Status colors
  success: '#2ECC71',      // Green
  warning: '#F39C12',      // Orange
  error: '#E74C3C',        // Red
  info: '#3498DB',         // Blue
  
  // SOS Emergency
  sos: '#E74C3C',          // Red
  sosLight: '#FADBD8',     // Light Red
  sosDark: '#C0392B',
  
  // Neutrals
  white: '#FFFFFF',
  black: '#000000',
  gray: {
    50: '#F8F9FA',
    100: '#F1F3F5',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#ADB5BD',
    500: '#6C757D',
    600: '#495057',
    700: '#343A40',
    800: '#212529',
    900: '#121416',
  },
  
  // Background colors
  background: '#F5F7FA',
  backgroundDark: '#0D2137',
  card: '#FFFFFF',
  cardDark: '#1A4B6E',
  
  // Text colors
  text: {
    primary: '#212529',
    secondary: '#6C757D',
    tertiary: '#ADB5BD',
    light: '#FFFFFF',
    dark: '#121416',
  },
  
  // Gradient presets (for LinearGradient) - Matching prototype
  gradients: {
    primary: ['#2ECC71', '#27AE60'],        // Green gradient
    secondary: ['#3498DB', '#2980B9'],      // Blue gradient
    welcome: ['#2ECC71', '#3498DB'],        // Green to Blue (prototype splash)
    header: ['#2ECC71', '#3498DB'],         // Green to Blue header
    dashboard: ['#1A4B6E', '#0D2137'],      // Dark blue dashboard
    card: ['#1E5F8A', '#1A4B6E'],           // Dashboard card gradient
    sos: ['#E74C3C', '#C0392B'],            // Red SOS gradient
    success: ['#2ECC71', '#27AE60'],        // Green success
    dark: ['#212529', '#121416'],           // Dark gradient
  },
  
  // Shadow colors
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.25)',
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
