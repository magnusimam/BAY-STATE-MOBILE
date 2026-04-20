import React, { useEffect, useRef, useState } from 'react';
import { TextStyle, StyleProp } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  Easing,
  type SharedValue,
} from 'react-native-reanimated';
import { Text } from './Text';
import { typography, textColor, semantic } from '@/constants/Tokens';

interface AnimatedCounterProps {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  variant?: keyof typeof typography;
  color?: keyof typeof textColor | string;
  style?: StyleProp<TextStyle>;
  flashOnChange?: boolean;
}

// Counter that eases from previous value to new value, and optionally flashes
// green (up) or red (down) briefly when the value changes — stock-ticker feel.
export function AnimatedCounter({
  value,
  format = (n) => n.toLocaleString(),
  duration = 800,
  variant = 'numLg',
  color = 'primary',
  style,
  flashOnChange = true,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);
  const prevValueRef = useRef(0);
  const flash = useSharedValue(0);
  const flashColor = useRef<string>(semantic.success);

  useEffect(() => {
    startTimeRef.current = Date.now();
    const startValue = displayValue;
    const delta = value - startValue;

    // Trigger delta-flash when value changes after first mount
    if (flashOnChange && prevValueRef.current !== 0 && value !== prevValueRef.current) {
      flashColor.current = value > prevValueRef.current ? semantic.success : semantic.danger;
      flash.value = withSequence(
        withTiming(1, { duration: 120, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 700, easing: Easing.in(Easing.ease) }),
      );
    }
    prevValueRef.current = value;

    const tick = () => {
      const elapsed = Date.now() - (startTimeRef.current ?? 0);
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(startValue + delta * eased);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(tick);
      } else {
        setDisplayValue(value);
      }
    };

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const flashStyle = useAnimatedStyle(() => ({
    opacity: 0.5 + flash.value * 0.5,
    transform: [{ scale: 1 + flash.value * 0.05 }],
  }));

  // Resolve base color: if flash is active we override; else use prop color
  const resolvedColor =
    color && typeof color === 'string' && color in textColor
      ? textColor[color as keyof typeof textColor]
      : typeof color === 'string'
        ? color
        : textColor.primary;

  return (
    <Animated.View style={flashStyle}>
      <FlashText
        text={format(displayValue)}
        variant={variant}
        baseColor={resolvedColor}
        flashColor={flashColor.current}
        flash={flash}
        style={style}
      />
    </Animated.View>
  );
}

// Wraps the Text with animated color interpolation between base and flash
function FlashText({
  text,
  variant,
  baseColor,
  flashColor,
  flash,
  style,
}: {
  text: string;
  variant: keyof typeof typography;
  baseColor: string;
  flashColor: string;
  flash: SharedValue<number>;
  style?: StyleProp<TextStyle>;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    // Blend: t=0 -> baseColor, t=1 -> flashColor
    return {
      color: flash.value > 0.02 ? flashColor : baseColor,
    };
  });

  return (
    <Animated.Text
      style={[
        typography[variant] as TextStyle,
        { color: baseColor },
        animatedStyle,
        style,
      ]}
    >
      {text}
    </Animated.Text>
  );
}
