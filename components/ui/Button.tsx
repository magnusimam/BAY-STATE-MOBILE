import React from 'react';
import { Pressable, ActivityIndicator, View, StyleProp, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Text } from './Text';
import { radius, spacing, touch, brand, elevation } from '@/constants/Tokens';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  style,
  icon,
}: ButtonProps) {
  const heights = { sm: 40, md: 48, lg: 52 };
  const height = heights[size];

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onPress();
  };

  const isDisabled = disabled || loading;

  if (variant === 'primary') {
    return (
      <Pressable onPress={handlePress} disabled={isDisabled}
        style={({ pressed }) => [
          {
            height,
            borderRadius: radius.lg,
            overflow: 'hidden',
            alignSelf: fullWidth ? 'stretch' : 'flex-start',
            opacity: isDisabled ? 0.5 : 1,
            transform: [{ scale: pressed ? 0.97 : 1 }],
            shadowColor: brand.amber,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.25,
            shadowRadius: 8,
            elevation: 4,
          },
          style,
        ]}>
        <LinearGradient
          colors={[brand.amberLight, brand.amber, brand.amberDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            flexDirection: 'row',
            gap: spacing.sm,
            paddingHorizontal: spacing.xxl,
          }}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              {icon}
              <Text variant="h4" color="#fff">{label}</Text>
            </>
          )}
        </LinearGradient>
      </Pressable>
    );
  }

  const bgStyles = {
    secondary: elevation.L2,
    ghost: elevation.L0,
    danger: { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)', borderWidth: 1.5 },
  };

  return (
    <Pressable onPress={handlePress} disabled={isDisabled}
      style={({ pressed }) => [
        {
          height,
          borderRadius: radius.lg,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'row',
          gap: spacing.sm,
          paddingHorizontal: spacing.xxl,
          opacity: isDisabled ? 0.5 : pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.97 : 1 }],
        },
        bgStyles[variant as 'secondary' | 'ghost' | 'danger'],
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={variant === 'danger' ? '#ef4444' : '#f5f5f5'} />
      ) : (
        <>
          {icon}
          <Text variant="h4" color={variant === 'danger' ? '#ef4444' : 'primary'}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}
