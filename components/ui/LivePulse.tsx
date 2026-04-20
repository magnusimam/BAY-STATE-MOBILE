import { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { Text } from './Text';
import { semantic } from '@/constants/Tokens';

interface Props {
  label?: string;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

// "● LIVE" — a breathing green dot with expanding pulse ring.
// Universal signal for "real-time / fresh data" on dashboards.
export function LivePulse({
  label = 'LIVE',
  color = semantic.success,
  size = 8,
  style,
}: Props) {
  const dot = useSharedValue(0);
  const ring = useSharedValue(0);

  useEffect(() => {
    dot.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );
    ring.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.out(Easing.ease) }),
      -1,
      false,
    );
  }, []);

  const dotStyle = useAnimatedStyle(() => ({
    opacity: 0.6 + dot.value * 0.4,
    transform: [{ scale: 0.9 + dot.value * 0.2 }],
  }));
  const ringStyle = useAnimatedStyle(() => ({
    opacity: (1 - ring.value) * 0.7,
    transform: [{ scale: 1 + ring.value * 2.2 }],
  }));

  return (
    <View style={[styles.wrap, style]}>
      <View style={[styles.dotWrap, { width: size * 3, height: size * 3 }]}>
        <Animated.View
          style={[
            styles.ring,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            },
            ringStyle,
          ]}
        />
        <Animated.View
          style={[
            styles.dot,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: color,
            },
            dotStyle,
          ]}
        />
      </View>
      {label ? (
        <Text
          variant="overline"
          style={{ color, marginLeft: 4, letterSpacing: 1.4 }}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center' },
  dotWrap: { alignItems: 'center', justifyContent: 'center' },
  dot: { position: 'absolute' },
  ring: { position: 'absolute' },
});
