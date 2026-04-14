import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { api, computeSummary, filterByState, fmt } from '@/lib/api';
import { MasterRow } from '@/lib/api-types';
import { spacing, radius, background, brand, elevation, semantic } from '@/constants/Tokens';
import { Card, Text, Badge, EmptyState, SkeletonKPI, SkeletonRow, AnimatedCounter } from '@/components/ui';
import { stateColor } from '@/constants/Tokens';

const { width: SW } = Dimensions.get('window');
const CARD_W = (SW - spacing.lg * 2 - spacing.sm) / 2;

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

  const bornoRows = filterByState(allRows, 'Borno');
  const adamawaRows = filterByState(allRows, 'Adamawa');
  const yobeRows = filterByState(allRows, 'Yobe');

  const allSummary = computeSummary(allRows);
  const bornoSummary = computeSummary(bornoRows);
  const adamawaSummary = computeSummary(adamawaRows);
  const yobeSummary = computeSummary(yobeRows);

  const kpis = [
    { label: 'Total Displaced', value: allSummary.totalDisplacement, color: stateColor.borno, format: fmt },
    { label: 'Conflict Incidents', value: allSummary.totalConflict, color: semantic.danger, format: fmt },
    { label: 'Borno LGAs', value: bornoSummary.totalLGAs, color: stateColor.borno, format: (n: number) => n.toString() },
    { label: 'Adamawa LGAs', value: adamawaSummary.totalLGAs, color: stateColor.adamawa, format: (n: number) => n.toString() },
    { label: 'Yobe LGAs', value: yobeSummary.totalLGAs, color: stateColor.yobe, format: (n: number) => n.toString() },
    { label: 'Total SMEs', value: allSummary.totalSMEs, color: semantic.success, format: fmt },
  ];

  const topImprovers = allRows
    .filter((r) => r.change_pct > 0 && r.indicator !== '')
    .sort((a, b) => b.change_pct - a.change_pct)
    .slice(0, 5);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={brand.amber} />}>

      {/* Hero banner */}
      <LinearGradient
        colors={[brand.amberLight, brand.amber, brand.amberDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}>
        <Text variant="h2" color="#fff" style={{ letterSpacing: -0.5 }}>
          BAY States Intelligence
        </Text>
        <Text variant="bodySm" color="rgba(255,255,255,0.9)" style={{ marginTop: spacing.xs }}>
          {loading ? 'Loading data...' : `${allRows.length} data points across ${new Set(allRows.map(r => r.lga)).size} LGAs`}
        </Text>
      </LinearGradient>

      {error && (
        <View style={styles.errorBox}>
          <Text variant="bodySm" color={semantic.danger}>{error}</Text>
        </View>
      )}

      {/* KPI Grid */}
      <Text variant="h3" color="primary" style={styles.sectionTitle}>Key Indicators</Text>
      <View style={styles.kpiGrid}>
        {loading ? (
          [1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={{ width: CARD_W, margin: spacing.xs / 2 }}>
              <SkeletonKPI />
            </View>
          ))
        ) : (
          kpis.map((kpi, i) => (
            <View key={i} style={{ width: CARD_W, margin: spacing.xs / 2 }}>
              <Card level={2} padding="lg" accentColor={kpi.color} accentPosition="top">
                <Text variant="caption" color="tertiary">{kpi.label}</Text>
                <AnimatedCounter
                  value={kpi.value}
                  format={kpi.format}
                  variant="numLg"
                  color="primary"
                  style={{ marginTop: spacing.xs }}
                />
              </Card>
            </View>
          ))
        )}
      </View>

      {/* State Overview */}
      <Text variant="h3" color="primary" style={styles.sectionTitle}>BAY States Overview</Text>
      {loading ? (
        [1, 2, 3].map((i) => <SkeletonRow key={i} />)
      ) : (
        ([
          { name: 'Borno', summary: bornoSummary, color: stateColor.borno },
          { name: 'Adamawa', summary: adamawaSummary, color: stateColor.adamawa },
          { name: 'Yobe', summary: yobeSummary, color: stateColor.yobe },
        ]).map(({ name, summary, color }) => (
          <Card
            key={name}
            level={2}
            padding="lg"
            accentColor={color}
            accentPosition="left"
            style={styles.stateCard}>
            <View style={styles.stateHeader}>
              <Text variant="h4" color="primary">{name}</Text>
              <Badge label={`${summary.totalLGAs} LGAs`} color={color} size="sm" />
            </View>
            <View style={styles.stateMetrics}>
              <MetricCell label="Displaced" value={fmt(summary.totalDisplacement)} />
              <MetricCell label="Conflict" value={fmt(summary.totalConflict)} />
              <MetricCell label="SMEs" value={fmt(summary.totalSMEs)} />
              <MetricCell label="Literacy" value={`${summary.avgLiteracy.toFixed(0)}%`} />
            </View>
          </Card>
        ))
      )}

      {/* Top Improvers */}
      <Text variant="h3" color="primary" style={styles.sectionTitle}>Top Improvers</Text>
      <Text variant="caption" color="tertiary" style={styles.sectionSub}>
        Biggest 4-year positive change
      </Text>

      {loading ? (
        [1, 2, 3].map((i) => <SkeletonRow key={i} />)
      ) : topImprovers.length === 0 ? (
        <EmptyState icon="line-chart" title="No improvers yet" description="Data is still loading or unavailable." />
      ) : (
        topImprovers.map((row) => (
          <Card key={row.id} level={2} padding="md" style={styles.moverCard}>
            <View style={{ flex: 1 }}>
              <Text variant="label" color="primary">{row.lga}</Text>
              <Text variant="caption" color="tertiary" style={{ marginTop: 2 }}>
                {row.indicator} · {row.state}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', marginLeft: spacing.md }}>
              <Text variant="numSm" color={semantic.success}>
                +{row.change_pct.toFixed(1)}%
              </Text>
              <Text variant="caption" color="muted" style={{ marginTop: 2 }}>
                {fmt(row.y2022)} → {fmt(row.y2025)}
              </Text>
            </View>
          </Card>
        ))
      )}

      <View style={{ height: spacing.huge }} />
    </ScrollView>
  );
}

function MetricCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text variant="numSm" color="primary">{value}</Text>
      <Text variant="caption" color="muted" style={{ marginTop: 2 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.primary },

  banner: {
    padding: spacing.xxl,
    paddingTop: spacing.md,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },

  errorBox: {
    margin: spacing.lg,
    backgroundColor: semantic.dangerBg,
    borderColor: 'rgba(239,68,68,0.2)',
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.md,
  },

  sectionTitle: { marginHorizontal: spacing.lg, marginTop: spacing.xxl, marginBottom: spacing.md },
  sectionSub: { marginHorizontal: spacing.lg, marginTop: -spacing.sm, marginBottom: spacing.md },

  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: spacing.lg - spacing.xs / 2 },

  stateCard: { marginHorizontal: spacing.lg, marginBottom: spacing.md },
  stateHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  stateMetrics: { flexDirection: 'row', justifyContent: 'space-between' },

  moverCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
