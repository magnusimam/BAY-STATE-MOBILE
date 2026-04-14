import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { api, computeSummary, filterByState, avgIndicator } from '@/lib/api';
import { MasterRow } from '@/lib/api-types';
import { spacing, radius, background, elevation, stateColor, brand, textColor } from '@/constants/Tokens';
import { Card, Text, SkeletonRow } from '@/components/ui';

const baselineData: Record<string, Record<string, number>> = {
  Borno: { population: 4.25, need: 3.32, severity: 91, programs: 448, foodInsecurity: 76 },
  Adamawa: { population: 3.79, need: 2.15, severity: 76, programs: 390, foodInsecurity: 56 },
  Yobe: { population: 2.43, need: 1.78, severity: 86, programs: 329, foodInsecurity: 68 },
};

const METRICS = [
  { key: 'population', label: 'Population', suffix: 'M' },
  { key: 'displaced', label: 'Displaced', suffix: 'M' },
  { key: 'need', label: 'Humanitarian Need', suffix: 'M' },
  { key: 'severity', label: 'Severity Index', suffix: '' },
  { key: 'programs', label: 'Active Programs', suffix: '' },
  { key: 'unemployment', label: 'Youth Unemployment', suffix: '%' },
  { key: 'literacy', label: 'Literacy Rate', suffix: '%' },
  { key: 'foodInsecurity', label: 'Food Insecurity', suffix: '%' },
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
    Haptics.selectionAsync().catch(() => {});
    if (selected.includes(s)) {
      if (selected.length > 1) setSelected(selected.filter(x => x !== s));
    } else {
      setSelected([...selected, s]);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={brand.amber} />}>

      <View style={styles.header}>
        <Text variant="h1" color="primary">Compare States</Text>
        <Text variant="bodySm" color="tertiary" style={{ marginTop: spacing.xs }}>
          Side-by-side humanitarian and development data
        </Text>
      </View>

      {/* State toggle */}
      <View style={styles.selectorRow}>
        {STATES.map((s) => {
          const active = selected.includes(s);
          const color = stateColor[s.toLowerCase() as keyof typeof stateColor];
          return (
            <Pressable
              key={s}
              onPress={() => toggleState(s)}
              style={({ pressed }) => [
                styles.selectorBtn,
                active && { backgroundColor: color, borderColor: color },
                pressed && { opacity: 0.7 },
              ]}>
              <Text variant="label" color={active ? '#fff' : 'tertiary'}>{s}</Text>
            </Pressable>
          );
        })}
      </View>
      <Text variant="caption" color="muted" style={{ textAlign: 'center', marginTop: spacing.sm }}>
        Tap to toggle (minimum 1 state)
      </Text>

      {/* Visual bar comparison */}
      <Text variant="h3" color="primary" style={styles.sectionTitle}>Metric Comparison</Text>

      {loading ? (
        [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)
      ) : (
        METRICS.map((m) => {
          const values = selected.map(s => stateMetrics[s]?.[m.key] ?? 0);
          const maxVal = Math.max(...values, 0.01);
          return (
            <Card key={m.key} level={2} padding="md" style={styles.metricCard}>
              <Text variant="label" color="tertiary" style={{ marginBottom: spacing.md }}>
                {m.label}
              </Text>
              {selected.map((s) => {
                const val = stateMetrics[s]?.[m.key] ?? 0;
                const pct = (val / maxVal) * 100;
                const color = stateColor[s.toLowerCase() as keyof typeof stateColor];
                return (
                  <View key={s} style={styles.barRow}>
                    <Text variant="caption" color={color} weight="700" style={{ width: 72 }}>{s}</Text>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${Math.max(pct, 3)}%`, backgroundColor: color }]} />
                    </View>
                    <Text variant="label" color="primary" style={{ width: 56, textAlign: 'right' }}>
                      {val.toFixed(1)}{m.suffix}
                    </Text>
                  </View>
                );
              })}
            </Card>
          );
        })
      )}

      <View style={{ height: spacing.huge }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.primary },

  header: { padding: spacing.xxl, paddingBottom: spacing.md },

  selectorRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.md },
  selectorBtn: {
    flex: 1,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radius.lg,
    ...elevation.L2,
    borderWidth: 1.5,
  },

  sectionTitle: { marginHorizontal: spacing.lg, marginTop: spacing.xxl, marginBottom: spacing.md },

  metricCard: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  barRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  barTrack: { flex: 1, height: 12, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)' },
  barFill: { height: 12, borderRadius: 6 },
});
