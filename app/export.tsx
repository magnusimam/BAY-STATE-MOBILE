import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { PageHeader } from '@/components/PageHeader';
import { spacing, radius, background, brand, textColor, borderColor, semantic } from '@/constants/Tokens';
import { Text, Card, Badge, Button } from '@/components/ui';

const FORMATS = [
  { id: 'csv', label: 'CSV', hint: 'Comma-separated values for spreadsheets', icon: 'file-excel-o' as const },
  { id: 'json', label: 'JSON', hint: 'Raw dataset for developers', icon: 'file-code-o' as const },
  { id: 'pdf', label: 'PDF Report', hint: 'Pre-formatted policy brief (3 pages)', icon: 'file-pdf-o' as const },
];

const SCOPES = [
  { id: 'all', label: 'All indicators, all LGAs', count: '650 rows' },
  { id: 'borno', label: 'Borno only', count: '280 rows' },
  { id: 'adamawa', label: 'Adamawa only', count: '210 rows' },
  { id: 'yobe', label: 'Yobe only', count: '160 rows' },
  { id: 'anomalies', label: 'Anomalies only (>30% shift)', count: '~30 rows' },
];

export default function ExportScreen() {
  const [fmt, setFmt] = useState('csv');
  const [scope, setScope] = useState('all');

  return (
    <View style={styles.container}>
      <PageHeader title="Export Data" subtitle="Download the BAY States dataset" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="overline" color="tertiary" style={styles.sectionTitle}>Format</Text>
        {FORMATS.map((f) => (
          <Pressable
            key={f.id}
            onPress={() => setFmt(f.id)}
            style={({ pressed }) => [
              styles.option,
              fmt === f.id && styles.optionActive,
              pressed && { opacity: 0.8 },
            ]}
          >
            <FontAwesome
              name={f.icon}
              size={22}
              color={fmt === f.id ? brand.amber : textColor.tertiary}
              style={{ width: 30 }}
            />
            <View style={{ flex: 1 }}>
              <Text variant="label" color="primary">{f.label}</Text>
              <Text variant="caption" color="tertiary" style={{ marginTop: 1 }}>{f.hint}</Text>
            </View>
            {fmt === f.id ? (
              <FontAwesome name="check-circle" size={18} color={brand.amber} />
            ) : (
              <View style={styles.radio} />
            )}
          </Pressable>
        ))}

        <Text variant="overline" color="tertiary" style={styles.sectionTitle}>Scope</Text>
        {SCOPES.map((s) => (
          <Pressable
            key={s.id}
            onPress={() => setScope(s.id)}
            style={({ pressed }) => [
              styles.option,
              scope === s.id && styles.optionActive,
              pressed && { opacity: 0.8 },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text variant="label" color="primary">{s.label}</Text>
              <Text variant="caption" color="tertiary" style={{ marginTop: 1 }}>~{s.count}</Text>
            </View>
            {scope === s.id ? (
              <FontAwesome name="check-circle" size={18} color={brand.amber} />
            ) : (
              <View style={styles.radio} />
            )}
          </Pressable>
        ))}

        <View style={{ height: spacing.xl }} />
        <Button
          label="Generate & Download"
          variant="primary"
          onPress={() =>
            Alert.alert(
              'Export queued',
              `A ${fmt.toUpperCase()} file for "${scope}" is being prepared. We\'ll email a download link to your account when it\'s ready.`,
            )
          }
        />
        <Text variant="caption" color="muted" style={{ textAlign: 'center', marginTop: spacing.md }}>
          Exports are watermarked with your account and a timestamp for audit purposes.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.primary },
  scroll: { padding: spacing.lg, paddingBottom: spacing.huge },
  sectionTitle: { marginTop: spacing.md, marginBottom: spacing.sm, letterSpacing: 1.2 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    marginBottom: spacing.sm,
    backgroundColor: background.secondary,
    borderWidth: 1,
    borderColor: borderColor.subtle,
  },
  optionActive: {
    borderColor: brand.amber,
    backgroundColor: brand.amberBg,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: borderColor.strong,
  },
});
