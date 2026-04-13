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
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { stateColors } from '@/constants/Colors';
import { api } from '@/lib/api';
import { TrendAnalysisRow } from '@/lib/api-types';

export default function TrendsScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trends, setTrends] = useState<TrendAnalysisRow[]>([]);
  const [filterState, setFilterState] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await api.getTrends();
      setTrends(res.data || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = trends.filter((t) => {
    if (filterState && t.state?.toLowerCase() !== filterState) return false;
    return true;
  });

  // Group by section
  const sections = new Map<string, TrendAnalysisRow[]>();
  for (const t of filtered) {
    const key = t.section || 'General';
    const arr = sections.get(key) || [];
    arr.push(t);
    sections.set(key, arr);
  }

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={colors.primary} />}>

      {/* Filter pills */}
      <View style={styles.pills}>
        <TouchableOpacity
          style={[styles.pill, !filterState && { backgroundColor: colors.primary }]}
          onPress={() => setFilterState(null)}>
          <Text style={[styles.pillText, !filterState && { color: '#fff' }]}>All</Text>
        </TouchableOpacity>
        {(['borno', 'adamawa', 'yobe'] as const).map((s) => {
          const active = filterState === s;
          const color = stateColors[s];
          return (
            <TouchableOpacity
              key={s}
              style={[styles.pill, active && { backgroundColor: color }]}
              onPress={() => setFilterState(active ? null : s)}>
              <Text style={[styles.pillText, active && { color: '#fff' }]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {filtered.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            No trend data available. Pull to refresh.
          </Text>
        </View>
      )}

      {[...sections.entries()].map(([section, rows]) => (
        <View key={section} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{section}</Text>
          {rows.map((row) => (
            <View key={row.id} style={[styles.trendCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <View style={styles.trendHeader}>
                <Text style={[styles.trendMetric, { color: colors.text }]}>{row.metric}</Text>
                {row.state && (
                  <View style={[styles.statePill, { backgroundColor: (stateColors[row.state.toLowerCase() as keyof typeof stateColors] || colors.accent) + '20' }]}>
                    <Text style={[styles.statePillText, { color: stateColors[row.state.toLowerCase() as keyof typeof stateColors] || colors.accent }]}>
                      {row.state}
                    </Text>
                  </View>
                )}
              </View>
              {row.content && (
                <Text style={[styles.trendContent, { color: colors.textSecondary }]}>
                  {row.content}
                </Text>
              )}
            </View>
          ))}
        </View>
      ))}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pills: { flexDirection: 'row', padding: 16, gap: 8 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
  },
  pillText: { fontSize: 14, fontWeight: '600', color: '#475569' },
  emptyBox: { padding: 32, alignItems: 'center' },
  emptyText: { fontSize: 15, fontStyle: 'italic' },
  section: { marginTop: 8 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginHorizontal: 16,
    marginBottom: 10,
    marginTop: 8,
  },
  trendCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  trendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trendMetric: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  statePill: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  statePillText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  trendContent: { fontSize: 13, marginTop: 8, lineHeight: 19 },
});
