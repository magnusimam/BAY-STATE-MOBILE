import React, { useEffect } from 'react';
import { StyleSheet, ViewStyle, StyleProp, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { brand } from '@/constants/Tokens';

interface Props {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  dotCount?: number;
  style?: StyleProp<ViewStyle>;
}

// Content "materializes" — scattered amber dots flash around the bounds,
// then converge inward as the content fades+scales in.
export function MaterializeView({
  children,
  delay = 0,
  duration = 650,
  dotCount = 10,
  style,
}: Props) {
  const contentOp = useSharedValue(0);
  const contentSc = useSharedValue(0.96);

  useEffect(() => {
    contentOp.value = withDelay(delay + 350, withTiming(1, { duration }));
    contentSc.value = withDelay(
      delay + 350,
      withTiming(1, { duration: duration + 150, easing: Easing.out(Easing.cubic) }),
    );
  }, []);

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOp.value,
    transform: [{ scale: contentSc.value }],
  }));

  return (
    <View style={[styles.wrap, style]}>
      {Array.from({ length: dotCount }).map((_, i) => (
        <Dot key={i} index={i} delay={delay} total={dotCount} />
      ))}
      <Animated.View style={contentStyle}>{children}</Animated.View>
    </View>
  );
}

function Dot({ index, delay, total }: { index: number; delay: number; total: number }) {
  const op = useSharedValue(0);
  const sc = useSharedValue(0.4);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  // Deterministic scatter pattern around the bounds, converging toward center.
  const angle = (index / total) * Math.PI * 2 + (index * 0.17);
  const radius = 40 + ((index * 23) % 60);
  const startX = Math.cos(angle) * radius;
  const startY = Math.sin(angle) * radius;
  const dotDelay = delay + index * 45;
  const xPct = 5 + ((index * 97) % 90);
  const yPct = 10 + ((index * 53) % 80);

  useEffect(() => {
    tx.value = startX;
    ty.value = startY;
    op.value = withDelay(
      dotDelay,
      withSequence(
        withTiming(0.9, { duration: 180 }),
        withDelay(120, withTiming(0, { duration: 450 })),
      ),
    );
    sc.value = withDelay(
      dotDelay,
      withSequence(
        withTiming(1.2, { duration: 180 }),
        withTiming(0.2, { duration: 450 }),
      ),
    );
    tx.value = withDelay(dotDelay + 180, withTiming(0, { duration: 500, easing: Easing.in(Easing.quad) }));
    ty.value = withDelay(dotDelay + 180, withTiming(0, { duration: 500, easing: Easing.in(Easing.quad) }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: op.value,
    transform: [
      { translateX: tx.value },
      { translateY: ty.value },
      { scale: sc.value },
    ],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.dot, { left: `${xPct}%`, top: `${yPct}%` }, style]}
    />
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'relative',
  },
  dot: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: brand.amber,
    zIndex: 2,
  },
});
