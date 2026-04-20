import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { PageHeader } from '@/components/PageHeader';
import { spacing, radius, background, brand, textColor, borderColor } from '@/constants/Tokens';
import { Text, Card } from '@/components/ui';

const FAQS = [
  {
    q: 'How often does the data update?',
    a: 'The BAY States dataset is re-ingested from the source Google Sheet every 6 hours. You can also pull-to-refresh on any data screen to fetch the latest cached values.',
  },
  {
    q: 'Which indicators are tracked?',
    a: 'Ten: Youth %, Literacy, Unemployment, Health Access, Agricultural Output, Displacement, Conflict Incidents, Active SMEs, Out-of-school Gap, and Voter Gap. See Methodology for sources.',
  },
  {
    q: 'Can I export the data?',
    a: 'Yes — CSV, JSON, or a pre-formatted PDF report. Open the sidebar and tap Export Data.',
  },
  {
    q: 'What counts as an "anomaly"?',
    a: 'A value changing more than ±30% year-over-year, or falling more than 2σ outside the state mean. Flagged values are reviewed by analysts before publication.',
  },
  {
    q: 'How do I use the AI Analysis chat?',
    a: 'Open the sidebar and tap AI Analysis. Ask questions in natural language about displacement, literacy, trends, anomalies, or compare states. Try the example prompts.',
  },
  {
    q: 'How do I report a data issue?',
    a: 'Use Contact us in the sidebar, or email imammagnus40@gmail.com with the LGA, indicator, year, and the value you believe is wrong.',
  },
];

export default function HelpScreen() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <View style={styles.container}>
      <PageHeader title="Help & FAQ" subtitle="Answers to common questions" />
      <ScrollView contentContainerStyle={styles.scroll}>
        {FAQS.map((f, i) => (
          <Card key={i} level={2} padding="md" style={{ marginBottom: spacing.sm }}>
            <Pressable
              onPress={() => setOpen(open === i ? null : i)}
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Text variant="label" color="primary" style={{ flex: 1 }}>{f.q}</Text>
              <FontAwesome
                name={open === i ? 'chevron-up' : 'chevron-down'}
                size={14}
                color={textColor.tertiary}
              />
            </Pressable>
            {open === i ? (
              <Text variant="body" color="secondary" style={{ marginTop: spacing.sm, lineHeight: 21 }}>
                {f.a}
              </Text>
            ) : null}
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.primary },
  scroll: { padding: spacing.lg, paddingBottom: spacing.huge },
});
