import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { BAY_STATES } from '@/constants/Config';
import { api } from '@/lib/api';
import { LgaProfileRow } from '@/lib/api-types';
import { spacing, radius, background, elevation, stateColor, brand, textColor } from '@/constants/Tokens';
import { Card, Text, Badge, EmptyState, SkeletonRow } from '@/components/ui';
import { zoneColors } from '@/constants/Colors';

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

  const handlePillPress = (code: string | null) => {
    Haptics.selectionAsync().catch(() => {});
    setSelectedState(code);
  };

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor={brand.amber} />}>

      {/* Filter pills */}
      <View style={styles.pills}>
        <Pill active={!selectedState} label="All" onPress={() => handlePillPress(null)} />
        {BAY_STATES.map((s) => {
          const color = stateColor[s.code as keyof typeof stateColor];
          return (
            <Pill
              key={s.code}
              label={s.name}
              active={selectedState === s.code}
              color={color}
              onPress={() => handlePillPress(selectedState === s.code ? null : s.code)}
            />
          );
        })}
      </View>

      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder="Search LGA..."
        placeholderTextColor={textColor.muted}
        value={search}
        onChangeText={setSearch}
      />

      {/* State cards (when no filter) */}
      {!selectedState && (
        <View style={styles.stateCardsRow}>
          {BAY_STATES.map((s) => {
            const color = stateColor[s.code as keyof typeof stateColor];
            const count = profiles.filter((p) => p.state?.toLowerCase() === s.code).length;
            return (
              <View key={s.code} style={{ flex: 1, marginHorizontal: spacing.xs }}>
                <Card
                  level={3}
                  padding="md"
                  onPress={() => handlePillPress(s.code)}
                  style={{ alignItems: 'center', borderColor: color + '40' }}>
                  <View style={[styles.stateDot, { backgroundColor: color }]} />
                  <Text variant="h4" color="primary" style={{ marginTop: spacing.xs }}>{s.name}</Text>
                  <Text variant="caption" color="tertiary">{s.population}</Text>
                  <Text variant="labelSm" color={color} style={{ marginTop: spacing.xs }}>
                    {count || s.lgaCount} LGAs
                  </Text>
                </Card>
              </View>
            );
          })}
        </View>
      )}

      {/* Section title */}
      <View style={styles.sectionHeader}>
        <Text variant="h3" color="primary">
          {selectedState ? `${selectedState.charAt(0).toUpperCase() + selectedState.slice(1)} LGAs` : 'All LGAs'}
        </Text>
        {filtered.length > 0 && (
          <Badge label={String(filtered.length)} color={brand.amber} size="sm" />
        )}
      </View>

      {/* LGA list / empty / loading */}
      {loading ? (
        [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={i} />)
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={search ? 'search' : 'map-marker'}
          title={search ? 'No matches found' : 'No LGA data'}
          description={search ? `No LGAs match "${search}". Try a different search term.` : 'Pull down to refresh, or check your connection.'}
          actionLabel={search ? 'Clear search' : undefined}
          onAction={search ? () => setSearch('') : undefined}
        />
      ) : (
        filtered.map((lga) => {
          const zone = lga.risk_zone || 'Unknown';
          const zc = zoneColors[zone] || textColor.tertiary;
          return (
            <Card key={lga.id} level={2} padding="md" style={styles.lgaCard}>
              <View style={styles.lgaHeader}>
                <View style={{ flex: 1 }}>
                  <Text variant="h4" color="primary">{lga.lga}</Text>
                  <Text variant="caption" color="tertiary" style={{ marginTop: 2, textTransform: 'capitalize' }}>
                    {lga.state}
                  </Text>
                </View>
                <Badge label={zone} color={zc} size="sm" />
              </View>
              <View style={styles.metricsRow}>
                <MetricPill label="Literacy" value={`${lga.literacy_pct ?? '--'}%`} />
                <MetricPill label="Unemploy." value={`${lga.unemployment_pct ?? '--'}%`} />
                <MetricPill label="Displaced" value={fmtN(lga.displacement)} />
                <MetricPill label="Conflict" value={fmtN(lga.conflict_incidents)} />
              </View>
            </Card>
          );
        })
      )}

      <View style={{ height: spacing.huge }} />
    </ScrollView>
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

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricPill}>
      <Text variant="label" color="primary">{value}</Text>
      <Text variant="caption" color="muted" style={{ marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function fmtN(v: number | null | undefined): string {
  if (v == null) return '--';
  if (v >= 1e6) return (v / 1e6).toFixed(1) + 'M';
  if (v >= 1e3) return (v / 1e3).toFixed(1) + 'K';
  return v.toString();
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.primary },

  pills: { flexDirection: 'row', padding: spacing.lg, gap: spacing.sm },
  pill: {
    minHeight: 44,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    borderRadius: radius.full,
    ...elevation.L1,
  },

  search: {
    marginHorizontal: spacing.lg,
    minHeight: 48,
    borderRadius: radius.lg,
    padding: spacing.md,
    fontSize: 15,
    color: textColor.primary,
    marginBottom: spacing.sm,
    ...elevation.L2,
  },

  stateCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  stateDot: { width: 10, height: 10, borderRadius: 5 },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },

  lgaCard: { marginHorizontal: spacing.lg, marginBottom: spacing.sm },
  lgaHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  metricsRow: { flexDirection: 'row', marginTop: spacing.md, gap: spacing.xs },
  metricPill: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderRadius: radius.md,
    ...elevation.L1,
  },
});
