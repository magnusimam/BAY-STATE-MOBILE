// HUMAID BAY States brand colors — matched to web app
const amber = '#f4b942';
const amberDark = '#d4952a';

export default {
  light: {
    text: '#1a1a2e',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
    background: '#f8fafc',
    surface: '#ffffff',
    surfaceVariant: '#f1f5f9',
    tint: amber,
    primary: amber,
    primaryDark: amberDark,
    accent: amber,
    cyan: '#6ec6e8',
    violet: '#8b5cf6',
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
    text: '#f5f5f5',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    background: '#0a0a0f',
    surface: '#141419',
    surfaceVariant: '#1e1e28',
    tint: amber,
    primary: amber,
    primaryDark: amberDark,
    accent: amber,
    cyan: '#6ec6e8',
    violet: '#8b5cf6',
    border: 'rgba(255,255,255,0.1)',
    danger: '#ef4444',
    success: '#22c55e',
    warning: '#f59e0b',
    tabIconDefault: '#64748b',
    tabIconSelected: amber,
    card: 'rgba(255,255,255,0.05)',
    cardBorder: 'rgba(255,255,255,0.1)',
  },
};

// State colors — matching web app exactly
export const stateColors = {
  borno: '#f4b942',   // amber
  adamawa: '#6ec6e8', // cyan
  yobe: '#8b5cf6',    // violet
};

// Risk zone colors
export const zoneColors: Record<string, string> = {
  'Conflict-Affected': '#ef4444',
  'High Risk': '#ef4444',
  'Moderate Risk': '#f59e0b',
  'Semi-Stable': '#f59e0b',
  'Medium Risk': '#f59e0b',
  'Low Risk': '#22c55e',
  'Stable/Urban': '#22c55e',
  'Transition': '#8b5cf6',
};
