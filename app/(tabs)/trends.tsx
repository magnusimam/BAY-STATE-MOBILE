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
import { api } from '@/lib/api';
import { TrendAnalysisRow } from '@/lib/api-types';

export default function TrendsScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trends, setTrends] = useState<TrendAnalysisRow[]>([]);
  const [filterState, setFilterState] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const res = await api.getTrends();
      setTrends(res.data || []);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = trends.filter((t) => !filterState || t.state?.toLowerCase() === filterState);

  // Group by section
  const sections = new Map<string, TrendAnalysisRow[]>();
  for (const t of filtered) {
    const key = t.section || 'General';
    const arr = sections.get(key) || [];
    arr.push(t);
    sections.set(key, arr);
  }

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#f4b942" /></View>;
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#f4b942" />}>

      {/* Filter pills */}
      <View style={styles.pills}>
        <TouchableOpacity
          style={[styles.pill, !filterState && styles.pillActive]}
          onPress={() => setFilterState(null)}>
          <Text style={[styles.pillText, !filterState && styles.pillTextActive]}>All</Text>
        </TouchableOpacity>
        {(['borno', 'adamawa', 'yobe'] as const).map((s) => {
          const active = filterState === s;
          const color = stateColors[s];
          return (
            <TouchableOpacity
              key={s}
              style={[styles.pill, active && { backgroundColor: color }]}
              onPress={() => setFilterState(active ? null : s)}>
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {filtered.length === 0 && (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No trend data available. Pull to refresh.</Text>
        </View>
      )}

      {[...sections.entries()].map(([section, rows]) => (
        <View key={section}>
          <Text style={styles.sectionTitle}>{section}</Text>
          {rows.map((row) => {
            const sc = stateColors[row.state?.toLowerCase() as keyof typeof stateColors] || '#6ec6e8';
            return (
              <View key={row.id} style={styles.trendCard}>
                <View style={styles.trendHeader}>
                  <Text style={styles.trendMetric}>{row.metric}</Text>
                  {row.state && (
                    <View style={[styles.statePill, { backgroundColor: sc + '20' }]}>
                      <Text style={[styles.statePillText, { color: sc }]}>{row.state}</Text>
                    </View>
                  )}
                </View>
                {row.content && (
                  <Text style={styles.trendContent}>{row.content}</Text>
                )}
              </View>
            );
          })}
        </View>
      ))}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  center: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' },

  pills: { flexDirection: 'row', padding: 16, gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  pillActive: { backgroundColor: '#f4b942' },
  pillText: { fontSize: 14, fontWeight: '600', color: '#94a3b8' },
  pillTextActive: { color: '#fff' },

  emptyBox: { padding: 32, alignItems: 'center' },
  emptyText: { color: '#64748b', fontSize: 15, fontStyle: 'italic' },

  sectionTitle: { color: '#f5f5f5', fontSize: 18, fontWeight: '700', marginHorizontal: 16, marginBottom: 10, marginTop: 8 },

  trendCard: {
    marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 14,
    backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
  },
  trendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trendMetric: { color: '#f5f5f5', fontSize: 15, fontWeight: '600', flex: 1, marginRight: 8 },
  statePill: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  statePillText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  trendContent: { color: '#94a3b8', fontSize: 13, marginTop: 8, lineHeight: 19 },
});
