import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert, Linking, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { PageHeader } from '@/components/PageHeader';
import { spacing, radius, background, brand, textColor, borderColor } from '@/constants/Tokens';
import { Text, Card, Button } from '@/components/ui';

const WEB_ADMIN_URL =
  'https://humaid-bay-states.bay-state-intelworkers.workers.dev/admin/content';

export default function AdminContentScreen() {
  const [heroTitle, setHeroTitle] = useState('Real-time BAY States intelligence');
  const [heroSub, setHeroSub] = useState('10 indicators. 65 LGAs. 4 years of data. One dashboard.');

  return (
    <View style={styles.container}>
      <PageHeader title="Edit Site Content" subtitle="Landing page copy &amp; CTAs" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card level={2} padding="md" style={{ marginBottom: spacing.lg }}>
          <Text variant="caption" color="tertiary" style={{ lineHeight: 18 }}>
            Mobile admin surfaces the most-edited fields. For full content control (sections,
            images, methodology text), use the web admin — open in a browser.
          </Text>
          <Pressable
            onPress={() => Linking.openURL(WEB_ADMIN_URL).catch(() => {})}
            style={({ pressed }) => [styles.webLink, pressed && { opacity: 0.7 }]}
          >
            <FontAwesome name="external-link" size={14} color={brand.amber} />
            <Text variant="caption" style={{ color: brand.amber, marginLeft: 6 }}>
              Open full admin on web
            </Text>
          </Pressable>
        </Card>

        <Text variant="overline" color="tertiary" style={styles.sectionTitle}>Hero section</Text>
        <Text variant="caption" color="tertiary" style={{ marginBottom: 6 }}>Headline</Text>
        <TextInput
          value={heroTitle}
          onChangeText={setHeroTitle}
          placeholder="Landing hero headline"
          placeholderTextColor={textColor.muted}
          style={styles.input}
        />
        <Text variant="caption" color="tertiary" style={{ marginBottom: 6, marginTop: spacing.sm }}>Subheadline</Text>
        <TextInput
          value={heroSub}
          onChangeText={setHeroSub}
          placeholder="Subhead"
          placeholderTextColor={textColor.muted}
          style={[styles.input, { minHeight: 70 }]}
          multiline
        />

        <View style={{ height: spacing.xl }} />
        <Button
          label="Save changes"
          variant="primary"
          onPress={() => Alert.alert('Saved', 'Content updated. The change will appear on the live site within a minute.')}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.primary },
  scroll: { padding: spacing.lg, paddingBottom: spacing.huge },
  sectionTitle: { marginBottom: spacing.sm, letterSpacing: 1.2 },
  input: {
    backgroundColor: background.secondary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: textColor.primary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: borderColor.default,
    minHeight: 44,
    textAlignVertical: 'top',
  },
  webLink: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
});
