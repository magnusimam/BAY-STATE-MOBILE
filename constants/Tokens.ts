/**
 * HUMAID Design Tokens
 *
 * Single source of truth for spacing, typography, elevation, and radius.
 * Every screen should use these tokens instead of hardcoded values.
 */

// ── SPACING (4pt grid) ──────────────────────────────────────────────
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
} as const;

// ── TYPOGRAPHY ──────────────────────────────────────────────────────
export const typography = {
  // Display
  display: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -0.8 },
  h1: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.5 },
  h2: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3: { fontSize: 18, fontWeight: '700' as const },
  h4: { fontSize: 16, fontWeight: '700' as const },

  // Body
  bodyLg: { fontSize: 16, fontWeight: '400' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodySm: { fontSize: 13, fontWeight: '400' as const },

  // Labels & captions
  label: { fontSize: 13, fontWeight: '600' as const },
  labelSm: { fontSize: 12, fontWeight: '600' as const },
  caption: { fontSize: 11, fontWeight: '500' as const },
  overline: { fontSize: 10, fontWeight: '700' as const, letterSpacing: 0.8, textTransform: 'uppercase' as const },

  // Numeric (for KPIs, large data values)
  numLg: { fontSize: 26, fontWeight: '800' as const, letterSpacing: -0.5 },
  numMd: { fontSize: 20, fontWeight: '800' as const, letterSpacing: -0.3 },
  numSm: { fontSize: 16, fontWeight: '700' as const },
} as const;

// ── BORDER RADIUS ───────────────────────────────────────────────────
export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 18,
  xxl: 24,
  full: 999,
} as const;

// ── ELEVATION (card depth tiers) ────────────────────────────────────
export const elevation = {
  // Level 0: flat / base background
  L0: {
    backgroundColor: 'transparent',
  },
  // Level 1: subtle surface (list items, inline elements)
  L1: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
  },
  // Level 2: standard card (most common)
  L2: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
  },
  // Level 3: raised card (KPIs, featured content)
  L3: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  // Level 4: floating (modals, dropdowns, action sheets)
  L4: {
    backgroundColor: 'rgba(255,255,255,0.09)',
    borderColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ── TOUCH TARGETS ───────────────────────────────────────────────────
export const touch = {
  min: 44, // WCAG 2.5 minimum
  standard: 48,
  large: 56,
} as const;

// ── TEXT COLORS (dark theme — primary) ──────────────────────────────
export const textColor = {
  primary: '#f5f5f5',
  secondary: '#d1d5db',
  tertiary: '#9ca3af',   // 4.6:1 ratio on dark bg (WCAG AA pass)
  muted: '#6b7280',      // 3.7:1 — use only for non-essential text
  inverse: '#0a0a0f',
} as const;

// ── BORDER COLORS ───────────────────────────────────────────────────
export const borderColor = {
  subtle: 'rgba(255,255,255,0.06)',
  default: 'rgba(255,255,255,0.1)',
  strong: 'rgba(255,255,255,0.18)',
} as const;

// ── SEMANTIC COLORS ─────────────────────────────────────────────────
export const semantic = {
  success: '#22c55e',
  successBg: 'rgba(34,197,94,0.15)',
  warning: '#f59e0b',
  warningBg: 'rgba(245,158,11,0.15)',
  danger: '#ef4444',
  dangerBg: 'rgba(239,68,68,0.15)',
  info: '#6ec6e8',
  infoBg: 'rgba(110,198,232,0.15)',
} as const;

// ── BRAND ───────────────────────────────────────────────────────────
export const brand = {
  amber: '#f4b942',
  amberDark: '#d4952a',
  amberLight: '#f7c94d',
  amberBg: 'rgba(244,185,66,0.15)',
  amberBorder: 'rgba(244,185,66,0.3)',
} as const;

// ── STATE COLORS (BAY States) ───────────────────────────────────────
export const stateColor = {
  borno: '#f4b942',   // amber
  adamawa: '#6ec6e8', // cyan
  yobe: '#8b5cf6',    // violet
} as const;

// ── ANIMATION TIMINGS ───────────────────────────────────────────────
export const timing = {
  fast: 150,
  base: 250,
  slow: 400,
  slower: 600,
} as const;

// ── BACKGROUND COLORS ───────────────────────────────────────────────
export const background = {
  primary: '#0a0a0f',
  secondary: '#141419',
  tertiary: '#1e1e28',
} as const;
