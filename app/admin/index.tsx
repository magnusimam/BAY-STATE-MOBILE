import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { PageHeader } from '@/components/PageHeader';
import { useAuth } from '@/lib/auth-context';
import { ADMIN_EMAILS } from '@/constants/Config';
import { spacing, radius, background, brand, textColor, borderColor, semantic } from '@/constants/Tokens';
import { Text, Card, Badge, EmptyState } from '@/components/ui';

export default function AdminIndexScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const isAdmin = !!(user?.email && ADMIN_EMAILS.includes(user.email));

  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <PageHeader title="Admin" />
        <View style={{ padding: spacing.lg }}>
          <EmptyState
            icon="lock"
            title="Admin access required"
            description="Only designated admin accounts can access this panel. Sign in with an admin email to continue."
          />
        </View>
      </View>
    );
  }

  const go = (to: string) => {
    Haptics.selectionAsync().catch(() => {});
    router.push(to as any);
  };

  const tiles = [
    { label: 'Edit Site Content', hint: 'Landing page copy, indicators, CTAs', icon: 'pencil-square-o' as const, to: '/admin/content' },
    { label: 'Theme & Sections', hint: 'Colors, typography, page sections', icon: 'paint-brush' as const, to: '/admin/theme' },
    { label: 'Manual Sync', hint: 'Force-refresh the dataset from source', icon: 'refresh' as const, to: '/admin' },
    { label: 'Audit Log', hint: 'Recent admin actions', icon: 'history' as const, to: '/admin' },
  ];

  return (
    <View style={styles.container}>
      <PageHeader title="Admin" subtitle="Manage HUMAID — signed in as admin" right={<Badge label="Admin" color={brand.amber} size="sm" />} />
      <ScrollView contentContainerStyle={styles.scroll}>
        {tiles.map((t) => (
          <Pressable
            key={t.label}
            onPress={() => go(t.to)}
            style={({ pressed }) => [pressed && { opacity: 0.85 }]}
          >
            <Card level={2} padding="md" style={{ marginBottom: spacing.sm }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={styles.iconWrap}>
                  <FontAwesome name={t.icon} size={20} color={brand.amber} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="label" color="primary">{t.label}</Text>
                  <Text variant="caption" color="tertiary" style={{ marginTop: 2 }}>{t.hint}</Text>
                </View>
                <FontAwesome name="angle-right" size={18} color={textColor.muted} />
              </View>
            </Card>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: background.primary },
  scroll: { padding: spacing.lg, paddingBottom: spacing.huge },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.amberBg,
    borderWidth: 1,
    borderColor: brand.amberBorder,
  },
});
