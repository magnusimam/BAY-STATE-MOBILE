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
import { stateColors, zoneColors } from '@/constants/Colors';
import { BAY_STATES } from '@/constants/Config';
import { api } from '@/lib/api';
import { LgaProfileRow } from '@/lib/api-types';

export default function StatesScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profiles, setProfiles] = useState<LgaProfileRow[]>([]);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.getLgaProfiles();
      setProfiles(res.data || []);
    } catch {} finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filtered = profiles.filter((p) => {
    if (selectedState && p.state?.toLowerCase() !== selectedState) return false;
    if (search && !p.lga?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
          style={[styles.pill, !selectedState && styles.pillActive]}
          onPress={() => setSelectedState(null)}>
          <Text style={[styles.pillText, !selectedState && styles.pillTextActive]}>All</Text>
        </TouchableOpacity>
        {BAY_STATES.map((s) => {
          const active = selectedState === s.code;
          const color = stateColors[s.code as keyof typeof stateColors];
          return (
            <TouchableOpacity
              key={s.code}
              style={[styles.pill, active && { backgroundColor: color }]}
              onPress={() => setSelectedState(active ? null : s.code)}>
              <Text style={[styles.pillText, active && styles.pillTextActive]}>{s.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder="Search LGA..."
        placeholderTextColor="rgba(255,255,255,0.3)"
        value={search}
        onChangeText={setSearch}
      />

      {/* State cards (when no filter) */}
      {!selectedState && (
        <View style={styles.stateCards}>
          {BAY_STATES.map((s) => {
            const color = stateColors[s.code as keyof typeof stateColors];
            const count = profiles.filter((p) => p.state?.toLowerCase() === s.code).length;
            return (
              <TouchableOpacity
                key={s.code}
                style={[styles.stateCard, { borderColor: color }]}
                onPress={() => setSelectedState(s.code)}>
                <View style={[styles.stateDot, { backgroundColor: color }]} />
                <Text style={styles.stateName}>{s.name}</Text>
                <Text style={styles.statePop}>{s.population}</Text>
                <Text style={[styles.stateLga, { color }]}>{count || s.lgaCount} LGAs</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* LGA list */}
      <Text style={styles.sectionTitle}>
        {selectedState ? `${selectedState.charAt(0).toUpperCase() + selectedState.slice(1)} LGAs` : 'All LGAs'}
        {filtered.length > 0 ? ` (${filtered.length})` : ''}
      </Text>

      {filtered.length === 0 && (
        <Text style={styles.emptyText}>
          {search ? 'No LGAs match your search' : 'No LGA data available. Pull to refresh.'}
        </Text>
      )}

      {filtered.map((lga) => {
        const zone = lga.risk_zone || 'Unknown';
        const zc = zoneColors[zone] || '#94a3b8';
        return (
          <View key={lga.id} style={styles.lgaCard}>
            <View style={styles.lgaHeader}>
              <Text style={styles.lgaName}>{lga.lga}</Text>
              <View style={[styles.zoneBadge, { backgroundColor: zc + '20' }]}>
                <Text style={[styles.zoneBadgeText, { color: zc }]}>{zone}</Text>
              </View>
            </View>
            <Text style={styles.lgaState}>{lga.state}</Text>
            <View style={styles.metricsRow}>
              <Pill label="Literacy" value={`${lga.literacy_pct ?? '--'}%`} />
              <Pill label="Unemploy." value={`${lga.unemployment_pct ?? '--'}%`} />
              <Pill label="Displaced" value={fmtN(lga.displacement)} />
              <Pill label="Conflict" value={fmtN(lga.conflict_incidents)} />
            </View>
          </View>
        );
      })}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <View style={pillStyles.container}>
      <Text style={pillStyles.value}>{value}</Text>
      <Text style={pillStyles.label}>{label}</Text>
    </View>
  );
}

function fmtN(v: number | null | undefined): string {
  if (v == null) return '--';
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  return v.toString();
}

const pillStyles = StyleSheet.create({
  container: { flex: 1, borderRadius: 8, padding: 8, margin: 2, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)' },
  value: { color: '#f5f5f5', fontSize: 14, fontWeight: '700' },
  label: { color: '#94a3b8', fontSize: 10, marginTop: 2 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a0a0f' },
  center: { flex: 1, backgroundColor: '#0a0a0f', justifyContent: 'center', alignItems: 'center' },

  pills: { flexDirection: 'row', padding: 16, gap: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.08)' },
  pillActive: { backgroundColor: '#f4b942' },
  pillText: { fontSize: 14, fontWeight: '600', color: '#94a3b8' },
  pillTextActive: { color: '#fff' },

  search: {
    marginHorizontal: 16, borderRadius: 14, padding: 13, fontSize: 15, marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1, color: '#fff',
  },

  stateCards: { flexDirection: 'row', paddingHorizontal: 12, marginTop: 8 },
  stateCard: {
    flex: 1, margin: 4, borderRadius: 12, padding: 12, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1,
  },
  stateDot: { width: 10, height: 10, borderRadius: 5, marginBottom: 6 },
  stateName: { color: '#f5f5f5', fontSize: 15, fontWeight: '700' },
  statePop: { color: '#94a3b8', fontSize: 11, marginTop: 2 },
  stateLga: { fontSize: 13, fontWeight: '600', marginTop: 4 },

  sectionTitle: { color: '#f5f5f5', fontSize: 18, fontWeight: '700', marginHorizontal: 16, marginTop: 16, marginBottom: 12 },
  emptyText: { color: '#64748b', marginHorizontal: 16, fontSize: 14, fontStyle: 'italic' },

  lgaCard: {
    marginHorizontal: 16, marginBottom: 10, borderRadius: 12, padding: 14,
    backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.08)', borderWidth: 1,
  },
  lgaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lgaName: { color: '#f5f5f5', fontSize: 16, fontWeight: '700' },
  lgaState: { color: '#94a3b8', fontSize: 12, marginTop: 2, textTransform: 'capitalize' },
  zoneBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  zoneBadgeText: { fontSize: 11, fontWeight: '600' },
  metricsRow: { flexDirection: 'row', marginTop: 10, gap: 4 },
});
