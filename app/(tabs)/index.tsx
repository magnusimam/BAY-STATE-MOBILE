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
import { Card, Text, Badge, EmptyState, SkeletonKPI, SkeletonRow, AnimatedCounter, MaterializeView, LivePulse, Sparkline, BreathingGlow } from '@/components/ui';
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

  const yearSeries = (needle: string): number[] => {
    const matched = allRows.filter((r) =>
      r.indicator?.toLowerCase().includes(needle.toLowerCase()),
    );
    if (matched.length === 0) return [];
    return [
      matched.reduce((s, r) => s + (Number(r.y2022) || 0), 0),
      matched.reduce((s, r) => s + (Number(r.y2023) || 0), 0),
      matched.reduce((s, r) => s + (Number(r.y2024) || 0), 0),
      matched.reduce((s, r) => s + (Number(r.y2025) || 0), 0),
    ];
  };

  const kpis = [
    { label: 'Total Displaced', value: allSummary.totalDisplacement, color: stateColor.borno, format: fmt, series: yearSeries('displac') },
    { label: 'Conflict Incidents', value: allSummary.totalConflict, color: semantic.danger, format: fmt, series: yearSeries('conflict') },
    { label: 'Borno LGAs', value: bornoSummary.totalLGAs, color: stateColor.borno, format: (n: number) => n.toString(), series: [] as number[] },
    { label: 'Adamawa LGAs', value: adamawaSummary.totalLGAs, color: stateColor.adamawa, format: (n: number) => n.toString(), series: [] as number[] },
    { label: 'Yobe LGAs', value: yobeSummary.totalLGAs, color: stateColor.yobe, format: (n: number) => n.toString(), series: [] as number[] },
    { label: 'Total SMEs', value: allSummary.totalSMEs, color: semantic.success, format: fmt, series: yearSeries('SME') },
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
      <View style={styles.bannerWrap}>
        <BreathingGlow
          size={280}
          color={brand.amber}
          style={{ top: -100, left: -40 }}
        />
        <BreathingGlow
          size={220}
          color={brand.amberLight}
          period={4200}
          style={{ top: -40, right: -60 }}
        />
        <MaterializeView delay={0} dotCount={14}>
          <LinearGradient
            colors={[brand.amberLight, brand.amber, brand.amberDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.banner}>
            <View style={styles.bannerTop}>
              <Text variant="h2" color="#fff" style={{ letterSpacing: -0.5, flex: 1 }}>
                BAY States Intelligence
              </Text>
              <View style={styles.liveChip}>
                <LivePulse label="LIVE" size={7} />
              </View>
            </View>
            <Text variant="bodySm" color="rgba(255,255,255,0.92)" style={{ marginTop: spacing.xs }}>
              {loading ? 'Streaming data…' : `${allRows.length} data points · ${new Set(allRows.map(r => r.lga)).size} LGAs tracked`}
            </Text>
          </LinearGradient>
        </MaterializeView>
      </View>

      {error && (
        <View style={styles.errorBox}>
          <Text variant="bodySm" color={semantic.danger}>{error}</Text>
        </View>
      )}

      {/* KPI Grid */}
      <Text variant="h3" color="primary" style={styles.sectionTitle}>Key Indicators</Text>
      <MaterializeView delay={200} dotCount={16}>
        <View style={styles.kpiGrid}>
          {loading ? (
            [1, 2, 3, 4, 5, 6].map((i) => (
              <View key={i} style={{ width: CARD_W, margin: spacing.xs / 2 }}>
                <SkeletonKPI />
              </View>
            ))
          ) : (
            kpis.map((kpi, i) => {
              const hasSeries = kpi.series.length >= 2 && new Set(kpi.series).size > 1;
              const trendUp = hasSeries && kpi.series[kpi.series.length - 1] >= kpi.series[0];
              return (
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
                    <View style={{ marginTop: spacing.sm, minHeight: 28 }}>
                      {hasSeries ? (
                        <Sparkline
                          data={kpi.series}
                          width={CARD_W - spacing.lg * 2}
                          height={28}
                          color={trendUp ? semantic.success : semantic.danger}
                          delay={300 + i * 90}
                        />
                      ) : (
                        <Text variant="caption" color="muted">— steady —</Text>
                      )}
                    </View>
                  </Card>
                </View>
              );
            })
          )}
        </View>
      </MaterializeView>

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

  bannerWrap: { position: 'relative', overflow: 'hidden' },
  banner: {
    padding: spacing.xxl,
    paddingTop: spacing.md,
    borderBottomLeftRadius: radius.xxl,
    borderBottomRightRadius: radius.xxl,
  },
  bannerTop: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  liveChip: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
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
