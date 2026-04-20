import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Switch } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { PageHeader } from '@/components/PageHeader';
import { spacing, radius, background, brand, textColor, borderColor } from '@/constants/Tokens';
import { Text } from '@/components/ui';

interface Row {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}

export default function SettingsScreen() {
  const [haptics, setHaptics] = useState(true);
  const [animations, setAnimations] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [analytics, setAnalytics] = useState(true);

  const groups: { title: string; rows: Row[] }[] = [
    {
      title: 'Experience',
      rows: [
        {
          icon: 'magic',
          label: 'Animations',
          hint: 'Sparklines, pulses, and transitions',
          value: animations,
          onChange: setAnimations,
        },
        {
          icon: 'mobile',
          label: 'Haptic feedback',
          hint: 'Gentle vibrations on interaction',
          value: haptics,
          onChange: setHaptics,
        },
      ],
    },
    {
      title: 'Data',
      rows: [
        {
          icon: 'refresh',
          label: 'Auto-refresh dashboards',
          hint: 'Fetch fresh data when you open a screen',
          value: autoRefresh,
          onChange: setAutoRefresh,
        },
        {
          icon: 'signal',
          label: 'Data saver',
          hint: 'Smaller payloads, fewer chart details',
          value: dataSaver,
          onChange: setDataSaver,
        },
      ],
    },
    {
      title: 'Privacy',
      rows: [
        {
          icon: 'bar-chart',
          label: 'Anonymous usage analytics',
          hint: 'Helps us improve — no personal data',
          value: analytics,
          onChange: setAnalytics,
        },
      ],
    },
  ];

  return (
    <View style={styles.container}>
      <PageHeader title="Settings" subtitle="Personal preferences" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {groups.map((g) => (
          <View key={g.title} style={{ marginBottom: spacing.lg }}>
            <Text variant="overline" color="tertiary" style={styles.sectionTitle}>{g.title}</Text>
            <View style={styles.group}>
              {g.rows.map((row, i) => (
                <View
                  key={row.label}
                  style={[
                    styles.row,
                    i < g.rows.length - 1 && styles.rowBorder,
                  ]}
                >
                  <FontAwesome name={row.icon} size={18} color={brand.amber} style={{ width: 26 }} />
                  <View style={{ flex: 1, marginHorizontal: spacing.md }}>
                    <Text variant="body" color="primary">{row.label}</Text>
                    {row.hint ? (
                      <Text variant="caption" color="tertiary" style={{ marginTop: 2 }}>{row.hint}</Text>
                    ) : null}
                  </View>
                  <Switch
                    value={row.value}
                    onValueChange={row.onChange}
                    trackColor={{ false: 'rgba(255,255,255,0.12)', true: brand.amberBorder }}
                    thumbColor={row.value ? brand.amber : '#888'}
                  />
                </View>
              ))}
            </View>
          </View>
        ))}

        <Text variant="caption" color="muted" style={{ textAlign: 'center', marginTop: spacing.md }}>
          Changes are saved locally to this device.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.primary },
  scroll: { padding: spacing.lg, paddingBottom: spacing.huge },
  sectionTitle: { marginBottom: spacing.xs, letterSpacing: 1.2 },
  group: {
    backgroundColor: background.secondary,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: borderColor.subtle,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    minHeight: 60,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: borderColor.subtle,
  },
});
