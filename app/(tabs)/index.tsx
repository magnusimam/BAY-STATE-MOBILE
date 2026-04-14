import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api } from '@/lib/api';
import { RegionalOverviewRow } from '@/lib/api-types';
import { stateColors } from '@/constants/Colors';

const { width: SW } = Dimensions.get('window');
const CARD_W = (SW - 48) / 2;

interface KPI {
  label: string;
  value: string;
  trend?: string;
  color: string;
}

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [overview, setOverview] = useState<RegionalOverviewRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const res = await api.getOverview();
      setOverview(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Build KPIs
  const kpis: KPI[] = [];
  const find = (kw: string) =>
    overview.find((r) => r.metric?.toLowerCase().includes(kw.toLowerCase()));

  const displaced = find('displaced') || find('displacement');
  if (displaced) kpis.push({ label: 'Displaced Persons', value: fmt(displaced.bay_combined || displaced.bay_2025), trend: displaced.trend, color: stateColors.borno });

  const conflict = find('conflict');
  if (conflict) kpis.push({ label: 'Conflict Incidents', value: fmt(conflict.bay_combined || conflict.bay_2025), trend: conflict.trend, color: stateColors.adamawa });

  const need = find('need') || find('humanitarian');
  if (need) kpis.push({ label: 'People in Need', value: fmt(need.bay_combined || need.bay_2025), trend: need.trend, color: stateColors.yobe });

  for (const row of overview) {
    if (kpis.length >= 6) break;
    if (kpis.some((k) => k.label === row.metric)) continue;
    kpis.push({ label: row.metric || row.section || 'Metric', value: fmt(row.bay_combined || row.bay_2025), trend: row.trend, color: '#6ec6e8' });
  }

  if (kpis.length === 0) {
    kpis.push(
      { label: 'People in Need', value: '7.25M', color: stateColors.borno },
      { label: 'Displaced', value: '3.48M', color: stateColors.adamawa },
      { label: 'Active Programs', value: '1,167', color: stateColors.yobe },
      { label: 'LGAs Covered', value: '65', color: '#6ec6e8' },
    );
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <View style={styles.spinner}>
          <ActivityIndicator size="large" color="#f4b942" />
        </View>
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#f4b942" />}>

      {/* Banner */}
      <LinearGradient colors={['#f4b942', '#d4952a']} style={styles.banner}>
        <Text style={styles.bannerTitle}>BAY States Intelligence</Text>
        <Text style={styles.bannerSub}>Borno, Adamawa & Yobe humanitarian data</Text>
      </LinearGradient>

      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* KPI Grid */}
      <Text style={styles.sectionTitle}>Key Indicators</Text>
      <View style={styles.kpiGrid}>
        {kpis.map((kpi, i) => (
          <View key={i} style={styles.kpiCard}>
            <View style={[styles.kpiAccent, { backgroundColor: kpi.color }]} />
            <Text style={styles.kpiValue}>{kpi.value}</Text>
            <Text style={styles.kpiLabel}>{kpi.label}</Text>
            {kpi.trend && (
              <Text style={[styles.kpiTrend, {
                color: kpi.trend.includes('↑') || kpi.trend.toLowerCase().includes('improv') ? '#22c55e' :
                  kpi.trend.includes('↓') || kpi.trend.toLowerCase().includes('declin') ? '#ef4444' : '#94a3b8'
              }]}>{kpi.trend}</Text>
            )}
          </View>
        ))}
      </View>

      {/* State Overview */}
      <Text style={styles.sectionTitle}>BAY States Overview</Text>
      {([
        { name: 'Borno', code: 'borno', lgas: 27, color: stateColors.borno },
        { name: 'Adamawa', code: 'adamawa', lgas: 21, color: stateColors.adamawa },
        { name: 'Yobe', code: 'yobe', lgas: 17, color: stateColors.yobe },
      ]).map((state) => {
        const data = overview.filter((r) =>
          r.section?.toLowerCase().includes(state.code) || r.metric?.toLowerCase().includes(state.code)
        );
        return (
          <View key={state.code} style={[styles.stateCard, { borderLeftColor: state.color }]}>
            <View style={styles.stateHeader}>
              <Text style={styles.stateName}>{state.name}</Text>
              <View style={[styles.badge, { backgroundColor: state.color + '20' }]}>
                <Text style={[styles.badgeText, { color: state.color }]}>{state.lgas} LGAs</Text>
              </View>
            </View>
            {data.length > 0 ? (
              <View style={styles.stateMetrics}>
                {data.slice(0, 3).map((row, i) => (
                  <View key={i} style={styles.metric}>
                    <Text style={styles.metricVal}>
                      {fmt(state.code === 'borno' ? row.borno : state.code === 'adamawa' ? row.adamawa : row.yobe)}
                    </Text>
                    <Text style={styles.metricLabel}>{row.metric}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noData}>Pull to refresh for latest data</Text>
            )}
          </View>
        );
      })}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function fmt(val: number | string | null | undefined): string {
  if (val == null) return '--';
  const n = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(n)) return String(val);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  center: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' },
  spinner: { marginBottom: 12 },
  loadingText: { color: '#94a3b8', fontSize: 14 },

  banner: { padding: 24, paddingTop: 12, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  bannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 4 },

  errorBox: { margin: 16, backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.2)', borderWidth: 1, borderRadius: 14, padding: 14 },
  errorText: { color: '#f87171', fontSize: 13 },

  sectionTitle: { color: '#f5f5f5', fontSize: 18, fontWeight: '700', marginHorizontal: 16, marginTop: 24, marginBottom: 12 },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  kpiCard: {
    width: CARD_W, margin: 4, borderRadius: 12, padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
    overflow: 'hidden',
  },
  kpiAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3 },
  kpiValue: { color: '#f5f5f5', fontSize: 24, fontWeight: '800', marginTop: 4 },
  kpiLabel: { color: '#94a3b8', fontSize: 12, marginTop: 4 },
  kpiTrend: { fontSize: 11, marginTop: 4, fontWeight: '600' },

  stateCard: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
    borderLeftWidth: 4,
  },
  stateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  stateName: { color: '#f5f5f5', fontSize: 18, fontWeight: '700' },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  stateMetrics: { flexDirection: 'row', justifyContent: 'space-between' },
  metric: { flex: 1, alignItems: 'center' },
  metricVal: { color: '#f5f5f5', fontSize: 16, fontWeight: '700' },
  metricLabel: { color: '#94a3b8', fontSize: 11, marginTop: 2, textAlign: 'center' },
  noData: { color: '#64748b', fontSize: 13, fontStyle: 'italic' },
});
