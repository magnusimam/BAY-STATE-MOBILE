import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleProp, ViewStyle } from 'react-native';
import { radius, timing } from '@/constants/Tokens';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radiusSize?: keyof typeof radius;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({ width = '100%', height = 20, radiusSize = 'sm', style }: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.8,
          duration: timing.slower,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: timing.slower,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height: height as any,
          borderRadius: radius[radiusSize],
          backgroundColor: 'rgba(255,255,255,0.08)',
          opacity,
        },
        style,
      ]}
    />
  );
}

// Preset: KPI card skeleton
export function SkeletonKPI() {
  return (
    <View style={{
      flex: 1, margin: 4, padding: 16,
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    }}>
      <Skeleton width="60%" height={12} style={{ marginBottom: 8 }} />
      <Skeleton width="80%" height={24} style={{ marginBottom: 6 }} />
      <Skeleton width="40%" height={10} />
    </View>
  );
}

// Preset: List card skeleton
export function SkeletonRow() {
  return (
    <View style={{
      marginHorizontal: 16, marginBottom: 10, padding: 14,
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: radius.lg, borderWidth: 1, borderColor: 'rgba(255,255,255,0.06)',
    }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <Skeleton width="40%" height={16} />
        <Skeleton width={60} height={16} radiusSize="md" />
      </View>
      <Skeleton width="30%" height={11} style={{ marginBottom: 10 }} />
      <View style={{ flexDirection: 'row', gap: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} width="24%" height={40} radiusSize="sm" />
        ))}
      </View>
    </View>
  );
}
