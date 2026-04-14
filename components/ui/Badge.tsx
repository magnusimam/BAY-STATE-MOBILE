import React from 'react';
import { View, StyleProp, ViewStyle } from 'react-native';
import { Text } from './Text';
import { radius, spacing } from '@/constants/Tokens';

interface BadgeProps {
  label: string;
  color: string;
  size?: 'sm' | 'md';
  variant?: 'filled' | 'subtle';
  style?: StyleProp<ViewStyle>;
}

export function Badge({ label, color, size = 'md', variant = 'subtle', style }: BadgeProps) {
  const isSubtle = variant === 'subtle';

  return (
    <View style={[
      {
        backgroundColor: isSubtle ? color + '20' : color,
        borderRadius: radius.md,
        paddingHorizontal: size === 'sm' ? spacing.sm : spacing.md,
        paddingVertical: size === 'sm' ? 2 : 4,
        alignSelf: 'flex-start',
      },
      style,
    ]}>
      <Text
        variant={size === 'sm' ? 'caption' : 'labelSm'}
        color={isSubtle ? color : '#fff'}
        weight="700">
        {label}
      </Text>
    </View>
  );
}
