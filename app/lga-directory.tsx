import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, TextInput, FlatList, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { PageHeader } from '@/components/PageHeader';
import { api, filterByState } from '@/lib/api';
import type { MasterRow } from '@/lib/api-types';
import {
  spacing,
  radius,
  background,
  brand,
  textColor,
  borderColor,
  stateColor,
} from '@/constants/Tokens';
import { Text, Badge, SkeletonRow } from '@/components/ui';

export default function LgaDirectoryScreen() {
  const [rows, setRows] = useState<MasterRow[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMaster()
      .then((r) => setRows(r.data || []))
      .finally(() => setLoading(false));
  }, []);

  const lgas = useMemo(() => {
    const map = new Map<string, { state: string; lga: string; indicatorCount: number }>();
    for (const r of rows) {
      if (!r.lga) continue;
      const key = `${r.state}:${r.lga}`;
      const existing = map.get(key);
      if (existing) existing.indicatorCount++;
      else map.set(key, { state: r.state, lga: r.lga, indicatorCount: 1 });
    }
    return [...map.values()].sort((a, b) => {
      if (a.state !== b.state) return a.state.localeCompare(b.state);
      return a.lga.localeCompare(b.lga);
    });
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return lgas;
    return lgas.filter(
      (l) =>
        l.lga.toLowerCase().includes(q) || l.state.toLowerCase().includes(q),
    );
  }, [lgas, query]);

  return (
    <View style={styles.container}>
      <PageHeader title="LGA Directory" subtitle={`${lgas.length} Local Government Areas tracked`} />

      <View style={styles.searchWrap}>
        <FontAwesome name="search" size={14} color={textColor.muted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search LGA or state…"
          placeholderTextColor={textColor.muted}
          style={styles.search}
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query ? (
          <Pressable onPress={() => setQuery('')} hitSlop={8}>
            <FontAwesome name="times-circle" size={14} color={textColor.muted} />
          </Pressable>
        ) : null}
      </View>

      {loading ? (
        <View style={{ paddingTop: spacing.sm }}>
          {[1, 2, 3, 4].map((i) => (
            <SkeletonRow key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(l) => `${l.state}-${l.lga}`}
          contentContainerStyle={{ paddingBottom: spacing.huge }}
          renderItem={({ item }) => {
            const color =
              stateColor[item.state.toLowerCase() as keyof typeof stateColor] || brand.amber;
            return (
              <View style={styles.row}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <View style={{ flex: 1 }}>
                  <Text variant="label" color="primary">{item.lga}</Text>
                  <Text variant="caption" color="tertiary" style={{ marginTop: 1 }}>
                    {item.state}
                  </Text>
                </View>
                <Badge label={`${item.indicatorCount} ind.`} color={color} size="sm" />
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={{ padding: spacing.xl, alignItems: 'center' }}>
              <Text variant="body" color="tertiary">No LGA matches "{query}"</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.primary },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: background.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: borderColor.default,
    gap: spacing.sm,
  },
  search: { flex: 1, color: textColor.primary, fontSize: 15, minHeight: 36 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: borderColor.subtle,
    gap: spacing.md,
  },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
