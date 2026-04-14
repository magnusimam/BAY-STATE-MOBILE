import React, { useEffect, useRef } from 'react';
import { Animated, ViewStyle, StyleProp } from 'react-native';
import { timing } from '@/constants/Tokens';

interface FadeInViewProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  style?: StyleProp<ViewStyle>;
}

export function FadeInView({
  children,
  delay = 0,
  duration = timing.base,
  direction = 'up',
  style,
}: FadeInViewProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translate = useRef(new Animated.Value(direction === 'none' ? 0 : 12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translate, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacity, translate, duration, delay]);

  const translateStyle: any = {};
  if (direction === 'up') translateStyle.transform = [{ translateY: translate }];
  if (direction === 'down') translateStyle.transform = [{ translateY: Animated.multiply(translate, -1) }];
  if (direction === 'left') translateStyle.transform = [{ translateX: translate }];
  if (direction === 'right') translateStyle.transform = [{ translateX: Animated.multiply(translate, -1) }];

  return (
    <Animated.View style={[{ opacity }, translateStyle, style]}>
      {children}
    </Animated.View>
  );
}
