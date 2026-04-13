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
  /** Regional KPI summaries */
  getOverview: () =>
    fetchJson<ApiResponse<RegionalOverviewRow>>(`${API_BASE_URL}/api/data?view=overview`),

  /** Trend analysis data */
  getTrends: () =>
    fetchJson<ApiResponse<TrendAnalysisRow>>(`${API_BASE_URL}/api/data?view=trends`),

  /** LGA profiles */
  getLgaProfiles: () =>
    fetchJson<ApiResponse<LgaProfileRow>>(`${API_BASE_URL}/api/data?view=lga-profiles`),

  /** Master data (optionally filtered by state) */
  getMaster: (state?: string) => {
    const params = state ? `?view=master&state=${state}` : '?view=master';
    return fetchJson<ApiResponse<MasterRow>>(`${API_BASE_URL}/api/data${params}`);
  },

  /** All indicators (optionally filtered) */
  getIndicators: (indicator?: string) => {
    const params = indicator
      ? `?view=indicators&indicator=${encodeURIComponent(indicator)}`
      : '?view=indicators';
    return fetchJson<ApiResponse<MasterRow>>(`${API_BASE_URL}/api/data${params}`);
  },

  /** Sync status */
  getStatus: () => fetchJson<SyncStatus>(`${API_BASE_URL}/api/data`),
};
