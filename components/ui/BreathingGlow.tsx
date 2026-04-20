import { useEffect } from 'react';
import { StyleSheet, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { brand } from '@/constants/Tokens';

interface Props {
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  period?: number;
}

// Soft circular glow that gently breathes in scale + opacity on a slow loop.
// Meant to sit behind hero banners and accent sections for ambient warmth.
export function BreathingGlow({
  color = brand.amber,
  size = 220,
  style,
  period = 3200,
}: Props) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withRepeat(
      withTiming(1, { duration: period, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [period]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.08 + t.value * 0.15,
    transform: [{ scale: 0.9 + t.value * 0.18 }],
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.glow,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
        style,
        glowStyle,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  glow: {
    position: 'absolute',
  },
});
