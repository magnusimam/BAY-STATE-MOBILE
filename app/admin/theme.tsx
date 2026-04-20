import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { PageHeader } from '@/components/PageHeader';
import { spacing, radius, background, brand, textColor, borderColor } from '@/constants/Tokens';
import { Text, Card, Button } from '@/components/ui';

const ACCENTS = [
  { id: 'amber', color: '#f4b942', label: 'HUMAID Amber' },
  { id: 'cyan', color: '#6ec6e8', label: 'Aqua' },
  { id: 'violet', color: '#8b5cf6', label: 'Indigo' },
  { id: 'emerald', color: '#10b981', label: 'Forest' },
  { id: 'rose', color: '#f43f5e', label: 'Rose' },
];

const SECTIONS = [
  { id: 'hero', label: 'Hero banner', on: true },
  { id: 'indicators', label: 'Live indicators strip', on: true },
  { id: 'states', label: 'BAY States cards', on: true },
  { id: 'improvers', label: 'Top improvers', on: true },
  { id: 'methodology', label: 'Methodology', on: false },
  { id: 'quotes', label: 'Quotes from analysts', on: false },
];

export default function AdminThemeScreen() {
  const [accent, setAccent] = useState('amber');
  const [sections, setSections] = useState(SECTIONS);

  const toggle = (id: string) =>
    setSections((s) => s.map((sec) => (sec.id === id ? { ...sec, on: !sec.on } : sec)));

  return (
    <View style={styles.container}>
      <PageHeader title="Theme & Sections" subtitle="Customize the web landing page" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text variant="overline" color="tertiary" style={styles.sectionTitle}>Accent color</Text>
        <View style={styles.swatches}>
          {ACCENTS.map((a) => (
            <Pressable
              key={a.id}
              onPress={() => setAccent(a.id)}
              style={({ pressed }) => [pressed && { opacity: 0.7 }]}
            >
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: a.color, borderColor: accent === a.id ? '#fff' : 'transparent' },
                ]}
              >
                {accent === a.id ? (
                  <FontAwesome name="check" size={16} color="#fff" />
                ) : null}
              </View>
              <Text variant="caption" color="tertiary" style={{ textAlign: 'center', marginTop: 4 }}>
                {a.label}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text variant="overline" color="tertiary" style={styles.sectionTitle}>Visible sections</Text>
        <Card level={2} padding="sm" style={{ marginBottom: spacing.lg }}>
          {sections.map((sec, i) => (
            <Pressable
              key={sec.id}
              onPress={() => toggle(sec.id)}
              style={[
                styles.sectionRow,
                i < sections.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor.subtle },
              ]}
            >
              <FontAwesome
                name={sec.on ? 'check-square' : 'square-o'}
                size={18}
                color={sec.on ? brand.amber : textColor.muted}
                style={{ width: 26 }}
              />
              <Text variant="body" color="primary" style={{ flex: 1, marginLeft: spacing.sm }}>
                {sec.label}
              </Text>
              {sec.on ? (
                <Text variant="overline" style={{ color: brand.amber }}>Live</Text>
              ) : (
                <Text variant="overline" color="muted">Hidden</Text>
              )}
            </Pressable>
          ))}
        </Card>

        <Button
          label="Publish theme"
          variant="primary"
          onPress={() => Alert.alert('Theme published', 'Your accent and section changes are live on the public site.')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.primary },
  scroll: { padding: spacing.lg, paddingBottom: spacing.huge },
  sectionTitle: { marginBottom: spacing.sm, letterSpacing: 1.2, marginTop: spacing.md },
  swatches: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.lg },
  swatch: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
});
