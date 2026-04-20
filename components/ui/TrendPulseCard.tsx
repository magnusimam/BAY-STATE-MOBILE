import { useEffect } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface Props {
  direction: 'up' | 'down' | 'neutral';
  children: React.ReactNode;
  intensity?: number;
  style?: StyleProp<ViewStyle>;
}

// A card-shaped backdrop that gently throbs green (up), red (down), or
// nothing (neutral). Sits behind a Card to give it a living tint.
export function TrendPulseCard({ direction, children, intensity = 0.15, style }: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    if (direction === 'neutral') return;
    t.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [direction]);

  const color = direction === 'up' ? '#22c55e' : direction === 'down' ? '#ef4444' : 'transparent';

  const tintStyle = useAnimatedStyle(() => ({
    opacity: direction === 'neutral' ? 0 : 0.04 + t.value * intensity,
  }));

  return (
    <Animated.View style={[styles.wrap, style]}>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: color, borderRadius: 14 }, tintStyle]}
      />
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'relative' },
});
