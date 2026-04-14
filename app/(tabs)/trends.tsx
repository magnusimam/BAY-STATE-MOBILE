import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { stateColors } from '@/constants/Colors';
import { api, filterByState, fmt, getUniqueIndicators } from '@/lib/api';
import { MasterRow } from '@/lib/api-types';

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

  // Filter
  let filtered = allRows;
  if (filterState) filtered = filterByState(filtered, filterState);
  if (filterIndicator) filtered = filtered.filter((r) => r.indicator === filterIndicator);

  // Tab filter
  if (tab === 'improvers') filtered = filtered.filter((r) => r.change_pct > 0);
  if (tab === 'decliners') filtered = filtered.filter((r) => r.change_pct < 0);

  // Sort by change_pct
  const sorted = [...filtered]
    .filter((r) => r.change_pct != null)
    .sort((a, b) => tab === 'decliners' ? a.change_pct - b.change_pct : b.change_pct - a.change_pct);

  const indicators = getUniqueIndicators(allRows);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#f4b942" /></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#f4b942" />}>

      {/* State filter pills */}
      <View style={styles.pills}>
        <TouchableOpacity
          style={[styles.pill, !filterState && styles.pillActive]}
          onPress={() => setFilterState(null)}>
          <Text style={[styles.pillText, !filterState && styles.pillTextActive]}>All States</Text>
        </TouchableOpacity>
        {(['Borno', 'Adamawa', 'Yobe'] as const).map((s) => {
          const active = filterState === s;
          const color = stateColors[s.toLowerCase() as keyof typeof stateColors];
          return (
            <TouchableOpacity
              key={s}
              style={[styles.pill, active && { backgroundColor: color }]}
              onPress={() => setFilterState(active ? null : s)}>
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{s}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Indicator filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.indicatorScroll}>
        <TouchableOpacity
          style={[styles.indicatorPill, !filterIndicator && styles.indicatorActive]}
          onPress={() => setFilterIndicator(null)}>
          <Text style={[styles.indicatorText, !filterIndicator && styles.indicatorTextActive]}>All Indicators</Text>
        </TouchableOpacity>
        {indicators.map((ind) => (
          <TouchableOpacity
            key={ind}
            style={[styles.indicatorPill, filterIndicator === ind && styles.indicatorActive]}
            onPress={() => setFilterIndicator(filterIndicator === ind ? null : ind)}>
            <Text style={[styles.indicatorText, filterIndicator === ind && styles.indicatorTextActive]}>{ind}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* KPI Summary Cards */}
      <View style={styles.kpiRow}>
        <View style={styles.kpiMini}>
          <Text style={styles.kpiMiniValue}>{allRows.length}</Text>
          <Text style={styles.kpiMiniLabel}>Total Tracked</Text>
        </View>
        <View style={styles.kpiMini}>
          <Text style={[styles.kpiMiniValue, { color: '#22c55e' }]}>
            {allRows.filter(r => r.trend?.toLowerCase().includes('improv')).length}
          </Text>
          <Text style={styles.kpiMiniLabel}>Improving</Text>
        </View>
        <View style={styles.kpiMini}>
          <Text style={[styles.kpiMiniValue, { color: '#ef4444' }]}>
            {allRows.filter(r => r.trend?.toLowerCase().includes('declin')).length}
          </Text>
          <Text style={styles.kpiMiniLabel}>Declining</Text>
        </View>
        <View style={styles.kpiMini}>
          <Text style={[styles.kpiMiniValue, { color: '#94a3b8' }]}>
            {allRows.filter(r => !r.trend?.toLowerCase().includes('improv') && !r.trend?.toLowerCase().includes('declin')).length}
          </Text>
          <Text style={styles.kpiMiniLabel}>Stable</Text>
        </View>
      </View>

      {/* Tab: All / Improvers / Decliners */}
      <View style={styles.tabs}>
        {(['all', 'improvers', 'decliners'] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'all' ? `All (${sorted.length})` : t === 'improvers' ? 'Improvers ↑' : 'Decliners ↓'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Results */}
      {sorted.length === 0 && (
        <Text style={styles.emptyText}>No data matches your filters.</Text>
      )}

      {sorted.slice(0, 30).map((row) => {
        const isUp = row.change_pct > 0;
        const sc = stateColors[row.state.toLowerCase() as keyof typeof stateColors] || '#6ec6e8';
        return (
          <View key={row.id} style={styles.trendCard}>
            <View style={styles.trendTop}>
              <View style={{ flex: 1 }}>
                <Text style={styles.trendLga}>{row.lga}</Text>
                <Text style={styles.trendIndicator}>{row.indicator}</Text>
              </View>
              <View style={[styles.statePill, { backgroundColor: sc + '20' }]}>
                <Text style={[styles.statePillText, { color: sc }]}>{row.state}</Text>
              </View>
            </View>

            {/* Year-over-year values */}
            <View style={styles.yearRow}>
              <YearVal label="2022" value={row.y2022} />
              <Text style={styles.arrow}>→</Text>
              <YearVal label="2023" value={row.y2023} />
              <Text style={styles.arrow}>→</Text>
              <YearVal label="2024" value={row.y2024} />
              <Text style={styles.arrow}>→</Text>
              <YearVal label="2025" value={row.y2025} highlight />
            </View>

            {/* Change + trend */}
            <View style={styles.trendBottom}>
              <Text style={[styles.changePct, { color: isUp ? '#22c55e' : '#ef4444' }]}>
                {isUp ? '+' : ''}{row.change_pct.toFixed(1)}% (4yr)
              </Text>
              {row.trend ? (
                <View style={[styles.trendBadge, {
                  backgroundColor: row.trend.toLowerCase().includes('improv') ? 'rgba(34,197,94,0.15)' :
                    row.trend.toLowerCase().includes('declin') ? 'rgba(239,68,68,0.15)' : 'rgba(148,163,184,0.15)'
                }]}>
                  <Text style={[styles.trendBadgeText, {
                    color: row.trend.toLowerCase().includes('improv') ? '#22c55e' :
                      row.trend.toLowerCase().includes('declin') ? '#ef4444' : '#94a3b8'
                  }]}>{row.trend}</Text>
                </View>
              ) : null}
            </View>
          </View>
        );
      })}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function YearVal({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <View style={yvStyles.container}>
      <Text style={[yvStyles.value, highlight && yvStyles.valueHighlight]}>{fmt(value)}</Text>
      <Text style={yvStyles.label}>{label}</Text>
    </View>
  );
}

const yvStyles = StyleSheet.create({
  container: { alignItems: 'center', flex: 1 },
  value: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  valueHighlight: { color: '#f5f5f5', fontSize: 14, fontWeight: '700' },
  label: { color: '#64748b', fontSize: 10, marginTop: 1 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  center: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' },

  pills: { flexDirection: 'row', paddingHorizontal: 16, paddingTop: 16, gap: 8 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  pillActive: { backgroundColor: '#f4b942' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#94a3b8' },
  pillTextActive: { color: '#fff' },

  indicatorScroll: { paddingLeft: 16, paddingVertical: 10 },
  indicatorPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.05)', marginRight: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  indicatorActive: { backgroundColor: 'rgba(244,185,66,0.15)', borderColor: 'rgba(244,185,66,0.3)' },
  indicatorText: { fontSize: 12, color: '#94a3b8' },
  indicatorTextActive: { color: '#f4b942' },

  kpiRow: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 12, gap: 4 },
  kpiMini: {
    flex: 1, borderRadius: 10, padding: 10, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
  },
  kpiMiniValue: { color: '#f5f5f5', fontSize: 20, fontWeight: '800' },
  kpiMiniLabel: { color: '#64748b', fontSize: 9, marginTop: 2, fontWeight: '600' },

  tabs: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 3 },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  tabActive: { backgroundColor: 'rgba(255,255,255,0.1)' },
  tabText: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  tabTextActive: { color: '#f5f5f5' },

  emptyText: { color: '#64748b', marginHorizontal: 16, fontSize: 14, fontStyle: 'italic', marginTop: 20 },

  trendCard: {
    marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 14,
    backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
  },
  trendTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  trendLga: { color: '#f5f5f5', fontSize: 15, fontWeight: '700' },
  trendIndicator: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  statePill: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  statePillText: { fontSize: 11, fontWeight: '600' },

  yearRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  arrow: { color: '#64748b', fontSize: 11, marginHorizontal: 2 },

  trendBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  changePct: { fontSize: 14, fontWeight: '700' },
  trendBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  trendBadgeText: { fontSize: 11, fontWeight: '600' },
});
