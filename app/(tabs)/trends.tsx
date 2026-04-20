import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { api, filterByState, fmt, getUniqueIndicators } from '@/lib/api';
import { MasterRow } from '@/lib/api-types';
import { spacing, radius, background, elevation, stateColor, brand, semantic, textColor } from '@/constants/Tokens';
import { Card, Text, Badge, EmptyState, SkeletonRow, TrendPulseCard, Sparkline } from '@/components/ui';

type Tab = 'all' | 'improvers' | 'decliners';

export default function TrendsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allRows, setAllRows] = useState<MasterRow[]>([]);
  const [filterState, setFilterState] = useState<string | null>(null);
  const [filterIndicator, setFilterIndicator] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('all');

  const fetchData = async () => {
    try {
      const res = await api.getMaster();
      setAllRows(res.data || []);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleFilterChange = (setter: () => void) => {
    Haptics.selectionAsync().catch(() => {});
    setter();
  };

  let filtered = allRows;
  if (filterState) filtered = filterByState(filtered, filterState);
  if (filterIndicator) filtered = filtered.filter((r) => r.indicator === filterIndicator);
  if (tab === 'improvers') filtered = filtered.filter((r) => r.change_pct > 0);
  if (tab === 'decliners') filtered = filtered.filter((r) => r.change_pct < 0);

  const sorted = [...filtered]
    .filter((r) => r.change_pct != null)
    .sort((a, b) => tab === 'decliners' ? a.change_pct - b.change_pct : b.change_pct - a.change_pct);

  const indicators = getUniqueIndicators(allRows);

  const improvingCount = allRows.filter(r => r.trend?.toLowerCase().includes('improv')).length;
  const decliningCount = allRows.filter(r => r.trend?.toLowerCase().includes('declin')).length;
  const stableCount = allRows.length - improvingCount - decliningCount;

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={brand.amber} />}>

      {/* KPI summary */}
      <View style={styles.kpiRow}>
        <MiniKPI value={allRows.length} label="Tracked" />
        <MiniKPI value={improvingCount} label="Improving" color={semantic.success} />
        <MiniKPI value={decliningCount} label="Declining" color={semantic.danger} />
        <MiniKPI value={stableCount} label="Stable" color={textColor.tertiary} />
      </View>

      {/* State filter */}
      <View style={styles.pills}>
        <Pill label="All" active={!filterState} onPress={() => handleFilterChange(() => setFilterState(null))} />
        {(['Borno', 'Adamawa', 'Yobe'] as const).map((s) => {
          const color = stateColor[s.toLowerCase() as keyof typeof stateColor];
          return (
            <Pill
              key={s}
              label={s}
              active={filterState === s}
              color={color}
              onPress={() => handleFilterChange(() => setFilterState(filterState === s ? null : s))}
            />
          );
        })}
      </View>

      {/* Indicator filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.indicatorScroll}>
        <IndPill label="All Indicators" active={!filterIndicator} onPress={() => handleFilterChange(() => setFilterIndicator(null))} />
        {indicators.map((ind) => (
          <IndPill
            key={ind}
            label={ind}
            active={filterIndicator === ind}
            onPress={() => handleFilterChange(() => setFilterIndicator(filterIndicator === ind ? null : ind))}
          />
        ))}
      </ScrollView>

      {/* Tab: All / Improvers / Decliners */}
      <View style={styles.tabs}>
        {(['all', 'improvers', 'decliners'] as Tab[]).map((t) => (
          <Pressable
            key={t}
            onPress={() => { Haptics.selectionAsync().catch(() => {}); setTab(t); }}
            style={({ pressed }) => [
              styles.tab,
              tab === t && styles.tabActive,
              pressed && { opacity: 0.7 },
            ]}>
            <Text variant="labelSm" color={tab === t ? 'primary' : 'tertiary'}>
              {t === 'all' ? `All (${sorted.length})` : t === 'improvers' ? 'Improvers ↑' : 'Decliners ↓'}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Results */}
      {loading ? (
        [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)
      ) : sorted.length === 0 ? (
        <EmptyState
          icon="filter"
          title="No data matches your filters"
          description="Try adjusting your state, indicator, or tab selection."
          actionLabel="Clear all filters"
          onAction={() => { setFilterState(null); setFilterIndicator(null); setTab('all'); }}
        />
      ) : (
        sorted.slice(0, 30).map((row) => {
          const isUp = row.change_pct > 0;
          const sc = stateColor[row.state.toLowerCase() as keyof typeof stateColor] || semantic.info;
          const series = [row.y2022, row.y2023, row.y2024, row.y2025].map((v) => Number(v) || 0);
          const hasSparkVariance = new Set(series).size > 1;
          return (
            <TrendPulseCard
              key={row.id}
              direction={row.change_pct > 0 ? 'up' : row.change_pct < 0 ? 'down' : 'neutral'}
              style={styles.trendCard}
            >
              <Card level={2} padding="md">
                <View style={styles.trendTop}>
                  <View style={{ flex: 1 }}>
                    <Text variant="h4" color="primary">{row.lga}</Text>
                    <Text variant="caption" color="tertiary" style={{ marginTop: 2 }}>
                      {row.indicator}
                    </Text>
                  </View>
                  <Badge label={row.state} color={sc} size="sm" />
                </View>

                {hasSparkVariance ? (
                  <View style={{ marginBottom: spacing.sm, alignItems: 'stretch' }}>
                    <Sparkline
                      data={series}
                      width={320}
                      height={32}
                      color={isUp ? semantic.success : semantic.danger}
                    />
                  </View>
                ) : null}

                <View style={styles.yearRow}>
                  <YearVal label="2022" value={row.y2022} />
                  <Text variant="caption" color="muted">→</Text>
                  <YearVal label="2023" value={row.y2023} />
                  <Text variant="caption" color="muted">→</Text>
                  <YearVal label="2024" value={row.y2024} />
                  <Text variant="caption" color="muted">→</Text>
                  <YearVal label="2025" value={row.y2025} highlight />
                </View>

                <View style={styles.trendBottom}>
                  <Text variant="numSm" color={isUp ? semantic.success : semantic.danger}>
                    {isUp ? '▲ +' : '▼ '}{row.change_pct.toFixed(1)}% (4yr)
                  </Text>
                  {row.trend ? (
                    <Badge
                      label={row.trend}
                      color={row.trend.toLowerCase().includes('improv') ? semantic.success :
                        row.trend.toLowerCase().includes('declin') ? semantic.danger : textColor.tertiary}
                      size="sm"
                    />
                  ) : null}
                </View>
              </Card>
            </TrendPulseCard>
          );
        })
      )}

      <View style={{ height: spacing.huge }} />
    </ScrollView>
  );
}

function MiniKPI({ value, label, color = textColor.primary }: { value: number; label: string; color?: string }) {
  return (
    <View style={styles.miniKpi}>
      <Text variant="numMd" color={color}>{value}</Text>
      <Text variant="caption" color="muted" style={{ marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function Pill({ active, label, onPress, color }: { active: boolean; label: string; onPress: () => void; color?: string }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        active && { backgroundColor: color || brand.amber },
        pressed && { opacity: 0.7 },
      ]}>
      <Text variant="labelSm" color={active ? '#fff' : 'tertiary'}>{label}</Text>
    </Pressable>
  );
}

function IndPill({ active, label, onPress }: { active: boolean; label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.indPill,
        active && { backgroundColor: brand.amberBg, borderColor: brand.amberBorder },
        pressed && { opacity: 0.7 },
      ]}>
      <Text variant="caption" color={active ? brand.amber : 'tertiary'}>{label}</Text>
    </Pressable>
  );
}

function YearVal({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text variant={highlight ? 'label' : 'caption'} color={highlight ? 'primary' : 'tertiary'}>
        {fmt(value)}
      </Text>
      <Text variant="caption" color="muted" style={{ marginTop: 1, fontSize: 10 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.primary },

  kpiRow: { flexDirection: 'row', padding: spacing.md, gap: spacing.xs },
  miniKpi: {
    flex: 1, borderRadius: radius.md, padding: spacing.md, alignItems: 'center',
    ...elevation.L2,
  },

  pills: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.sm },
  pill: {
    minHeight: 40,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    borderRadius: radius.full,
    ...elevation.L1,
  },

  indicatorScroll: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm },
  indPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginRight: spacing.sm,
    ...elevation.L1,
  },

  tabs: {
    flexDirection: 'row',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: 3,
    borderRadius: radius.lg,
    ...elevation.L2,
  },
  tab: { flex: 1, minHeight: 44, justifyContent: 'center', alignItems: 'center', borderRadius: radius.md },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.1)' },

  trendCard: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  trendTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.md },
  yearRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.xs },
  trendBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
});
