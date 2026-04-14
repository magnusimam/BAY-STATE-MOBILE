import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { api, computeSummary, filterByState, avgIndicator, fmt, fmtPct } from '@/lib/api';
import { MasterRow } from '@/lib/api-types';
import { stateColors } from '@/constants/Colors';

// Hardcoded baseline data (web app uses this as fallback)
const baselineData: Record<string, Record<string, number>> = {
  Borno: { population: 4.25, need: 3.32, severity: 91, programs: 448, foodInsecurity: 76 },
  Adamawa: { population: 3.79, need: 2.15, severity: 76, programs: 390, foodInsecurity: 56 },
  Yobe: { population: 2.43, need: 1.78, severity: 86, programs: 329, foodInsecurity: 68 },
};

const METRICS = [
  { key: 'population', label: 'Population (M)' },
  { key: 'displaced', label: 'Displaced Persons (M)' },
  { key: 'need', label: 'Humanitarian Need (M)' },
  { key: 'severity', label: 'Severity Index' },
  { key: 'programs', label: 'Active Programs' },
  { key: 'unemployment', label: 'Youth Unemployment (%)' },
  { key: 'literacy', label: 'Literacy Rate (%)' },
  { key: 'foodInsecurity', label: 'Food Insecurity (%)' },
];

const STATES = ['Borno', 'Adamawa', 'Yobe'] as const;

export default function CompareScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allRows, setAllRows] = useState<MasterRow[]>([]);
  const [selected, setSelected] = useState<string[]>(['Borno', 'Adamawa', 'Yobe']);

  const fetchData = async () => {
    try {
      const res = await api.getMaster();
      setAllRows(res.data ?? []);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Compute metrics per state (same as web app)
  const stateMetrics = useMemo(() => {
    const result: Record<string, Record<string, number>> = {};
    for (const state of STATES) {
      const rows = filterByState(allRows, state);
      const summary = computeSummary(rows);
      const base = baselineData[state];
      result[state] = {
        population: base.population,
        displaced: rows.length ? +(summary.totalDisplacement / 1_000_000).toFixed(3) : 0,
        need: base.need,
        severity: base.severity,
        programs: base.programs,
        unemployment: rows.length ? avgIndicator(rows, 'Unemployment Rate') : 0,
        literacy: rows.length ? avgIndicator(rows, 'Literacy Rate') : 0,
        foodInsecurity: base.foodInsecurity,
      };
    }
    return result;
  }, [allRows]);

  const toggleState = (s: string) => {
    if (selected.includes(s)) {
      if (selected.length > 1) setSelected(selected.filter(x => x !== s));
    } else {
      setSelected([...selected, s]);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#f4b942" /></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#f4b942" />}>

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Compare BAY States</Text>
        <Text style={styles.headerSub}>Side-by-side humanitarian and development data</Text>
      </View>

      {/* State selector */}
      <View style={styles.selectorRow}>
        {STATES.map((s) => {
          const active = selected.includes(s);
          const color = stateColors[s.toLowerCase() as keyof typeof stateColors];
          return (
            <TouchableOpacity
              key={s}
              style={[styles.selectorBtn, active && { backgroundColor: color, borderColor: color }]}
              onPress={() => toggleState(s)}>
              <Text style={[styles.selectorText, active && { color: '#fff' }]}>{s}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <Text style={styles.selectorHint}>Tap to toggle (minimum 1 state)</Text>

      {/* Metrics table */}
      <View style={styles.tableCard}>
        {/* Header row */}
        <View style={styles.tableRow}>
          <View style={styles.tableLabel}><Text style={styles.tableLabelText}>Metric</Text></View>
          {selected.map((s) => (
            <View key={s} style={styles.tableCell}>
              <Text style={[styles.tableCellHeader, { color: stateColors[s.toLowerCase() as keyof typeof stateColors] }]}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Data rows */}
        {METRICS.map((m, i) => (
          <View key={m.key} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
            <View style={styles.tableLabel}>
              <Text style={styles.tableMetricText}>{m.label}</Text>
            </View>
            {selected.map((s) => {
              const val = stateMetrics[s]?.[m.key] ?? 0;
              return (
                <View key={s} style={styles.tableCell}>
                  <Text style={styles.tableCellValue}>{val.toFixed(2)}</Text>
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* Visual bar comparison for each metric */}
      <Text style={styles.sectionTitle}>Visual Comparison</Text>
      {METRICS.map((m) => {
        const values = selected.map(s => stateMetrics[s]?.[m.key] ?? 0);
        const maxVal = Math.max(...values, 1);
        return (
          <View key={m.key} style={styles.barSection}>
            <Text style={styles.barLabel}>{m.label}</Text>
            {selected.map((s) => {
              const val = stateMetrics[s]?.[m.key] ?? 0;
              const pct = (val / maxVal) * 100;
              const color = stateColors[s.toLowerCase() as keyof typeof stateColors];
              return (
                <View key={s} style={styles.barRow}>
                  <Text style={[styles.barStateName, { color }]}>{s}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${Math.max(pct, 2)}%`, backgroundColor: color }]} />
                  </View>
                  <Text style={styles.barValue}>{val.toFixed(1)}</Text>
                </View>
              );
            })}
          </View>
        );
      })}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  center: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' },

  header: { padding: 20, paddingBottom: 8 },
  headerTitle: { color: '#f5f5f5', fontSize: 24, fontWeight: '800' },
  headerSub: { color: '#94a3b8', fontSize: 14, marginTop: 4 },

  selectorRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginTop: 12 },
  selectorBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.1)',
  },
  selectorText: { color: '#94a3b8', fontSize: 15, fontWeight: '700' },
  selectorHint: { color: '#64748b', fontSize: 11, textAlign: 'center', marginTop: 6 },

  tableCard: {
    margin: 16, borderRadius: 12, overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
  },
  tableRow: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  tableRowAlt: { backgroundColor: 'rgba(255,255,255,0.02)' },
  tableLabel: { flex: 1.3, paddingVertical: 12, paddingHorizontal: 14 },
  tableLabelText: { color: '#f5f5f5', fontSize: 13, fontWeight: '700' },
  tableMetricText: { color: '#94a3b8', fontSize: 12, fontWeight: '500' },
  tableCell: { flex: 1, paddingVertical: 12, paddingHorizontal: 8, alignItems: 'flex-end' },
  tableCellHeader: { fontSize: 13, fontWeight: '700' },
  tableCellValue: { color: '#f5f5f5', fontSize: 13, fontWeight: '600' },

  sectionTitle: { color: '#f5f5f5', fontSize: 17, fontWeight: '700', marginHorizontal: 16, marginTop: 28, marginBottom: 12 },

  barSection: {
    marginHorizontal: 16, marginBottom: 14, borderRadius: 12, padding: 14,
    backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.06)', borderWidth: 1,
  },
  barLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '600', marginBottom: 8 },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  barStateName: { width: 70, fontSize: 12, fontWeight: '600' },
  barTrack: { flex: 1, height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.06)', marginHorizontal: 8 },
  barFill: { height: 10, borderRadius: 5 },
  barValue: { color: '#f5f5f5', fontSize: 12, fontWeight: '600', width: 45, textAlign: 'right' },
});
