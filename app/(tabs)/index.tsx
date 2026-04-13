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
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { stateColors } from '@/constants/Colors';
import { api } from '@/lib/api';
import { RegionalOverviewRow } from '@/lib/api-types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface KPI {
  label: string;
  value: string;
  trend?: string;
  color: string;
}

export default function DashboardScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  // Extract KPIs from overview data
  const kpis: KPI[] = [];
  const findMetric = (keyword: string) =>
    overview.find((r) => r.metric?.toLowerCase().includes(keyword.toLowerCase()));

  const displaced = findMetric('displaced') || findMetric('displacement');
  if (displaced) {
    kpis.push({
      label: 'Displaced Persons',
      value: formatNumber(displaced.bay_combined || displaced.bay_2025),
      trend: displaced.trend,
      color: stateColors.borno,
    });
  }

  const conflict = findMetric('conflict');
  if (conflict) {
    kpis.push({
      label: 'Conflict Incidents',
      value: formatNumber(conflict.bay_combined || conflict.bay_2025),
      trend: conflict.trend,
      color: stateColors.adamawa,
    });
  }

  const need = findMetric('need') || findMetric('humanitarian');
  if (need) {
    kpis.push({
      label: 'People in Need',
      value: formatNumber(need.bay_combined || need.bay_2025),
      trend: need.trend,
      color: stateColors.yobe,
    });
  }

  // Add more from overview if we have fewer than 4
  for (const row of overview) {
    if (kpis.length >= 6) break;
    if (kpis.some((k) => k.label === row.metric)) continue;
    kpis.push({
      label: row.metric || row.section || 'Metric',
      value: formatNumber(row.bay_combined || row.bay_2025),
      trend: row.trend,
      color: colors.accent,
    });
  }

  // Fallback KPIs if API returned empty
  if (kpis.length === 0) {
    kpis.push(
      { label: 'People in Need', value: '7.25M', color: stateColors.borno },
      { label: 'Displaced', value: '3.48M', color: stateColors.adamawa },
      { label: 'Active Programs', value: '1,167', color: stateColors.yobe },
      { label: 'LGAs Covered', value: '65', color: colors.accent },
    );
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}>

      {/* Welcome banner */}
      <View style={[styles.banner, { backgroundColor: colors.primary }]}>
        <Text style={styles.bannerTitle}>BAY States Intelligence</Text>
        <Text style={styles.bannerSub}>Borno, Adamawa & Yobe humanitarian data</Text>
      </View>

      {error && (
        <View style={[styles.errorBox, { backgroundColor: '#fef2f2' }]}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* KPI Grid */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Key Indicators</Text>
      <View style={styles.kpiGrid}>
        {kpis.map((kpi, i) => (
          <View key={i} style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={[styles.kpiAccent, { backgroundColor: kpi.color }]} />
            <Text style={[styles.kpiValue, { color: colors.text }]}>{kpi.value}</Text>
            <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>{kpi.label}</Text>
            {kpi.trend && (
              <Text style={[styles.kpiTrend, { color: kpi.trend.includes('↑') || kpi.trend.toLowerCase().includes('improv') ? colors.success : kpi.trend.includes('↓') || kpi.trend.toLowerCase().includes('declin') ? colors.danger : colors.textSecondary }]}>
                {kpi.trend}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* State Summary Cards */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>BAY States Overview</Text>
      {(['Borno', 'Adamawa', 'Yobe'] as const).map((state) => {
        const stateData = overview.filter((r) =>
          r.section?.toLowerCase().includes(state.toLowerCase()) ||
          r.metric?.toLowerCase().includes(state.toLowerCase())
        );
        const color = stateColors[state.toLowerCase() as keyof typeof stateColors];
        return (
          <View key={state} style={[styles.stateCard, { backgroundColor: colors.card, borderColor: colors.cardBorder, borderLeftColor: color }]}>
            <View style={styles.stateHeader}>
              <Text style={[styles.stateName, { color: colors.text }]}>{state}</Text>
              <View style={[styles.stateBadge, { backgroundColor: color + '20' }]}>
                <Text style={[styles.stateBadgeText, { color }]}>
                  {state === 'Borno' ? '27' : state === 'Adamawa' ? '21' : '17'} LGAs
                </Text>
              </View>
            </View>
            {stateData.length > 0 ? (
              <View style={styles.stateMetrics}>
                {stateData.slice(0, 3).map((row, i) => (
                  <View key={i} style={styles.stateMetric}>
                    <Text style={[styles.metricValue, { color: colors.text }]}>
                      {formatNumber(
                        state === 'Borno' ? row.borno :
                        state === 'Adamawa' ? row.adamawa : row.yobe
                      )}
                    </Text>
                    <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>
                      {row.metric}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={[styles.noData, { color: colors.textSecondary }]}>
                Pull to refresh for latest data
              </Text>
            )}
          </View>
        );
      })}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function formatNumber(val: number | string | null | undefined): string {
  if (val == null) return '--';
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return String(val);
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
  if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
  return num.toLocaleString();
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 14 },
  banner: {
    padding: 24,
    paddingTop: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  bannerTitle: { color: '#fff', fontSize: 22, fontWeight: '800' },
  bannerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 4 },
  errorBox: { margin: 16, borderRadius: 8, padding: 12 },
  errorText: { color: '#dc2626', fontSize: 14 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginHorizontal: 16, marginTop: 24, marginBottom: 12 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  kpiCard: {
    width: (SCREEN_WIDTH - 48) / 2,
    margin: 4,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  kpiAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  kpiValue: { fontSize: 24, fontWeight: '800', marginTop: 4 },
  kpiLabel: { fontSize: 12, marginTop: 4 },
  kpiTrend: { fontSize: 11, marginTop: 4, fontWeight: '600' },
  stateCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderLeftWidth: 4,
  },
  stateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  stateName: { fontSize: 18, fontWeight: '700' },
  stateBadge: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  stateBadgeText: { fontSize: 12, fontWeight: '600' },
  stateMetrics: { flexDirection: 'row', justifyContent: 'space-between' },
  stateMetric: { flex: 1, alignItems: 'center' },
  metricValue: { fontSize: 16, fontWeight: '700' },
  metricLabel: { fontSize: 11, marginTop: 2, textAlign: 'center' },
  noData: { fontSize: 13, fontStyle: 'italic' },
});
