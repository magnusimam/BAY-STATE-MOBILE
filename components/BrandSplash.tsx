import { useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text as RNText } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Rect } from 'react-native-svg';
import { brand, background, textColor } from '@/constants/Tokens';

const { height: SH } = Dimensions.get('window');

// Deterministic particle ring (no re-randomization across renders)
const PARTICLE_COUNT = 24;
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  const angle = (i / PARTICLE_COUNT) * Math.PI * 2 + ((i * 17) % 7) * 0.1;
  const dist = 170 + ((i * 53) % 180);
  return {
    id: i,
    startX: Math.cos(angle) * dist,
    startY: Math.sin(angle) * dist,
    size: 3 + ((i * 7) % 3),
    delay: 50 + ((i * 37) % 420),
  };
});

export function BrandSplash({ onDone }: { onDone?: () => void }) {
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.35);
  const glowPulse = useSharedValue(0);
  const tagOpacity = useSharedValue(0);
  const r1 = useSharedValue(0);
  const r2 = useSharedValue(0);
  const r3 = useSharedValue(0);
  const d1 = useSharedValue(0);
  const d2 = useSharedValue(0);
  const d3 = useSharedValue(0);
  const rootOpacity = useSharedValue(1);

  useEffect(() => {
    logoOpacity.value = withDelay(450, withTiming(1, { duration: 400 }));
    logoScale.value = withDelay(
      450,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.back(1.5)) }),
    );

    glowPulse.value = withDelay(
      700,
      withRepeat(withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }), -1, true),
    );

    tagOpacity.value = withDelay(1300, withTiming(1, { duration: 600 }));

    r1.value = withDelay(900, withRepeat(withTiming(1, { duration: 2400 }), -1, false));
    r2.value = withDelay(1500, withRepeat(withTiming(1, { duration: 2400 }), -1, false));
    r3.value = withDelay(2100, withRepeat(withTiming(1, { duration: 2400 }), -1, false));

    const pulseDot = (sv: typeof d1, startDelay: number) => {
      sv.value = withDelay(
        startDelay,
        withRepeat(withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }), -1, true),
      );
    };
    pulseDot(d1, 1400);
    pulseDot(d2, 1550);
    pulseDot(d3, 1700);

    const t = setTimeout(() => {
      rootOpacity.value = withTiming(0, { duration: 420 }, (finished) => {
        if (finished && onDone) runOnJS(onDone)();
      });
    }, 2800);
    return () => clearTimeout(t);
  }, []);

  const rootStyle = useAnimatedStyle(() => ({ opacity: rootOpacity.value }));
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));
  const glowOuterStyle = useAnimatedStyle(() => ({
    opacity: 0.12 + glowPulse.value * 0.12,
    transform: [{ scale: 0.95 + glowPulse.value * 0.2 }],
  }));
  const glowInnerStyle = useAnimatedStyle(() => ({
    opacity: 0.2 + glowPulse.value * 0.2,
    transform: [{ scale: 0.9 + glowPulse.value * 0.15 }],
  }));
  const tagStyle = useAnimatedStyle(() => ({
    opacity: tagOpacity.value,
    transform: [{ translateY: (1 - tagOpacity.value) * 10 }],
  }));
  const r1Style = useAnimatedStyle(() => ({
    opacity: (1 - r1.value) * 0.55,
    transform: [{ scale: 0.6 + r1.value * 2.5 }],
  }));
  const r2Style = useAnimatedStyle(() => ({
    opacity: (1 - r2.value) * 0.55,
    transform: [{ scale: 0.6 + r2.value * 2.5 }],
  }));
  const r3Style = useAnimatedStyle(() => ({
    opacity: (1 - r3.value) * 0.55,
    transform: [{ scale: 0.6 + r3.value * 2.5 }],
  }));
  const d1Style = useAnimatedStyle(() => ({
    opacity: 0.4 + d1.value * 0.6,
    transform: [{ scale: 0.7 + d1.value * 0.4 }],
  }));
  const d2Style = useAnimatedStyle(() => ({
    opacity: 0.4 + d2.value * 0.6,
    transform: [{ scale: 0.7 + d2.value * 0.4 }],
  }));
  const d3Style = useAnimatedStyle(() => ({
    opacity: 0.4 + d3.value * 0.6,
    transform: [{ scale: 0.7 + d3.value * 0.4 }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.root, rootStyle]} pointerEvents="none">
      <LinearGradient
        colors={['#1a1208', '#0a0a0f', '#0a0a0f']}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {PARTICLES.map((p) => (
        <Particle key={p.id} {...p} />
      ))}

      <Animated.View style={[styles.ring, r1Style]} />
      <Animated.View style={[styles.ring, r2Style]} />
      <Animated.View style={[styles.ring, r3Style]} />

      <Animated.View style={[styles.glowOuter, glowOuterStyle]} />
      <Animated.View style={[styles.glowInner, glowInnerStyle]} />

      <Animated.View style={[styles.logo, logoStyle]}>
        <Svg width={150} height={150} viewBox="0 0 150 150">
          <Rect x="28" y="22" width="20" height="106" rx="5" fill="#ffffff" />
          <Rect x="102" y="22" width="20" height="106" rx="5" fill="#ffffff" />
          <Path
            d="M 48 78 L 60 78 L 66 62 L 72 94 L 78 56 L 84 78 L 102 78"
            stroke="#ffffff"
            strokeWidth={6}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>

        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, d1Style]} />
          <Animated.View style={[styles.dot, d2Style]} />
          <Animated.View style={[styles.dot, d3Style]} />
        </View>
      </Animated.View>

      <Animated.View style={[styles.tagWrap, tagStyle]}>
        <RNText style={styles.brand}>HUMAID</RNText>
        <RNText style={styles.tag}>BAY States · Data Intelligence</RNText>
      </Animated.View>
    </Animated.View>
  );
}

function Particle({
  startX,
  startY,
  size,
  delay,
}: {
  startX: number;
  startY: number;
  size: number;
  delay: number;
}) {
  const tx = useSharedValue(startX);
  const ty = useSharedValue(startY);
  const op = useSharedValue(0);
  const sc = useSharedValue(1);

  useEffect(() => {
    op.value = withDelay(delay, withTiming(1, { duration: 280 }));
    tx.value = withDelay(
      delay,
      withTiming(0, { duration: 1100, easing: Easing.in(Easing.quad) }),
    );
    ty.value = withDelay(
      delay,
      withTiming(0, { duration: 1100, easing: Easing.in(Easing.quad) }),
    );
    sc.value = withDelay(delay + 850, withTiming(0, { duration: 280 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: op.value * (sc.value > 0.05 ? 1 : 0),
    transform: [{ translateX: tx.value }, { translateY: ty.value }, { scale: sc.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        { width: size, height: size, borderRadius: size / 2 },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: background.primary,
    zIndex: 10000,
  },
  logo: {
    width: 150,
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotsRow: {
    position: 'absolute',
    bottom: 14,
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: brand.amber,
  },
  glowOuter: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: brand.amber,
  },
  glowInner: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: brand.amber,
  },
  ring: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 1.5,
    borderColor: brand.amber,
  },
  particle: {
    position: 'absolute',
    backgroundColor: brand.amber,
  },
  tagWrap: {
    position: 'absolute',
    bottom: SH * 0.17,
    alignItems: 'center',
  },
  brand: {
    color: '#ffffff',
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 8,
  },
  tag: {
    color: textColor.tertiary,
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2.5,
    marginTop: 8,
    textTransform: 'uppercase',
  },
});
