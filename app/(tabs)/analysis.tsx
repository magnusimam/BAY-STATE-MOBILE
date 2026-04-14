import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { api, fmt, sumIndicator } from '@/lib/api';
import { MasterRow, TrendAnalysisRow, IndicatorAnalysisRow, ApiResponse } from '@/lib/api-types';
import { API_BASE_URL } from '@/constants/Config';
import { spacing, radius, background, elevation, semantic, brand, stateColor, textColor } from '@/constants/Tokens';
import { Card, Text, Badge, EmptyState, SkeletonRow, SkeletonKPI, AnimatedCounter } from '@/components/ui';

const { width: SW } = Dimensions.get('window');
const CARD_W = (SW - spacing.lg * 2 - spacing.sm) / 2;

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

  const anomalies = useMemo(() => {
    return [...masterRows]
      .filter(r => Math.abs(r.change_pct) > 30)
      .sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct))
      .slice(0, 8);
  }, [masterRows]);

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

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={brand.amber} />}>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Text variant="h4" color={brand.amber}>AI</Text>
        </View>
        <Text variant="h1" color="primary">Analysis Engine</Text>
        <Text variant="bodySm" color="tertiary" style={{ marginTop: spacing.sm, textAlign: 'center', paddingHorizontal: spacing.xxxl, lineHeight: 20 }}>
          Data-driven analysis across {kpis?.totalLGAs ?? 65} LGAs, 10 indicators, and 4 years of BAY States data.
        </Text>
      </View>

      {/* KPI Cards */}
      <View style={styles.kpiGrid}>
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <View key={i} style={{ width: CARD_W, margin: spacing.xs / 2 }}>
              <SkeletonKPI />
            </View>
          ))
        ) : kpis ? (
          <>
            <View style={{ width: CARD_W, margin: spacing.xs / 2 }}>
              <Card level={2} padding="md">
                <Text variant="caption" color="tertiary">Displacement (2025)</Text>
                <AnimatedCounter value={kpis.displacement2025} variant="numMd" color="primary" format={fmt} style={{ marginTop: spacing.xs }} />
                <Text variant="caption" color={Number(kpis.displacementChange) > 0 ? semantic.danger : semantic.success} style={{ marginTop: 2 }}>
                  {Number(kpis.displacementChange) > 0 ? '+' : ''}{kpis.displacementChange}% since 2022
                </Text>
              </Card>
            </View>
            <View style={{ width: CARD_W, margin: spacing.xs / 2 }}>
              <Card level={2} padding="md">
                <Text variant="caption" color="tertiary">Conflict Incidents</Text>
                <AnimatedCounter value={kpis.conflict2025} variant="numMd" color="primary" format={fmt} style={{ marginTop: spacing.xs }} />
              </Card>
            </View>
            <View style={{ width: CARD_W, margin: spacing.xs / 2 }}>
              <Card level={2} padding="md">
                <Text variant="caption" color="tertiary">Improving</Text>
                <AnimatedCounter value={kpis.improving} variant="numMd" color={semantic.success} style={{ marginTop: spacing.xs }} />
                <Text variant="caption" color="muted" style={{ marginTop: 2 }}>of {masterRows.length} tracked</Text>
              </Card>
            </View>
            <View style={{ width: CARD_W, margin: spacing.xs / 2 }}>
              <Card level={2} padding="md">
                <Text variant="caption" color="tertiary">Declining</Text>
                <AnimatedCounter value={kpis.declining} variant="numMd" color={semantic.danger} style={{ marginTop: spacing.xs }} />
                <Text variant="caption" color="muted" style={{ marginTop: 2 }}>{kpis.stable} stable</Text>
              </Card>
            </View>
          </>
        ) : null}
      </View>

      {/* Risk Zone Distribution */}
      <Text variant="h3" color="primary" style={styles.sectionTitle}>Risk Zone Distribution</Text>
      {loading ? (
        [1, 2, 3].map((i) => <SkeletonRow key={i} />)
      ) : (
        Object.entries(riskZones).map(([state, counts]) => {
          const sc = stateColor[state.toLowerCase() as keyof typeof stateColor] || semantic.info;
          return (
            <Card key={state} level={2} padding="md" style={styles.spaced}>
              <Text variant="h4" color={sc} style={{ marginBottom: spacing.sm }}>{state}</Text>
              <View style={styles.zoneBar}>
                {counts.high > 0 && <View style={{ flex: counts.high, height: 12, backgroundColor: semantic.danger }} />}
                {counts.medium > 0 && <View style={{ flex: counts.medium, height: 12, backgroundColor: semantic.warning }} />}
                {counts.low > 0 && <View style={{ flex: counts.low, height: 12, backgroundColor: semantic.success }} />}
              </View>
              <View style={styles.zoneLegend}>
                <Text variant="caption" color={semantic.danger}>High: {counts.high}</Text>
                <Text variant="caption" color={semantic.warning}>Med: {counts.medium}</Text>
                <Text variant="caption" color={semantic.success}>Low: {counts.low}</Text>
              </View>
            </Card>
          );
        })
      )}

      {/* Anomaly Detection */}
      <Text variant="h3" color="primary" style={styles.sectionTitle}>Anomaly Detection</Text>
      <Text variant="caption" color="tertiary" style={styles.sectionSub}>
        LGA-indicator pairs with &gt;30% change flagged
      </Text>
      {loading ? (
        [1, 2, 3].map((i) => <SkeletonRow key={i} />)
      ) : anomalies.length === 0 ? (
        <EmptyState icon="check-circle" title="No anomalies" description="All indicators are within normal variance." />
      ) : (
        anomalies.map((row, i) => (
          <Card key={i} level={2} padding="md" style={styles.rowCard}>
            <View style={{ flex: 1 }}>
              <Text variant="label" color="primary">{row.lga}</Text>
              <Text variant="caption" color="tertiary" style={{ marginTop: 2 }}>
                {row.state} · {row.indicator}
              </Text>
            </View>
            <Badge
              label={`${row.change_pct > 0 ? '+' : ''}${row.change_pct.toFixed(1)}%`}
              color={row.change_pct > 0 ? semantic.danger : semantic.success}
              size="sm"
            />
          </Card>
        ))
      )}

      {/* Pattern Detection */}
      <Text variant="h3" color="primary" style={styles.sectionTitle}>Pattern Detection</Text>
      <Text variant="caption" color="tertiary" style={styles.sectionSub}>
        Top and bottom performing LGAs per indicator
      </Text>
      {loading ? (
        [1, 2].map((i) => <SkeletonRow key={i} />)
      ) : patterns.length === 0 ? (
        <EmptyState icon="bar-chart" title="No pattern data" description="Indicator analysis data is not yet available." />
      ) : (
        patterns.map(({ indicator, top3, bottom3, avgChange }) => (
          <Card key={indicator} level={2} padding="md" style={styles.spaced}>
            <View style={styles.patternHeader}>
              <Text variant="h4" color="primary" style={{ flex: 1 }}>{indicator}</Text>
              <Badge
                label={`Avg ${avgChange > 0 ? '+' : ''}${avgChange}%`}
                color={avgChange >= 0 ? semantic.success : semantic.danger}
                size="sm"
              />
            </View>
            <View style={styles.patternColumns}>
              <View style={{ flex: 1 }}>
                <Text variant="caption" color={semantic.success} weight="700" style={{ marginBottom: spacing.sm }}>
                  Top Performing
                </Text>
                {top3.map((r, i) => (
                  <Text key={i} variant="caption" color="tertiary" style={{ marginBottom: 3 }}>
                    #{r.rank} {r.lga} · {fmt(r.y2025)}
                  </Text>
                ))}
              </View>
              <View style={{ flex: 1 }}>
                <Text variant="caption" color={semantic.danger} weight="700" style={{ marginBottom: spacing.sm }}>
                  Lowest Performing
                </Text>
                {bottom3.map((r, i) => (
                  <Text key={i} variant="caption" color="tertiary" style={{ marginBottom: 3 }}>
                    #{r.rank} {r.lga} · {fmt(r.y2025)}
                  </Text>
                ))}
              </View>
            </View>
          </Card>
        ))
      )}

      {/* Key Insights */}
      {trendRows.length > 0 && (
        <>
          <Text variant="h3" color="primary" style={styles.sectionTitle}>Key Insights</Text>
          {trendRows.slice(0, 8).map((row, i) => (
            <Card key={i} level={1} padding="md" style={[styles.spaced, { flexDirection: 'row', gap: spacing.md }]}>
              <View style={styles.insightDot} />
              <View style={{ flex: 1 }}>
                {row.metric && (
                  <Text variant="caption" color={brand.amber} weight="700" style={{ marginBottom: 3 }}>
                    {row.metric} {row.state ? `— ${row.state}` : ''}
                  </Text>
                )}
                <Text variant="bodySm" color="secondary" style={{ lineHeight: 19 }}>{row.content}</Text>
              </View>
            </Card>
          ))}
        </>
      )}

      <View style={{ height: spacing.huge }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.primary },

  header: { alignItems: 'center', paddingVertical: spacing.xxl },
  headerIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: brand.amberBg,
    borderWidth: 1.5, borderColor: brand.amberBorder,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: spacing.md,
  },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg - spacing.xs / 2 },

  sectionTitle: { marginHorizontal: spacing.lg, marginTop: spacing.xxxl, marginBottom: spacing.xs },
  sectionSub: { marginHorizontal: spacing.lg, marginBottom: spacing.md },

  spaced: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },

  zoneBar: { flexDirection: 'row', height: 12, borderRadius: radius.sm, overflow: 'hidden', marginBottom: spacing.sm },
  zoneLegend: { flexDirection: 'row', gap: spacing.md },

  rowCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
  },

  patternHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md, gap: spacing.sm },
  patternColumns: { flexDirection: 'row', gap: spacing.md },

  insightDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: brand.amber, marginTop: 6 },
});
