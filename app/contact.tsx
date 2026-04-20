import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TextInput, Alert, Linking, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { PageHeader } from '@/components/PageHeader';
import { spacing, radius, background, brand, textColor, borderColor } from '@/constants/Tokens';
import { Text, Card, Button } from '@/components/ui';

const SUPPORT_EMAIL = 'imammagnus40@gmail.com';

export default function ContactScreen() {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const submit = () => {
    const params = `subject=${encodeURIComponent(subject || 'HUMAID Feedback')}&body=${encodeURIComponent(body)}`;
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?${params}`).catch(() => {
      Alert.alert('Email app not available', `Please send your message to ${SUPPORT_EMAIL} manually.`);
    });
  };

  return (
    <View style={styles.container}>
      <PageHeader title="Contact us" subtitle="We read every message" />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Card level={2} padding="lg" style={{ marginBottom: spacing.lg }} accentColor={brand.amber} accentPosition="left">
          <Text variant="h4" color="primary">Get in touch</Text>
          <Text variant="body" color="secondary" style={{ marginTop: spacing.xs }}>
            Reach the HUMAID team at{' '}
            <Text variant="body" style={{ color: brand.amber }}>{SUPPORT_EMAIL}</Text>
            {' '}— typical response within 48 hours.
          </Text>
        </Card>

        <Pressable
          onPress={() => Linking.openURL(`mailto:${SUPPORT_EMAIL}`)}
          style={({ pressed }) => [styles.quickRow, pressed && { opacity: 0.7 }]}
        >
          <FontAwesome name="envelope" size={18} color={brand.amber} style={{ width: 26 }} />
          <Text variant="body" color="primary" style={{ flex: 1, marginHorizontal: spacing.md }}>
            Email directly
          </Text>
          <FontAwesome name="angle-right" size={18} color={textColor.muted} />
        </Pressable>

        <Text variant="overline" color="tertiary" style={styles.sectionTitle}>Send us a message</Text>
        <TextInput
          value={subject}
          onChangeText={setSubject}
          placeholder="Subject"
          placeholderTextColor={textColor.muted}
          style={styles.input}
        />
        <TextInput
          value={body}
          onChangeText={setBody}
          placeholder="Your message…"
          placeholderTextColor={textColor.muted}
          style={[styles.input, styles.textarea]}
          multiline
        />
        <Button label="Send via email" onPress={submit} variant="primary" />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.primary },
  scroll: { padding: spacing.lg, paddingBottom: spacing.huge },
  sectionTitle: { marginTop: spacing.md, marginBottom: spacing.sm, letterSpacing: 1.2 },
  input: {
    backgroundColor: background.secondary,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    color: textColor.primary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: borderColor.default,
    marginBottom: spacing.sm,
    minHeight: 44,
  },
  textarea: { minHeight: 140, textAlignVertical: 'top' },
  quickRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: background.secondary,
    borderWidth: 1,
    borderColor: borderColor.subtle,
    marginBottom: spacing.md,
  },
});
