import React from 'react';
import { View } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Text } from './Text';
import { Button } from './Button';
import { spacing, textColor, brand } from '@/constants/Tokens';

interface EmptyStateProps {
  icon?: React.ComponentProps<typeof FontAwesome>['name'];
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon = 'inbox',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={{
      alignItems: 'center',
      paddingVertical: spacing.huge,
      paddingHorizontal: spacing.xxl,
    }}>
      <View style={{
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: brand.amberBg,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
      }}>
        <FontAwesome name={icon} size={28} color={brand.amber} />
      </View>
      <Text variant="h3" color="primary" style={{ marginBottom: spacing.sm, textAlign: 'center' }}>
        {title}
      </Text>
      {description && (
        <Text variant="bodySm" color="tertiary" style={{ textAlign: 'center', lineHeight: 20, maxWidth: 280 }}>
          {description}
        </Text>
      )}
      {actionLabel && onAction && (
        <View style={{ marginTop: spacing.xl }}>
          <Button label={actionLabel} onPress={onAction} variant="secondary" size="md" />
        </View>
      )}
    </View>
  );
}
