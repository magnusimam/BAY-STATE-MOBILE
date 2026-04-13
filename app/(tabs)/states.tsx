import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useColorScheme } from '@/components/useColorScheme';
import Colors, { stateColors, zoneColors } from '@/constants/Colors';
import { BAY_STATES } from '@/constants/Config';
import { api } from '@/lib/api';
import { LgaProfileRow } from '@/lib/api-types';

export default function StatesScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profiles, setProfiles] = useState<LgaProfileRow[]>([]);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.getLgaProfiles();
      setProfiles(res.data || []);
    } catch {
      // silently fail, show empty
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredProfiles = profiles.filter((p) => {
    if (selectedState && p.state?.toLowerCase() !== selectedState) return false;
    if (search && !p.lga?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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

      {/* State selector pills */}
      <View style={styles.pills}>
        <TouchableOpacity
          style={[styles.pill, !selectedState && { backgroundColor: colors.primary }]}
          onPress={() => setSelectedState(null)}>
          <Text style={[styles.pillText, !selectedState && { color: '#fff' }]}>All</Text>
        </TouchableOpacity>
        {BAY_STATES.map((s) => {
          const active = selectedState === s.code;
          const color = stateColors[s.code as keyof typeof stateColors];
          return (
            <TouchableOpacity
              key={s.code}
              style={[styles.pill, active && { backgroundColor: color }]}
              onPress={() => setSelectedState(active ? null : s.code)}>
              <Text style={[styles.pillText, active && { color: '#fff' }]}>{s.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search */}
      <TextInput
        style={[styles.search, { backgroundColor: colors.surfaceVariant, color: colors.text, borderColor: colors.border }]}
        placeholder="Search LGA..."
        placeholderTextColor={colors.textSecondary}
        value={search}
        onChangeText={setSearch}
      />

      {/* State summary cards */}
      {!selectedState && (
        <View style={styles.stateCards}>
          {BAY_STATES.map((s) => {
            const color = stateColors[s.code as keyof typeof stateColors];
            const count = profiles.filter((p) => p.state?.toLowerCase() === s.code).length;
            return (
              <TouchableOpacity
                key={s.code}
                style={[styles.stateCard, { backgroundColor: colors.card, borderColor: color, borderWidth: 1 }]}
                onPress={() => setSelectedState(s.code)}>
                <Text style={[styles.stateEmoji, { color }]}>
                  {s.code === 'borno' ? '🔴' : s.code === 'adamawa' ? '🟡' : '🔵'}
                </Text>
                <Text style={[styles.stateName, { color: colors.text }]}>{s.name}</Text>
                <Text style={[styles.statePop, { color: colors.textSecondary }]}>Pop: {s.population}</Text>
                <Text style={[styles.stateLga, { color }]}>{count || s.lgaCount} LGAs</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* LGA Cards */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {selectedState ? `${selectedState.charAt(0).toUpperCase() + selectedState.slice(1)} LGAs` : 'All LGAs'}
        {filteredProfiles.length > 0 && ` (${filteredProfiles.length})`}
      </Text>

      {filteredProfiles.length === 0 && (
        <Text style={[styles.empty, { color: colors.textSecondary }]}>
          {search ? 'No LGAs match your search' : 'No LGA data available. Pull to refresh.'}
        </Text>
      )}

      {filteredProfiles.map((lga) => {
        const zone = lga.risk_zone || 'Unknown';
        const zoneColor = zoneColors[zone] || colors.textSecondary;
        return (
          <View key={lga.id} style={[styles.lgaCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <View style={styles.lgaHeader}>
              <Text style={[styles.lgaName, { color: colors.text }]}>{lga.lga}</Text>
              <View style={[styles.zoneBadge, { backgroundColor: zoneColor + '20' }]}>
                <Text style={[styles.zoneBadgeText, { color: zoneColor }]}>{zone}</Text>
              </View>
            </View>
            <Text style={[styles.lgaState, { color: colors.textSecondary }]}>{lga.state}</Text>
            <View style={styles.lgaMetrics}>
              <MetricPill label="Literacy" value={`${lga.literacy_pct ?? '--'}%`} colors={colors} />
              <MetricPill label="Unemploy." value={`${lga.unemployment_pct ?? '--'}%`} colors={colors} />
              <MetricPill label="Displaced" value={formatNum(lga.displacement)} colors={colors} />
              <MetricPill label="Conflict" value={formatNum(lga.conflict_incidents)} colors={colors} />
            </View>
          </View>
        );
      })}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function MetricPill({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={[mpStyles.pill, { backgroundColor: colors.surfaceVariant }]}>
      <Text style={[mpStyles.val, { color: colors.text }]}>{value}</Text>
      <Text style={[mpStyles.lbl, { color: colors.textSecondary }]}>{label}</Text>
    </View>
  );
}

function formatNum(val: number | null | undefined): string {
  if (val == null) return '--';
  if (val >= 1_000_000) return (val / 1_000_000).toFixed(1) + 'M';
  if (val >= 1_000) return (val / 1_000).toFixed(1) + 'K';
  return val.toString();
}

const mpStyles = StyleSheet.create({
  pill: { borderRadius: 8, padding: 8, flex: 1, margin: 2, alignItems: 'center' },
  val: { fontSize: 14, fontWeight: '700' },
  lbl: { fontSize: 10, marginTop: 2 },
});

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
  search: {
    marginHorizontal: 16,
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    borderWidth: 1,
    marginBottom: 8,
  },
  stateCards: { flexDirection: 'row', paddingHorizontal: 12, marginTop: 8 },
  stateCard: {
    flex: 1,
    margin: 4,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  stateEmoji: { fontSize: 24 },
  stateName: { fontSize: 16, fontWeight: '700', marginTop: 4 },
  statePop: { fontSize: 11, marginTop: 2 },
  stateLga: { fontSize: 13, fontWeight: '600', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginHorizontal: 16, marginTop: 16, marginBottom: 12 },
  empty: { marginHorizontal: 16, fontSize: 14, fontStyle: 'italic' },
  lgaCard: {
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
  },
  lgaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lgaName: { fontSize: 16, fontWeight: '700' },
  lgaState: { fontSize: 12, marginTop: 2, textTransform: 'capitalize' },
  zoneBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  zoneBadgeText: { fontSize: 11, fontWeight: '600' },
  lgaMetrics: { flexDirection: 'row', marginTop: 10, gap: 4 },
});
