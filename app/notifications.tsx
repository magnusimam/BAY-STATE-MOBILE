import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { PageHeader } from '@/components/PageHeader';
import { spacing, radius, background, brand, textColor, borderColor } from '@/constants/Tokens';
import { Text, Card, Badge } from '@/components/ui';

const CHANNELS = [
  { id: 'data', icon: 'refresh' as const, label: 'New data syncs', hint: 'When fresh BAY States data is ingested' },
  { id: 'anomaly', icon: 'exclamation-triangle' as const, label: 'Anomaly alerts', hint: '>30% shifts in any indicator' },
  { id: 'brief', icon: 'file-text-o' as const, label: 'Policy briefs', hint: 'New briefs published' },
  { id: 'digest', icon: 'calendar' as const, label: 'Weekly digest', hint: 'Every Monday, summary of the week' },
];

const RECENT = [
  { title: 'Data sync completed', body: '650 rows updated · 3 anomalies flagged', time: '2h ago', kind: 'info' },
  { title: 'Weekly digest ready', body: 'Week of Apr 13-19 · literacy gains in Adamawa', time: '1d ago', kind: 'info' },
  { title: 'Anomaly detected', body: 'Monguno conflict incidents +47% (2024→2025)', time: '3d ago', kind: 'warn' },
];

export default function NotificationsScreen() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    data: true, anomaly: true, brief: true, digest: false,
  });

  return (
    <View style={styles.container}>
      <PageHeader title="Notifications" subtitle="Stay up to date with BAY States changes" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="overline" color="tertiary" style={styles.sectionTitle}>Recent</Text>
        {RECENT.map((n, i) => (
          <Card key={i} level={2} padding="md" style={{ marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
              <FontAwesome
                name={n.kind === 'warn' ? 'exclamation-triangle' : 'info-circle'}
                size={18}
                color={n.kind === 'warn' ? '#f59e0b' : brand.amber}
                style={{ marginTop: 2 }}
              />
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text variant="label" color="primary" style={{ flex: 1 }}>{n.title}</Text>
                  <Text variant="caption" color="muted">{n.time}</Text>
                </View>
                <Text variant="caption" color="tertiary" style={{ marginTop: 2 }}>{n.body}</Text>
              </View>
            </View>
          </Card>
        ))}

        <Text variant="overline" color="tertiary" style={styles.sectionTitle}>Channels</Text>
        <View style={styles.group}>
          {CHANNELS.map((c, i) => (
            <View
              key={c.id}
              style={[styles.row, i < CHANNELS.length - 1 && styles.rowBorder]}
            >
              <FontAwesome name={c.icon} size={18} color={brand.amber} style={{ width: 26 }} />
              <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                <Text variant="body" color="primary">{c.label}</Text>
                <Text variant="caption" color="tertiary" style={{ marginTop: 2 }}>{c.hint}</Text>
              </View>
              <Switch
                value={!!prefs[c.id]}
                onValueChange={(v) => setPrefs((p) => ({ ...p, [c.id]: v }))}
                trackColor={{ false: 'rgba(255,255,255,0.12)', true: brand.amberBorder }}
                thumbColor={prefs[c.id] ? brand.amber : '#888'}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.primary },
  scroll: { padding: spacing.lg, paddingBottom: spacing.huge },
  sectionTitle: { marginTop: spacing.md, marginBottom: spacing.sm, letterSpacing: 1.2 },
  group: {
    backgroundColor: background.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: borderColor.subtle,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.md, minHeight: 60 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: borderColor.subtle },
});
