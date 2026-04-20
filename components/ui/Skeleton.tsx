import React, { useEffect } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { radius } from '@/constants/Tokens';

const { width: SW } = Dimensions.get('window');

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radiusSize?: keyof typeof radius;
  style?: StyleProp<ViewStyle>;
}

// Shimmer skeleton: a diagonal highlight sweeps across a dim base on loop.
// Reads as "loading, content coming soon" far more clearly than a plain pulse.
export function Skeleton({
  width = '100%',
  height = 20,
  radiusSize = 'sm',
  style,
}: SkeletonProps) {
  const x = useSharedValue(-1);

  useEffect(() => {
    x.value = withRepeat(
      withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.ease) }),
      -1,
      false,
    );
  }, []);

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value * SW }],
  }));

  return (
    <View
      style={[
        styles.base,
        {
          width: width as any,
          height: height as any,
          borderRadius: radius[radiusSize],
        },
        style,
      ]}
    >
      <Animated.View style={[StyleSheet.absoluteFill, sweepStyle]}>
        <LinearGradient
          colors={[
            'rgba(255,255,255,0)',
            'rgba(255,255,255,0.12)',
            'rgba(255,255,255,0)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export function SkeletonKPI() {
  return (
    <View
      style={{
        flex: 1,
        margin: 4,
        padding: 16,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <Skeleton width="60%" height={12} style={{ marginBottom: 8 }} />
      <Skeleton width="80%" height={24} style={{ marginBottom: 6 }} />
      <Skeleton width="40%" height={10} />
    </View>
  );
}

export function SkeletonRow() {
  return (
    <View
      style={{
        marginHorizontal: 16,
        marginBottom: 10,
        padding: 14,
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
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

const styles = StyleSheet.create({
  base: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    overflow: 'hidden',
  },
});
