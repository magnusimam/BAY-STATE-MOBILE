// HUMAID BAY States brand colors
const amber = '#f4b942';
const amberDark = '#d4a037';

export default {
  light: {
    text: '#1a1a2e',
    textSecondary: '#64748b',
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceVariant: '#f1f5f9',
    tint: amber,
    primary: amber,
    primaryDark: amberDark,
    accent: '#0ea5e9',
    border: '#e2e8f0',
    danger: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
    tabIconDefault: '#94a3b8',
    tabIconSelected: amber,
    card: '#ffffff',
    cardBorder: '#e2e8f0',
  },
  dark: {
    text: '#f1f5f9',
    textSecondary: '#94a3b8',
    background: '#0f172a',
    surface: '#1e293b',
    surfaceVariant: '#334155',
    tint: amber,
    primary: amber,
    primaryDark: amberDark,
    accent: '#38bdf8',
    border: '#334155',
    danger: '#f87171',
    success: '#4ade80',
    warning: '#fbbf24',
    tabIconDefault: '#64748b',
    tabIconSelected: amber,
    card: '#1e293b',
    cardBorder: '#334155',
  },
};

// State-specific colors for BAY states
export const stateColors = {
  borno: '#ef4444',
  adamawa: '#f59e0b',
  yobe: '#0ea5e9',
};

// Risk zone colors
export const zoneColors: Record<string, string> = {
  'High Risk': '#ef4444',
  'Medium Risk': '#f59e0b',
  'Low Risk': '#22c55e',
  'Transition': '#8b5cf6',
};
