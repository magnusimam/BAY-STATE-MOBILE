import React, { useEffect, useRef, useState } from 'react';
import { TextStyle, StyleProp } from 'react-native';
import { Text } from './Text';
import { typography, textColor } from '@/constants/Tokens';

interface AnimatedCounterProps {
  value: number;
  format?: (n: number) => string;
  duration?: number;
  variant?: keyof typeof typography;
  color?: keyof typeof textColor | string;
  style?: StyleProp<TextStyle>;
}

export function AnimatedCounter({
  value,
  format = (n) => n.toLocaleString(),
  duration = 800,
  variant = 'numLg',
  color = 'primary',
  style,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const frameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    startTimeRef.current = Date.now();
    const startValue = displayValue;
    const delta = value - startValue;

    const tick = () => {
      const elapsed = Date.now() - (startTimeRef.current ?? 0);
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
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

  return (
    <Text variant={variant} color={color} style={style}>
      {format(displayValue)}
    </Text>
  );
}
