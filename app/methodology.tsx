import React from 'react';
import { View, ScrollView, StyleSheet, Linking, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { PageHeader } from '@/components/PageHeader';
import { spacing, radius, background, brand, textColor, borderColor } from '@/constants/Tokens';
import { Text, Card, Badge } from '@/components/ui';

const INDICATORS = [
  { name: 'Youth %', source: 'NPC 2023 projections', unit: 'percent' },
  { name: 'Literacy', source: 'UNICEF MICS 6 + NBS', unit: 'percent' },
  { name: 'Unemployment', source: 'NBS Q4 Labor Force Survey', unit: 'percent' },
  { name: 'Health Access', source: 'NPHCDA facility registry', unit: 'composite index' },
  { name: 'Agricultural Output', source: 'FMARD + NAERLS', unit: 'tonnes' },
  { name: 'Displacement', source: 'IOM DTM Round 45', unit: 'persons' },
  { name: 'Conflict Incidents', source: 'ACLED Nigeria dataset', unit: 'count' },
  { name: 'Active SMEs', source: 'SMEDAN registration roll', unit: 'count' },
  { name: 'Out-of-school Gap', source: 'UBEC census', unit: 'percent' },
  { name: 'Voter Gap', source: 'INEC registration rolls', unit: 'percent' },
];

export default function MethodologyScreen() {
  return (
    <View style={styles.container}>
      <PageHeader title="Methodology" subtitle="How we collect and score BAY States data" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card level={2} padding="lg" style={styles.intro} accentColor={brand.amber} accentPosition="left">
          <Text variant="h4" color="primary">Data sources &amp; cadence</Text>
          <Text variant="body" color="secondary" style={{ marginTop: spacing.xs }}>
            HUMAID aggregates 10 indicators across Borno, Adamawa, and Yobe — 65 LGAs, 2022 → 2025.
            The raw feed is a curated Google Sheet (BAY Sub-Regional Youth Peace &amp; Security Tracker),
            which we ingest every 6 hours into a Cloudflare D1 database and cache on the edge (5-minute TTL).
          </Text>
        </Card>

        <Text variant="overline" color="tertiary" style={styles.sectionTitle}>Indicators</Text>
        {INDICATORS.map((ind) => (
          <Card key={ind.name} level={2} padding="md" style={{ marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text variant="h4" color="primary" style={{ flex: 1 }}>{ind.name}</Text>
              <Badge label={ind.unit} color={brand.amber} size="sm" />
            </View>
            <Text variant="caption" color="tertiary" style={{ marginTop: 4 }}>
              Source: {ind.source}
            </Text>
          </Card>
        ))}

        <Text variant="overline" color="tertiary" style={styles.sectionTitle}>Scoring &amp; quality</Text>
        <Card level={2} padding="md" style={{ marginBottom: spacing.sm }}>
          <Text variant="body" color="secondary">
            Each indicator is normalized to a 0–100 score per LGA per year. Composite risk zones
            are derived as a weighted blend (Displacement 25%, Conflict 25%, Unemployment 20%,
            Literacy 15%, Health 15%).
          </Text>
        </Card>
        <Card level={2} padding="md" style={{ marginBottom: spacing.sm }}>
          <Text variant="body" color="secondary">
            We flag values as anomalies when year-over-year change exceeds ±30%, or when a value
            falls more than 2σ outside the state mean. Analysts are asked to verify flagged values
            before publication.
          </Text>
        </Card>

        <Pressable
          onPress={() =>
            Linking.openURL('https://humaid-bay-states.bay-state-intelworkers.workers.dev/').catch(() => {})
          }
          style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.7 }]}
        >
          <FontAwesome name="external-link" size={16} color={brand.amber} />
          <Text variant="body" style={{ color: brand.amber, marginLeft: spacing.sm }}>
            View the live web dashboard
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.primary },
  scroll: { padding: spacing.lg, paddingBottom: spacing.huge },
  intro: { marginBottom: spacing.lg },
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.sm, letterSpacing: 1.2 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.amberBorder,
    backgroundColor: brand.amberBg,
  },
});
