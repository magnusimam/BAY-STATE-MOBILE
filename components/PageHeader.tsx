import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { spacing, background, textColor, borderColor } from '@/constants/Tokens';
import { Text } from '@/components/ui/Text';

interface Props {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
}

export function PageHeader({ title, subtitle, right }: Props) {
  const router = useRouter();
  const canGoBack = router.canGoBack();
  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={() => {
          Haptics.selectionAsync().catch(() => {});
          if (canGoBack) router.back();
          else router.replace('/(tabs)');
        }}
        hitSlop={12}
        style={({ pressed }) => [styles.back, pressed && { opacity: 0.5 }]}
      >
        <FontAwesome name="angle-left" size={26} color={textColor.primary} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text variant="h3" color="primary" numberOfLines={1}>{title}</Text>
        {subtitle ? (
          <Text variant="caption" color="tertiary" numberOfLines={1} style={{ marginTop: 2 }}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 56,
    paddingBottom: spacing.md,
    paddingHorizontal: spacing.md,
    backgroundColor: background.primary,
    borderBottomWidth: 1,
    borderBottomColor: borderColor.subtle,
  },
  back: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
  },
});
