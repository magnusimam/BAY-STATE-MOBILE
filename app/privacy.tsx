import React from 'react';
import { View, StyleSheet, ScrollView, Linking, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { PageHeader } from '@/components/PageHeader';
import { spacing, radius, background, brand, textColor, borderColor } from '@/constants/Tokens';
import { Text, Card } from '@/components/ui';

const WEB_PRIVACY_URL =
  'https://humaid-bay-states.bay-state-intelworkers.workers.dev/privacy';

export default function PrivacyScreen() {
  return (
    <View style={styles.container}>
      <PageHeader title="Privacy Policy" subtitle="How we handle your data" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card level={2} padding="lg" accentColor={brand.amber} accentPosition="left">
          <Text variant="h4" color="primary">Summary</Text>
          <Text variant="body" color="secondary" style={{ marginTop: spacing.xs, lineHeight: 21 }}>
            HUMAID collects the minimum required to operate the app: your email and display name
            via Firebase Authentication. We don&apos;t track location, contacts, or media. We don&apos;t
            sell data. The BAY States indicators shown in the app come from public sources, not from
            individual users.
          </Text>
        </Card>

        <Text variant="overline" color="tertiary" style={styles.sectionTitle}>What we collect</Text>
        <Bullet text="Email address, display name, and sign-in provider (Firebase Authentication)." />
        <Bullet text="Account creation + last sign-in timestamps." />
        <Bullet text="Standard request logs (IP, user agent) retained ~30 days by hosting providers." />

        <Text variant="overline" color="tertiary" style={styles.sectionTitle}>What we don&apos;t collect</Text>
        <Bullet text="Precise location." />
        <Bullet text="Contacts, photos, microphone, or health data." />
        <Bullet text="Advertising identifiers — there are no ads." />

        <Text variant="overline" color="tertiary" style={styles.sectionTitle}>Your rights</Text>
        <Bullet text="Access — ask us what we hold about you." />
        <Bullet text="Correction — ask us to fix inaccurate data." />
        <Bullet text="Deletion — ask us to delete your account." />
        <Bullet text="Email imammagnus40@gmail.com to exercise any of these. We respond within 30 days." />

        <Pressable
          onPress={() => Linking.openURL(WEB_PRIVACY_URL).catch(() => {})}
          style={({ pressed }) => [styles.linkRow, pressed && { opacity: 0.7 }]}
        >
          <FontAwesome name="external-link" size={16} color={brand.amber} />
          <Text variant="body" style={{ color: brand.amber, marginLeft: spacing.sm }}>
            Read the full policy
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bullet}>
      <View style={styles.bulletDot} />
      <Text variant="body" color="secondary" style={{ flex: 1, lineHeight: 21 }}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.primary },
  scroll: { padding: spacing.lg, paddingBottom: spacing.huge },
  sectionTitle: { marginTop: spacing.lg, marginBottom: spacing.sm, letterSpacing: 1.2 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, marginBottom: spacing.sm },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: brand.amber, marginTop: 8 },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginTop: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: brand.amberBorder,
    backgroundColor: brand.amberBg,
  },
});
