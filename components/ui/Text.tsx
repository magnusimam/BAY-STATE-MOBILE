import React from 'react';
import { Text as RNText, TextStyle, StyleProp, TextProps as RNTextProps } from 'react-native';
import { typography, textColor } from '@/constants/Tokens';

interface TextProps extends RNTextProps {
  variant?: keyof typeof typography;
  color?: keyof typeof textColor | string;
  weight?: '400' | '500' | '600' | '700' | '800';
  style?: StyleProp<TextStyle>;
  children?: React.ReactNode;
}

export function Text({
  variant = 'body',
  color = 'primary',
  weight,
  style,
  children,
  ...rest
}: TextProps) {
  const variantStyle = typography[variant];
  const resolvedColor = (color in textColor)
    ? textColor[color as keyof typeof textColor]
    : color;

  return (
    <RNText
      style={[
        variantStyle as TextStyle,
        { color: resolvedColor },
        weight && { fontWeight: weight },
        style,
      ]}
      {...rest}>
      {children}
    </RNText>
  );
}
