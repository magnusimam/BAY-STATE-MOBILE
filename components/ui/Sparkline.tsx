import { useEffect, useMemo } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withDelay,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path, Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface Props {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  delay?: number;
  showFill?: boolean;
  strokeWidth?: number;
}

// Mini line chart with stroke-in reveal on mount. Renders as amber/green/red
// depending on caller color, with an optional gradient fill underneath.
export function Sparkline({
  data,
  width = 80,
  height = 28,
  color = '#f4b942',
  delay = 0,
  showFill = true,
  strokeWidth = 1.8,
}: Props) {
  const progress = useSharedValue(0);
  const uniqueId = useMemo(
    () => `sg-${Math.random().toString(36).slice(2, 8)}`,
    [],
  );

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) }),
    );
  }, [data]);

  const { path, fillPath, last, total } = useMemo(() => {
    if (data.length < 2) {
      return { path: '', fillPath: '', last: { x: 0, y: height / 2 }, total: 0 };
    }
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const padY = 2;
    const innerH = height - padY * 2;

    const points = data.map((v, i) => ({
      x: (i / (data.length - 1)) * width,
      y: padY + (1 - (v - min) / range) * innerH,
    }));

    const line = points
      .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
      .join(' ');

    const fill = `${line} L ${width} ${height} L 0 ${height} Z`;

    // Approximate total path length for stroke-dash reveal
    let len = 0;
    for (let i = 1; i < points.length; i++) {
      const dx = points[i].x - points[i - 1].x;
      const dy = points[i].y - points[i - 1].y;
      len += Math.sqrt(dx * dx + dy * dy);
    }

    return {
      path: line,
      fillPath: fill,
      last: points[points.length - 1],
      total: len,
    };
  }, [data, width, height]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDasharray: total,
    strokeDashoffset: total * (1 - progress.value),
  }));
  const dotProps = useAnimatedProps(() => ({
    opacity: progress.value > 0.92 ? 1 : 0,
  }));
  const fillProps = useAnimatedProps(() => ({
    opacity: progress.value * 0.25,
  }));

  if (!path) return null;

  return (
    <Svg width={width} height={height}>
      {showFill ? (
        <>
          <Defs>
            <SvgGradient id={uniqueId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={color} stopOpacity={0.45} />
              <Stop offset="1" stopColor={color} stopOpacity={0} />
            </SvgGradient>
          </Defs>
          <AnimatedPath d={fillPath} fill={`url(#${uniqueId})`} animatedProps={fillProps} />
        </>
      ) : null}
      <AnimatedPath
        d={path}
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        animatedProps={animatedProps}
      />
      <AnimatedCircle
        cx={last.x}
        cy={last.y}
        r={2.5}
        fill={color}
        animatedProps={dotProps}
      />
    </Svg>
  );
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
