import React from 'react';
import { View, ViewStyle, StyleProp, Pressable } from 'react-native';
import { elevation, radius, spacing } from '@/constants/Tokens';
import * as Haptics from 'expo-haptics';

interface CardProps {
  children: React.ReactNode;
  level?: 1 | 2 | 3 | 4;
  padding?: keyof typeof spacing;
  radiusSize?: keyof typeof radius;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  accentColor?: string;
  accentPosition?: 'top' | 'left';
}

export function Card({
  children,
  level = 2,
  padding = 'lg',
  radiusSize = 'lg',
  style,
  onPress,
  accentColor,
  accentPosition = 'top',
}: CardProps) {
  const levelStyle = elevation[`L${level}` as keyof typeof elevation];

  const cardStyle: StyleProp<ViewStyle> = [
    levelStyle,
    {
      borderRadius: radius[radiusSize],
      padding: spacing[padding],
      overflow: 'hidden',
    },
    accentColor && accentPosition === 'left' && { borderLeftWidth: 4, borderLeftColor: accentColor },
    style,
  ];

  const content = (
    <>
      {accentColor && accentPosition === 'top' && (
        <View style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 3, backgroundColor: accentColor,
        }} />
      )}
      {children}
    </>
  );

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [
          cardStyle,
          pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
        ]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onPress();
        }}>
        {content}
      </Pressable>
    );
  }

  return <View style={cardStyle}>{content}</View>;
}
