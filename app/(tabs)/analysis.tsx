import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { api, fmt, sumIndicator, filterByState } from '@/lib/api';
import { MasterRow, TrendAnalysisRow, IndicatorAnalysisRow, ApiResponse } from '@/lib/api-types';
import { stateColors } from '@/constants/Colors';
import { API_BASE_URL } from '@/constants/Config';

const { width: SW } = Dimensions.get('window');
const CARD_W = (SW - 48) / 2;

export default function AnalysisScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [masterRows, setMasterRows] = useState<MasterRow[]>([]);
  const [indicatorRows, setIndicatorRows] = useState<IndicatorAnalysisRow[]>([]);
  const [trendRows, setTrendRows] = useState<TrendAnalysisRow[]>([]);

  const fetchData = async () => {
    try {
      const [master, indicators, trends] = await Promise.all([
        api.getMaster(),
        fetch(`${API_BASE_URL}/api/data?view=indicators`).then(r => r.json()) as Promise<ApiResponse<IndicatorAnalysisRow>>,
        api.getTrends(),
      ]);
      setMasterRows(master.data ?? []);
      setIndicatorRows(indicators.data ?? []);
      setTrendRows(trends.data ?? []);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // KPI summaries — same as web app
  const kpis = useMemo(() => {
    if (!masterRows.length) return null;
    const totalLGAs = new Set(masterRows.map(r => r.lga)).size;
    const displacement2025 = sumIndicator(masterRows, 'Displacement');
    const displacement2022 = masterRows.filter(r => r.indicator === 'Displacement').reduce((s, r) => s + r.y2022, 0);
    const displacementChange = displacement2022 > 0
      ? ((displacement2025 - displacement2022) / displacement2022 * 100).toFixed(1) : '0';
    const conflict2025 = sumIndicator(masterRows, 'Conflict Incidents');
    const improving = masterRows.filter(r => r.trend?.toLowerCase().includes('improv')).length;
    const declining = masterRows.filter(r => r.trend?.toLowerCase().includes('declin')).length;
    const stable = masterRows.length - improving - declining;
    return { totalLGAs, displacement2025, displacementChange, conflict2025, improving, declining, stable };
  }, [masterRows]);

  // Risk zone distribution
  const riskZones = useMemo(() => {
    const lgas = new Map<string, MasterRow>();
    for (const r of masterRows) { if (!lgas.has(r.lga)) lgas.set(r.lga, r); }
    const zones: Record<string, { high: number; medium: number; low: number }> = {};
    for (const [, r] of lgas) {
      if (!zones[r.state]) zones[r.state] = { high: 0, medium: 0, low: 0 };
      const z = r.risk_zone?.toLowerCase() || '';
      if (z.includes('high') || z.includes('conflict')) zones[r.state].high++;
      else if (z.includes('medium') || z.includes('semi')) zones[r.state].medium++;
      else zones[r.state].low++;
    }
    return zones;
  }, [masterRows]);

  // Anomalies: >30% change
  const anomalies = useMemo(() => {
    return [...masterRows]
      .filter(r => Math.abs(r.change_pct) > 30)
      .sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct))
      .slice(0, 8);
  }, [masterRows]);

  // Pattern detection: top/bottom by indicator
  const patterns = useMemo(() => {
    const byInd = new Map<string, IndicatorAnalysisRow[]>();
    for (const row of indicatorRows) {
      const arr = byInd.get(row.indicator) ?? [];
      arr.push(row);
      byInd.set(row.indicator, arr);
    }
    return [...byInd.entries()].slice(0, 5).map(([indicator, rows]) => {
      const sorted = [...rows].sort((a, b) => a.rank - b.rank);
      const avgChange = rows.length ? +(rows.reduce((s, r) => s + r.change_pct, 0) / rows.length).toFixed(1) : 0;
      return { indicator, top3: sorted.slice(0, 3), bottom3: sorted.slice(-3).reverse(), avgChange };
    });
  }, [indicatorRows]);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#f4b942" /></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#f4b942" />}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}><Text style={styles.headerIconText}>AI</Text></View>
        <Text style={styles.headerTitle}>AI Analysis Engine</Text>
        <Text style={styles.headerSub}>
          Data-driven analysis across {kpis?.totalLGAs ?? 65} LGAs, 10 indicators, and 4 years of BAY States data.
        </Text>
      </View>

      {/* KPI Cards */}
      {kpis && (
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Displacement (2025)</Text>
            <Text style={styles.kpiValue}>{fmt(kpis.displacement2025)}</Text>
            <Text style={[styles.kpiChange, { color: Number(kpis.displacementChange) > 0 ? '#ef4444' : '#22c55e' }]}>
              {Number(kpis.displacementChange) > 0 ? '+' : ''}{kpis.displacementChange}% since 2022
            </Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Conflict Incidents</Text>
            <Text style={styles.kpiValue}>{fmt(kpis.conflict2025)}</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Improving Indicators</Text>
            <Text style={[styles.kpiValue, { color: '#22c55e' }]}>{kpis.improving}</Text>
            <Text style={styles.kpiSub}>of {masterRows.length} tracked</Text>
          </View>
          <View style={styles.kpiCard}>
            <Text style={styles.kpiLabel}>Declining Indicators</Text>
            <Text style={[styles.kpiValue, { color: '#ef4444' }]}>{kpis.declining}</Text>
            <Text style={styles.kpiSub}>{kpis.stable} stable</Text>
          </View>
        </View>
      )}

      {/* Risk Zone Distribution */}
      <Text style={styles.sectionTitle}>Risk Zone Distribution</Text>
      {Object.entries(riskZones).map(([state, counts]) => {
        const total = counts.high + counts.medium + counts.low;
        const sc = stateColors[state.toLowerCase() as keyof typeof stateColors] || '#6ec6e8';
        return (
          <View key={state} style={styles.zoneCard}>
            <Text style={[styles.zoneName, { color: sc }]}>{state}</Text>
            <View style={styles.zoneBar}>
              {counts.high > 0 && <View style={[styles.zoneSegment, { flex: counts.high, backgroundColor: '#ef4444' }]} />}
              {counts.medium > 0 && <View style={[styles.zoneSegment, { flex: counts.medium, backgroundColor: '#f4b942' }]} />}
              {counts.low > 0 && <View style={[styles.zoneSegment, { flex: counts.low, backgroundColor: '#22c55e' }]} />}
            </View>
            <View style={styles.zoneLegend}>
              <Text style={[styles.zoneLabel, { color: '#ef4444' }]}>High: {counts.high}</Text>
              <Text style={[styles.zoneLabel, { color: '#f4b942' }]}>Med: {counts.medium}</Text>
              <Text style={[styles.zoneLabel, { color: '#22c55e' }]}>Low: {counts.low}</Text>
            </View>
          </View>
        );
      })}

      {/* State Indicator Comparison */}
      <Text style={styles.sectionTitle}>State Indicator Profile (2025)</Text>
      {(() => {
        const indicators = [...new Set(masterRows.map(r => r.indicator))].slice(0, 6);
        return indicators.map((ind) => {
          const vals = (['Borno', 'Adamawa', 'Yobe'] as const).map(state => {
            const rows = masterRows.filter(r => r.indicator === ind && r.state === state);
            return rows.length ? +(rows.reduce((s, r) => s + r.y2025, 0) / rows.length).toFixed(1) : 0;
          });
          return (
            <View key={ind} style={styles.profileCard}>
              <Text style={styles.profileIndicator}>{ind}</Text>
              <View style={styles.profileVals}>
                {(['Borno', 'Adamawa', 'Yobe'] as const).map((state, i) => (
                  <View key={state} style={styles.profileVal}>
                    <Text style={[styles.profileNum, { color: stateColors[state.toLowerCase() as keyof typeof stateColors] }]}>
                      {fmt(vals[i])}
                    </Text>
                    <Text style={styles.profileState}>{state}</Text>
                  </View>
                ))}
              </View>
            </View>
          );
        });
      })()}

      {/* Anomaly Detection */}
      <Text style={styles.sectionTitle}>Anomaly Detection</Text>
      <Text style={styles.sectionSub}>LGA-indicator pairs with &gt;30% change flagged for review</Text>
      {anomalies.length === 0 && <Text style={styles.emptyText}>No significant anomalies detected</Text>}
      {anomalies.map((row, i) => (
        <View key={i} style={styles.anomalyCard}>
          <View style={{ flex: 1 }}>
            <Text style={styles.anomalyLga}>{row.lga}</Text>
            <Text style={styles.anomalyMeta}>{row.state} — {row.indicator}</Text>
          </View>
          <View style={[styles.anomalyBadge, { backgroundColor: row.change_pct > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(34,197,94,0.15)' }]}>
            <Text style={{ color: row.change_pct > 0 ? '#ef4444' : '#22c55e', fontSize: 13, fontWeight: '700' }}>
              {row.change_pct > 0 ? '+' : ''}{row.change_pct.toFixed(1)}%
            </Text>
          </View>
        </View>
      ))}

      {/* Pattern Detection */}
      <Text style={styles.sectionTitle}>Pattern Detection — Indicator Rankings</Text>
      <Text style={styles.sectionSub}>Top and bottom performing LGAs per indicator</Text>
      {patterns.length === 0 && <Text style={styles.emptyText}>No indicator analysis data available</Text>}
      {patterns.map(({ indicator, top3, bottom3, avgChange }) => (
        <View key={indicator} style={styles.patternCard}>
          <View style={styles.patternHeader}>
            <Text style={styles.patternIndicator}>{indicator}</Text>
            <View style={[styles.patternBadge, { borderColor: avgChange >= 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)' }]}>
              <Text style={{ color: avgChange >= 0 ? '#22c55e' : '#ef4444', fontSize: 11, fontWeight: '600' }}>
                Avg: {avgChange > 0 ? '+' : ''}{avgChange}%
              </Text>
            </View>
          </View>
          <View style={styles.patternColumns}>
            <View style={styles.patternCol}>
              <Text style={[styles.patternColTitle, { color: '#22c55e' }]}>Top Performing</Text>
              {top3.map((r, i) => (
                <Text key={i} style={styles.patternRow}>
                  #{r.rank} {r.lga} ({r.state}) — {fmt(r.y2025)}
                </Text>
              ))}
            </View>
            <View style={styles.patternCol}>
              <Text style={[styles.patternColTitle, { color: '#ef4444' }]}>Lowest Performing</Text>
              {bottom3.map((r, i) => (
                <Text key={i} style={styles.patternRow}>
                  #{r.rank} {r.lga} ({r.state}) — {fmt(r.y2025)}
                </Text>
              ))}
            </View>
          </View>
        </View>
      ))}

      {/* Key Insights */}
      {trendRows.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Key Insights</Text>
          {trendRows.slice(0, 8).map((row, i) => (
            <View key={i} style={styles.insightCard}>
              <View style={styles.insightDot} />
              <View style={{ flex: 1 }}>
                {row.metric && (
                  <Text style={styles.insightMeta}>
                    {row.metric} {row.state ? `— ${row.state}` : ''}
                  </Text>
                )}
                <Text style={styles.insightContent}>{row.content}</Text>
              </View>
            </View>
          ))}
        </>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  center: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' },

  header: { alignItems: 'center', paddingVertical: 24 },
  headerIcon: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(244,185,66,0.1)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  headerIconText: { color: '#f4b942', fontSize: 18, fontWeight: '800' },
  headerTitle: { color: '#f5f5f5', fontSize: 24, fontWeight: '800' },
  headerSub: { color: '#94a3b8', fontSize: 13, marginTop: 6, textAlign: 'center', paddingHorizontal: 32 },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  kpiCard: {
    width: CARD_W, margin: 4, borderRadius: 12, padding: 14,
    backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
  },
  kpiLabel: { color: '#94a3b8', fontSize: 11 },
  kpiValue: { color: '#f5f5f5', fontSize: 22, fontWeight: '800', marginTop: 2 },
  kpiChange: { fontSize: 11, marginTop: 2, fontWeight: '500' },
  kpiSub: { color: '#64748b', fontSize: 11, marginTop: 2 },

  sectionTitle: { color: '#f5f5f5', fontSize: 17, fontWeight: '700', marginHorizontal: 16, marginTop: 28, marginBottom: 4 },
  sectionSub: { color: '#64748b', fontSize: 13, marginHorizontal: 16, marginBottom: 12 },
  emptyText: { color: '#64748b', fontSize: 13, marginHorizontal: 16, fontStyle: 'italic', marginBottom: 8 },

  // Risk zones
  zoneCard: {
    marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 14,
    backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
  },
  zoneName: { fontSize: 15, fontWeight: '700', marginBottom: 8 },
  zoneBar: { flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', marginBottom: 6 },
  zoneSegment: { height: 12 },
  zoneLegend: { flexDirection: 'row', gap: 12 },
  zoneLabel: { fontSize: 11, fontWeight: '600' },

  // Profile
  profileCard: {
    marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 14,
    backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
  },
  profileIndicator: { color: '#f5f5f5', fontSize: 14, fontWeight: '600', marginBottom: 8 },
  profileVals: { flexDirection: 'row', justifyContent: 'space-around' },
  profileVal: { alignItems: 'center' },
  profileNum: { fontSize: 16, fontWeight: '700' },
  profileState: { color: '#64748b', fontSize: 10, marginTop: 2 },

  // Anomaly
  anomalyCard: {
    marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 12,
    backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
    flexDirection: 'row', alignItems: 'center',
  },
  anomalyLga: { color: '#f5f5f5', fontSize: 14, fontWeight: '600' },
  anomalyMeta: { color: '#94a3b8', fontSize: 11, marginTop: 1 },
  anomalyBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },

  // Pattern
  patternCard: {
    marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 14,
    backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
  },
  patternHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  patternIndicator: { color: '#f5f5f5', fontSize: 14, fontWeight: '700' },
  patternBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1 },
  patternColumns: { flexDirection: 'row', gap: 12 },
  patternCol: { flex: 1 },
  patternColTitle: { fontSize: 11, fontWeight: '700', marginBottom: 6 },
  patternRow: { color: '#94a3b8', fontSize: 11, marginBottom: 3 },

  // Insights
  insightCard: {
    marginHorizontal: 16, marginBottom: 8, borderRadius: 12, padding: 14,
    backgroundColor: 'rgba(255,255,255,0.04)',
    flexDirection: 'row', gap: 10,
  },
  insightDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#f4b942', marginTop: 4 },
  insightMeta: { color: '#f4b942', fontSize: 11, fontWeight: '600', marginBottom: 3 },
  insightContent: { color: '#e2e8f0', fontSize: 13, lineHeight: 19 },
});
