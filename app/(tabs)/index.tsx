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
import { api, computeSummary, filterByState, sumIndicator, fmt } from '@/lib/api';
import { MasterRow } from '@/lib/api-types';
import { stateColors } from '@/constants/Colors';

const { width: SW } = Dimensions.get('window');
const CARD_W = (SW - 48) / 2;

export default function DashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allRows, setAllRows] = useState<MasterRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setError(null);
      const res = await api.getMaster();
      setAllRows(res.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Compute KPIs from master data (same as web app)
  const bornoRows = filterByState(allRows, 'Borno');
  const adamawaRows = filterByState(allRows, 'Adamawa');
  const yobeRows = filterByState(allRows, 'Yobe');

  const allSummary = computeSummary(allRows);
  const bornoSummary = computeSummary(bornoRows);
  const adamawaSummary = computeSummary(adamawaRows);
  const yobeSummary = computeSummary(yobeRows);

  // KPI cards — matching web dashboard exactly
  const kpis = [
    {
      label: 'Total Displaced (2025)',
      value: fmt(allSummary.totalDisplacement),
      color: stateColors.borno,
    },
    {
      label: 'Conflict Incidents',
      value: fmt(allSummary.totalConflict),
      color: '#ef4444',
    },
    {
      label: 'Borno LGAs',
      value: String(bornoSummary.totalLGAs),
      color: stateColors.borno,
    },
    {
      label: 'Adamawa LGAs',
      value: String(adamawaSummary.totalLGAs),
      color: stateColors.adamawa,
    },
    {
      label: 'Yobe LGAs',
      value: String(yobeSummary.totalLGAs),
      color: stateColors.yobe,
    },
    {
      label: 'Total SMEs (2025)',
      value: fmt(allSummary.totalSMEs),
      color: '#22c55e',
    },
  ];

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f4b942" />
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
        <Text style={styles.bannerSub}>Borno, Adamawa & Yobe — {allRows.length} data points</Text>
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
          </View>
        ))}
      </View>

      {/* State Overview — computed from master_data like web app */}
      <Text style={styles.sectionTitle}>BAY States Overview</Text>
      {([
        { name: 'Borno', summary: bornoSummary, color: stateColors.borno },
        { name: 'Adamawa', summary: adamawaSummary, color: stateColors.adamawa },
        { name: 'Yobe', summary: yobeSummary, color: stateColors.yobe },
      ]).map(({ name, summary, color }) => (
        <View key={name} style={[styles.stateCard, { borderLeftColor: color }]}>
          <View style={styles.stateHeader}>
            <Text style={styles.stateName}>{name}</Text>
            <View style={[styles.badge, { backgroundColor: color + '20' }]}>
              <Text style={[styles.badgeText, { color }]}>{summary.totalLGAs} LGAs</Text>
            </View>
          </View>
          <View style={styles.stateMetrics}>
            <View style={styles.metric}>
              <Text style={styles.metricVal}>{fmt(summary.totalDisplacement)}</Text>
              <Text style={styles.metricLabel}>Displaced</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricVal}>{fmt(summary.totalConflict)}</Text>
              <Text style={styles.metricLabel}>Conflict</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricVal}>{fmt(summary.totalSMEs)}</Text>
              <Text style={styles.metricLabel}>SMEs</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricVal}>{summary.avgLiteracy.toFixed(0)}%</Text>
              <Text style={styles.metricLabel}>Literacy</Text>
            </View>
          </View>
        </View>
      ))}

      {/* Top Movers */}
      <Text style={styles.sectionTitle}>Top Improvers (4-Year Change)</Text>
      {allRows
        .filter((r) => r.change_pct > 0 && r.indicator !== '')
        .sort((a, b) => b.change_pct - a.change_pct)
        .slice(0, 5)
        .map((row) => (
          <View key={row.id} style={styles.moverCard}>
            <View style={styles.moverLeft}>
              <Text style={styles.moverLga}>{row.lga}</Text>
              <Text style={styles.moverIndicator}>{row.indicator} — {row.state}</Text>
            </View>
            <View style={styles.moverRight}>
              <Text style={styles.moverPct}>+{row.change_pct.toFixed(1)}%</Text>
              <Text style={styles.moverTrend}>{fmt(row.y2022)} → {fmt(row.y2025)}</Text>
            </View>
          </View>
        ))}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  center: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' },
  loadingText: { color: '#94a3b8', fontSize: 14, marginTop: 12 },

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

  stateCard: {
    marginHorizontal: 16, marginBottom: 12, borderRadius: 12, padding: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderLeftWidth: 4,
  },
  stateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  stateName: { color: '#f5f5f5', fontSize: 18, fontWeight: '700' },
  badge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  stateMetrics: { flexDirection: 'row', justifyContent: 'space-between' },
  metric: { flex: 1, alignItems: 'center' },
  metricVal: { color: '#f5f5f5', fontSize: 15, fontWeight: '700' },
  metricLabel: { color: '#94a3b8', fontSize: 11, marginTop: 2, textAlign: 'center' },

  moverCard: {
    marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 14,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  moverLeft: { flex: 1 },
  moverLga: { color: '#f5f5f5', fontSize: 15, fontWeight: '600' },
  moverIndicator: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  moverRight: { alignItems: 'flex-end', marginLeft: 12 },
  moverPct: { color: '#22c55e', fontSize: 16, fontWeight: '700' },
  moverTrend: { color: '#64748b', fontSize: 11, marginTop: 2 },
});
