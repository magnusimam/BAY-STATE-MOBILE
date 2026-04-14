import { API_BASE_URL } from '@/constants/Config';
import {
  ApiResponse,
  MasterRow,
  RegionalOverviewRow,
  LgaProfileRow,
  TrendAnalysisRow,
  SyncStatus,
} from './api-types';

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  /** Raw master data — the primary data source (650 rows) */
  getMaster: (state?: string) => {
    const params = state ? `?view=master&state=${state}` : '?view=master';
    return fetchJson<ApiResponse<MasterRow>>(`${API_BASE_URL}/api/data${params}`);
  },

  /** LGA profiles — pre-aggregated per-LGA metrics (65 rows) */
  getLgaProfiles: () =>
    fetchJson<ApiResponse<LgaProfileRow>>(`${API_BASE_URL}/api/data?view=lga-profiles`),

  /** Trend analysis text */
  getTrends: () =>
    fetchJson<ApiResponse<TrendAnalysisRow>>(`${API_BASE_URL}/api/data?view=trends`),

  /** Sync status */
  getStatus: () => fetchJson<SyncStatus>(`${API_BASE_URL}/api/data`),
};

// ── Compute helpers (same logic as web app) ─────────────────────────

/** Sum y2025 for rows matching an indicator */
export function sumIndicator(rows: MasterRow[], indicator: string): number {
  return rows
    .filter((r) => r.indicator === indicator)
    .reduce((sum, r) => sum + (r.y2025 || 0), 0);
}

/** Average y2025 for rows matching an indicator */
export function avgIndicator(rows: MasterRow[], indicator: string): number {
  const matched = rows.filter((r) => r.indicator === indicator);
  if (matched.length === 0) return 0;
  return matched.reduce((sum, r) => sum + (r.y2025 || 0), 0) / matched.length;
}

/** Compute summary stats from master rows (matches web's computeSummary) */
export function computeSummary(rows: MasterRow[]) {
  const lgas = new Set(rows.map((r) => r.lga));
  return {
    totalLGAs: lgas.size,
    totalDisplacement: sumIndicator(rows, 'Displacement'),
    totalConflict: sumIndicator(rows, 'Conflict Incidents'),
    totalSMEs: sumIndicator(rows, 'SMEs') + sumIndicator(rows, 'SMEs Registered'),
    avgLiteracy: avgIndicator(rows, 'Literacy Rate'),
    avgUnemployment: avgIndicator(rows, 'Unemployment Rate'),
  };
}

/** Filter rows by state name */
export function filterByState(rows: MasterRow[], state: string): MasterRow[] {
  return rows.filter((r) => r.state.toLowerCase() === state.toLowerCase());
}

/** Get unique indicators from rows */
export function getUniqueIndicators(rows: MasterRow[]): string[] {
  return [...new Set(rows.map((r) => r.indicator))].sort();
}

/** Get top movers (biggest change_pct) */
export function getTopMovers(rows: MasterRow[], direction: 'up' | 'down', limit = 5): MasterRow[] {
  const sorted = [...rows]
    .filter((r) => r.change_pct != null && r.indicator !== '')
    .sort((a, b) => direction === 'up' ? b.change_pct - a.change_pct : a.change_pct - b.change_pct);
  return sorted.slice(0, limit);
}

/** Format number for display */
export function fmt(val: number | string | null | undefined): string {
  if (val == null) return '--';
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n)) return String(val);
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

/** Format percentage */
export function fmtPct(val: number | null | undefined): string {
  if (val == null) return '--';
  return val.toFixed(1) + '%';
}
